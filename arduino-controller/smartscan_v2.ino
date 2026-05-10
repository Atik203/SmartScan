/*
 * ============================================================
 * SmartScan v2 — Page Lift + Swipe Automation
 * Arduino Mega 2560
 * ============================================================
 * Mechanism:
 *   Servo 1 (LIFTER)  — lifts / blows page corner up
 *   Servo 2 (SWEEPER) — sweeps across to flip the page
 *
 * Flow per page:
 *   IDLE → LIFT (lifter moves to pos2) → SWIPE (sweeper moves)
 *   → WAIT → Send "CAPTURE" to Pi → Return servos to pos1 → IDLE
 *
 * Controls:
 *   A0 Pot     → calibrate both servos (shared knob)
 *   Btn 22     → Save Pos1 for lifter
 *   Btn 24     → Save Pos2 for lifter
 *   Btn 26     → Save Pos1 for sweeper
 *   Btn 28     → Save Pos2 for sweeper
 *   Btn 34     → Start / Stop automation
 *   Btn 36     → Reset all
 *
 * Serial: 9600 baud → sends "CAPTURE" after each flip
 * ============================================================
 */

#include <Servo.h>
#include <EEPROM.h>

// ── Servo Objects ──────────────────────────────────────────
Servo lifterServo;   // Servo 1 — lifts page corner
Servo sweeperServo;  // Servo 2 — sweeps/flips page

// ── Pin Definitions ───────────────────────────────────────
const int LIFTER_PIN       = 6;
const int SWEEPER_PIN      = 9;
const int POT_PIN          = A0;  // shared calibration pot

const int SAVE_LIFTER_POS1 = 22;
const int SAVE_LIFTER_POS2 = 24;
const int SAVE_SWEEP_POS1  = 26;
const int SAVE_SWEEP_POS2  = 28;

const int AUTOMATION_BTN   = 34;
const int RESET_BTN        = 36;
const int STATUS_LED       = 48;
const int FAN_RELAY_PIN    = 7;

// ── EEPROM Addresses ──────────────────────────────────────
const int EE_LIFT_P1  = 0;
const int EE_LIFT_P2  = 2;
const int EE_SWEEP_P1 = 4;
const int EE_SWEEP_P2 = 6;

// ── Calibrated Positions ──────────────────────────────────
int liftPos1  = -1;  // lifter home (page held down)
int liftPos2  = -1;  // lifter raised (page corner lifted)
int sweepPos1 = -1;  // sweeper home (away from book)
int sweepPos2 = -1;  // sweeper end  (page fully flipped)

// ── Automation State ──────────────────────────────────────
enum AutoState {
  AUTO_IDLE,
  AUTO_LIFTING,
  AUTO_SWEEPING,
  AUTO_WAITING_CAPTURE,
  AUTO_RETURNING,
  AUTO_DONE
};

AutoState autoState  = AUTO_IDLE;
bool      autoActive = false;
unsigned long stateTimer = 0;

// ── Timing (ms) ───────────────────────────────────────────
const int LIFT_DURATION    = 600;   // time to lift page corner
const int SWEEP_DURATION   = 1200;  // time to sweep across
const int CAPTURE_DELAY    = 500;   // settle before CAPTURE signal
const int RETURN_DELAY     = 800;   // time to return to home
const int BETWEEN_PAGES_MS = 2000;  // pause between pages

// ── Button Debounce ───────────────────────────────────────
unsigned long lastBtn22 = 0, lastBtn24 = 0;
unsigned long lastBtn26 = 0, lastBtn28 = 0;
unsigned long lastBtn34 = 0, lastBtn36 = 0;
const int DEBOUNCE_MS = 200;

// ── Helpers ───────────────────────────────────────────────
int readPot() {
  return map(analogRead(POT_PIN), 0, 1023, 0, 180);
}

bool btnPressed(int pin, unsigned long &lastTime) {
  if (digitalRead(pin) == LOW) {
    if (millis() - lastTime > DEBOUNCE_MS) {
      lastTime = millis();
      return true;
    }
  }
  return false;
}

void moveSmooth(Servo &srv, int from, int to, int durationMs) {
  int steps = abs(to - from);
  if (steps == 0) return;
  int delayPerStep = durationMs / steps;
  int dir = (to > from) ? 1 : -1;
  for (int pos = from; pos != to; pos += dir) {
    srv.write(pos);
    delay(delayPerStep);
  }
  srv.write(to);
}

void saveToEEPROM(int addr, int val) {
  EEPROM.write(addr,     val & 0xFF);
  EEPROM.write(addr + 1, (val >> 8) & 0xFF);
}

int readFromEEPROM(int addr) {
  int lo = EEPROM.read(addr);
  int hi = EEPROM.read(addr + 1);
  int val = lo | (hi << 8);
  return (val < 0 || val > 180) ? -1 : val;
}

void blinkLed(int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH); delay(120);
    digitalWrite(STATUS_LED, LOW);  delay(120);
  }
}

bool positionsSaved() {
  return liftPos1 >= 0 && liftPos2 >= 0 &&
         sweepPos1 >= 0 && sweepPos2 >= 0;
}

// ── Setup ─────────────────────────────────────────────────
void setup() {
  Serial.begin(9600);

  lifterServo.attach(LIFTER_PIN);
  sweeperServo.attach(SWEEPER_PIN);

  pinMode(SAVE_LIFTER_POS1, INPUT_PULLUP);
  pinMode(SAVE_LIFTER_POS2, INPUT_PULLUP);
  pinMode(SAVE_SWEEP_POS1,  INPUT_PULLUP);
  pinMode(SAVE_SWEEP_POS2,  INPUT_PULLUP);
  pinMode(AUTOMATION_BTN,   INPUT_PULLUP);
  pinMode(RESET_BTN,        INPUT_PULLUP);
  pinMode(STATUS_LED,       OUTPUT);
  pinMode(FAN_RELAY_PIN,    OUTPUT);

  digitalWrite(FAN_RELAY_PIN, LOW);
  digitalWrite(STATUS_LED,    LOW);

  // Load saved positions from EEPROM
  liftPos1  = readFromEEPROM(EE_LIFT_P1);
  liftPos2  = readFromEEPROM(EE_LIFT_P2);
  sweepPos1 = readFromEEPROM(EE_SWEEP_P1);
  sweepPos2 = readFromEEPROM(EE_SWEEP_P2);

  if (positionsSaved()) {
    lifterServo.write(liftPos1);
    sweeperServo.write(sweepPos1);
    Serial.println("SmartScan v2 ready. Positions loaded from EEPROM.");
    blinkLed(3);
  } else {
    Serial.println("SmartScan v2 ready. Please calibrate positions.");
    blinkLed(1);
  }
}

// ── Main Loop ─────────────────────────────────────────────
void loop() {
  int potDeg = readPot();

  // ── Calibration Buttons ─────────────────────────────────
  if (!autoActive) {
    // Move both servos live with pot for visual calibration
    lifterServo.write(potDeg);
    sweeperServo.write(potDeg);

    // Save Lifter Pos1 (home)
    if (btnPressed(SAVE_LIFTER_POS1, lastBtn22)) {
      liftPos1 = potDeg;
      saveToEEPROM(EE_LIFT_P1, liftPos1);
      Serial.print("Lifter Pos1 saved: "); Serial.println(liftPos1);
      blinkLed(1);
    }
    // Save Lifter Pos2 (raised)
    if (btnPressed(SAVE_LIFTER_POS2, lastBtn24)) {
      liftPos2 = potDeg;
      saveToEEPROM(EE_LIFT_P2, liftPos2);
      Serial.print("Lifter Pos2 saved: "); Serial.println(liftPos2);
      blinkLed(2);
    }
    // Save Sweeper Pos1 (home)
    if (btnPressed(SAVE_SWEEP_POS1, lastBtn26)) {
      sweepPos1 = potDeg;
      saveToEEPROM(EE_SWEEP_P1, sweepPos1);
      Serial.print("Sweeper Pos1 saved: "); Serial.println(sweepPos1);
      blinkLed(1);
    }
    // Save Sweeper Pos2 (flipped)
    if (btnPressed(SAVE_SWEEP_POS2, lastBtn28)) {
      sweepPos2 = potDeg;
      saveToEEPROM(EE_SWEEP_P2, sweepPos2);
      Serial.print("Sweeper Pos2 saved: "); Serial.println(sweepPos2);
      blinkLed(2);
    }
  }

  // ── Reset ────────────────────────────────────────────────
  if (btnPressed(RESET_BTN, lastBtn36)) {
    autoActive = false;
    autoState  = AUTO_IDLE;
    liftPos1 = liftPos2 = sweepPos1 = sweepPos2 = -1;
    for (int a = 0; a < 8; a++) EEPROM.write(a, 0xFF);
    digitalWrite(STATUS_LED, LOW);
    lifterServo.write(90);
    sweeperServo.write(90);
    Serial.println("RESET — all positions cleared.");
    blinkLed(5);
  }

  // ── Start / Stop Automation ──────────────────────────────
  if (btnPressed(AUTOMATION_BTN, lastBtn34)) {
    if (!positionsSaved()) {
      Serial.println("ERROR: Save all 4 positions before starting.");
      blinkLed(5);
    } else {
      autoActive = !autoActive;
      if (autoActive) {
        autoState = AUTO_LIFTING;
        stateTimer = millis();
        digitalWrite(STATUS_LED, HIGH);
        // Fan on during sweep
        digitalWrite(FAN_RELAY_PIN, HIGH);
        Serial.println("AUTOMATION START");
        // Move to home first
        lifterServo.write(liftPos1);
        sweeperServo.write(sweepPos1);
        delay(400);
      } else {
        autoState = AUTO_IDLE;
        digitalWrite(STATUS_LED, LOW);
        digitalWrite(FAN_RELAY_PIN, LOW);
        lifterServo.write(liftPos1);
        sweeperServo.write(sweepPos1);
        Serial.println("AUTOMATION STOPPED");
      }
    }
  }

  // ── Automation State Machine ─────────────────────────────
  if (autoActive) {
    unsigned long now = millis();

    switch (autoState) {

      case AUTO_LIFTING:
        // Smoothly move lifter to raised position
        moveSmooth(lifterServo, liftPos1, liftPos2, LIFT_DURATION);
        autoState  = AUTO_SWEEPING;
        stateTimer = millis();
        break;

      case AUTO_SWEEPING:
        // Sweep across to flip the page
        moveSmooth(sweeperServo, sweepPos1, sweepPos2, SWEEP_DURATION);
        autoState  = AUTO_WAITING_CAPTURE;
        stateTimer = millis();
        break;

      case AUTO_WAITING_CAPTURE:
        if (now - stateTimer >= CAPTURE_DELAY) {
          // Send CAPTURE signal to Pi 5
          Serial.println("CAPTURE");
          digitalWrite(FAN_RELAY_PIN, LOW);
          autoState  = AUTO_RETURNING;
          stateTimer = millis();
        }
        break;

      case AUTO_RETURNING:
        if (now - stateTimer >= 200) {
          // Return both servos to home
          moveSmooth(sweeperServo, sweepPos2, sweepPos1, RETURN_DELAY);
          moveSmooth(lifterServo,  liftPos2,  liftPos1,  RETURN_DELAY);
          autoState  = AUTO_IDLE;
          stateTimer = millis();
          Serial.println("PAGE_COMPLETE");
        }
        break;

      case AUTO_IDLE:
        // Wait between pages then restart cycle
        if (now - stateTimer >= BETWEEN_PAGES_MS) {
          digitalWrite(FAN_RELAY_PIN, HIGH);
          autoState  = AUTO_LIFTING;
          stateTimer = millis();
        }
        break;

      default:
        break;
    }
  }

  delay(10);
}

#include <Servo.h>

// =====================================================
// AUTOMATIC PAGE TURNER
// WITH END OF BOOK + PAGE SUCCESS + JAM DETECTION
// =====================================================

Servo tyre;
Servo lift;
Servo flipper;

// =====================================================
// SENSOR PINS
// =====================================================

const int STACK_SENSOR  = 2; // Sensor 1
const int OUTPUT_SENSOR = 3; // Sensor 2

// =====================================================
// TYRE SERVO
// =====================================================

const int TYRE_STOP = 120;
const int TYRE_TURN = 0;

// =====================================================
// LIFT SERVO
// =====================================================

const int LIFT_UP   = 60;
const int LIFT_DOWN = 180;

// =====================================================
// FLIPPER SERVO
// =====================================================

const int FLIP_RELEASE = 0;
const int FLIP_PRESS   = 180;

// =====================================================
// TIMING
// =====================================================

const unsigned long TYRE_LEAD_TIME  = 150;
const unsigned long TYRE_EXTRA_TIME = 150;

const unsigned long PRESS_HOLD = 3000;
const unsigned long CYCLE_DELAY = 3000;

// =====================================================
// SPEED
// =====================================================

const unsigned long LIFT_SPEED_DELAY = 25;
const unsigned long FLIP_SPEED_DELAY = 5;

// =====================================================

void stopSystem()
{
  tyre.write(TYRE_STOP);
  lift.write(LIFT_UP);
  flipper.write(FLIP_RELEASE);

  Serial.println("SYSTEM STOPPED");

  while (true)
  {
  }
}

void setup()
{
  tyre.attach(8);
  lift.attach(9);
  flipper.attach(11);

  pinMode(STACK_SENSOR, INPUT);
  pinMode(OUTPUT_SENSOR, INPUT);

  Serial.begin(9600);

  tyre.write(TYRE_STOP);
  lift.write(LIFT_UP);
  flipper.write(FLIP_RELEASE);

  delay(1000);
}

void loop()
{
  // =====================================================
  // END OF BOOK CHECK
  // =====================================================

  if (digitalRead(STACK_SENSOR) == HIGH)
  {
    Serial.println("END OF BOOK DETECTED");
    stopSystem();
  }

  // =====================================================
  // STEP 1
  // LOWER TYRE
  // =====================================================

  for (int pos = LIFT_UP; pos <= LIFT_DOWN; pos++)
  {
    lift.write(pos);
    delay(LIFT_SPEED_DELAY);
  }

  delay(100);

  // =====================================================
  // STEP 2
  // START TYRE
  // =====================================================

  tyre.write(TYRE_TURN);

  delay(TYRE_LEAD_TIME);

  // =====================================================
  // STEP 3
  // LIFT + FLIPPER SIMULTANEOUS
  // =====================================================

  int liftPos = LIFT_DOWN;
  int flipPos = FLIP_RELEASE;

  unsigned long lastLiftMove = millis();
  unsigned long lastFlipMove = millis();

  bool liftFinished = false;
  bool flipStarted = false;
  bool flipFinished = false;

  while (!liftFinished || !flipFinished)
  {
    unsigned long now = millis();

    // -----------------------
    // LIFT
    // -----------------------

    if (!liftFinished &&
        now - lastLiftMove >= LIFT_SPEED_DELAY)
    {
      lastLiftMove = now;

      liftPos--;

      lift.write(liftPos);

      if (liftPos <= LIFT_UP)
      {
        liftFinished = true;
      }
    }

    // -----------------------
    // FLIPPER START AT 50%
    // -----------------------

    if (liftPos <= 120)
    {
      flipStarted = true;
    }

    // -----------------------
    // FLIPPER
    // -----------------------

    if (flipStarted &&
        !flipFinished &&
        now - lastFlipMove >= FLIP_SPEED_DELAY)
    {
      lastFlipMove = now;

      flipPos++;

      flipper.write(flipPos);

      if (flipPos >= FLIP_PRESS)
      {
        flipFinished = true;
      }
    }
  }

  // =====================================================
  // STEP 4
  // KEEP TYRE RUNNING
  // =====================================================

  delay(TYRE_EXTRA_TIME);

  tyre.write(TYRE_STOP);

  // =====================================================
  // STEP 5
  // HOLD FLIPPER
  // =====================================================

  unsigned long holdStart = millis();

  while (millis() - holdStart < PRESS_HOLD)
  {
    flipper.write(FLIP_PRESS);
  }

  // =====================================================
  // STEP 6
  // RELEASE FLIPPER
  // =====================================================

  for (int pos = FLIP_PRESS; pos >= FLIP_RELEASE; pos--)
  {
    flipper.write(pos);
    delay(FLIP_SPEED_DELAY);
  }

  // =====================================================
  // PAGE TURN VERIFICATION
  // =====================================================

  delay(300);

  if (digitalRead(OUTPUT_SENSOR) == HIGH)
  {
    Serial.println("PAGE TURN FAILED");
    Serial.println("JAM DETECTED");

    stopSystem();
  }

  Serial.println("PAGE TURN SUCCESS");

  // =====================================================
  // NEXT PAGE
  // =====================================================

  delay(CYCLE_DELAY);
}
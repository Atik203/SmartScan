#include <Servo.h>

// Create servo objects for gripper mechanism
Servo gripperServo1;
Servo gripperServo2;

// Create servo objects for flipper mechanism
Servo flipperServo1;
Servo flipperServo2;

// Pin definitions for gripper mechanism
const int GRIPPER_SERVO1_PIN = 6;
const int GRIPPER_SERVO2_PIN = 9;
const int GRIPPER_POT_PIN = A0;
const int GRIPPER_SAVE_BTN = 22;
const int GRIPPER_PLAY_PAUSE_BTN = 24;
const int GRIPPER_RESET_BTN = 26;
const int GRIPPER_LED_PIN = 52;

// Pin definitions for flipper mechanism
const int FLIPPER_SERVO1_PIN = 10;
const int FLIPPER_SERVO2_PIN = 11;
const int FLIPPER_POT_PIN = A1;
const int FLIPPER_SAVE_BTN = 28;
const int FLIPPER_PLAY_PAUSE_BTN = 30;
const int FLIPPER_RESET_BTN = 32;
const int FLIPPER_LED_PIN = 50;

// Pin definition for fan relay control
const int FAN_RELAY_PIN = 7;  // Define the relay pin - change to match your wiring
const int FAN_ACTIVATION_THRESHOLD = 50;  // Degrees before position 2 to turn on fan
const int FAN_DEACTIVATION_TIME = 1000;  // Milliseconds before leaving position 2 to turn off fan

// Pin definitions for overall automation control
const int AUTOMATION_START_STOP_BTN = 34;
const int AUTOMATION_RESET_BTN = 36;
const int AUTOMATION_LED_PIN = 48;  // Added a dedicated LED for automation status

// Variables for position storage for gripper mechanism
int gripperPos1Servo1 = -1;
int gripperPos1Servo2 = -1;
int gripperPos2Servo1 = -1;
int gripperPos2Servo2 = -1;
int gripperCurrentPos1, gripperCurrentPos2;
int gripperLastPotValue = 0;

// Variables for position storage for flipper mechanism
int flipperPos1Servo1 = -1;
int flipperPos1Servo2 = -1;
int flipperPos2Servo1 = -1;
int flipperPos2Servo2 = -1;
int flipperCurrentPos1, flipperCurrentPos2;
int flipperLastPotValue = 0;

// Playback control variables for gripper mechanism
int gripperTargetPos1, gripperTargetPos2;
unsigned long gripperMoveStartTime;
bool isGripperMoving = false;
bool gripperDecelerate = false;

// Playback control variables for flipper mechanism
int flipperTargetPos1, flipperTargetPos2;
unsigned long flipperMoveStartTime;
bool isFlipperMoving = false;
bool flipperDecelerate = false;

// Fan control variables
bool isFanOn = false;
unsigned long fanTurnOffTime = 0;

// State variables for gripper mechanism
bool isGripperFirstPosition = true;
bool isGripperPlaying = false;
bool gripperMovingToPos1 = true;
bool gripperPositionsSaved = false;
const int GRIPPER_MOVE_DELAY = 1000;  // Reduced delay for faster movement

// State variables for flipper mechanism
bool isFlipperFirstPosition = true;
bool isFlipperPlaying = false;
bool flipperMovingToPos1 = true;
bool flipperPositionsSaved = false;
const int FLIPPER_MOVE_DELAY = 1000;  // Delay for slower movement (30 speed)

// Complete pause tracking for gripper mechanism
int gripperPausedTargetPos1 = -1;
int gripperPausedTargetPos2 = -1;
bool wasGripperPaused = false;
bool wasGripperMoving = false;

// Complete pause tracking for flipper mechanism
int flipperPausedTargetPos1 = -1;
int flipperPausedTargetPos2 = -1;
bool wasFlipperPaused = false;
bool wasFlipperMoving = false;

// Button debounce variables for gripper mechanism
unsigned long lastGripperSaveDebounceTime = 0;
unsigned long lastGripperPlayPauseDebounceTime = 0;
unsigned long lastGripperResetDebounceTime = 0;
const unsigned long DEBOUNCE_DELAY = 50;
int lastGripperSaveState = HIGH;
int lastGripperPlayPauseState = HIGH;
int lastGripperResetState = HIGH;

// Button debounce variables for flipper mechanism
unsigned long lastFlipperSaveDebounceTime = 0;
unsigned long lastFlipperPlayPauseDebounceTime = 0;
unsigned long lastFlipperResetDebounceTime = 0;
int lastFlipperSaveState = HIGH;
int lastFlipperPlayPauseState = HIGH;
int lastFlipperResetState = HIGH;

// Button debounce variables for automation
unsigned long lastAutomationStartStopDebounceTime = 0;
unsigned long lastAutomationResetDebounceTime = 0;
int lastAutomationStartStopState = HIGH;
int lastAutomationResetState = HIGH;

// Automation state variables
bool isAutomationRunning = false;
bool wasAutomationPaused = false;
enum AutomationState {
  IDLE,
  GRIPPER_CYCLE,
  GRIPPER_WAIT_POS2,  // New state for waiting at position 2
  GRIPPER_WAIT_POS1,  // New state for waiting at position 1
  FLIPPER_CYCLE,
  FLIPPER_WAIT_POS2,  // New state for waiting at position 2
  FLIPPER_WAIT_POS1,  // New state for waiting at position 1
  COMPLETED_CYCLE
};
AutomationState automationState = IDLE;
bool gripperCompletedCycle = false;
bool flipperCompletedCycle = false;
unsigned long cycleStartTime = 0;
const unsigned long MECHANISM_SWITCH_DELAY = 500; // Delay between mechanism cycles

// Wait times for each position during automation
const unsigned long GRIPPER_POS2_WAIT = 2000;  // 2 second wait at position 2
const unsigned long GRIPPER_POS1_WAIT = 1000;  // 1 second wait at position 1
const unsigned long FLIPPER_POS2_WAIT = 500;   // 0.5 second wait at position 2
const unsigned long FLIPPER_POS1_WAIT = 1000;  // 1 second wait at position 1

// New variables for smooth initialization
bool initializationComplete = false;
int initialPotGripperValue = 0;
int initialPotFlipperValue = 0;

void setup() {
  Serial.begin(9600); //  This starts serial communication with the Pi
  
  // Setup for gripper mechanism
  pinMode(GRIPPER_SAVE_BTN, INPUT_PULLUP);
  pinMode(GRIPPER_PLAY_PAUSE_BTN, INPUT_PULLUP);
  pinMode(GRIPPER_RESET_BTN, INPUT_PULLUP);
  pinMode(GRIPPER_LED_PIN, OUTPUT);

  // Setup for flipper mechanism
  pinMode(FLIPPER_SAVE_BTN, INPUT_PULLUP);
  pinMode(FLIPPER_PLAY_PAUSE_BTN, INPUT_PULLUP);
  pinMode(FLIPPER_RESET_BTN, INPUT_PULLUP);
  pinMode(FLIPPER_LED_PIN, OUTPUT);
  
  // Setup for fan relay control
  pinMode(FAN_RELAY_PIN, OUTPUT);
  digitalWrite(FAN_RELAY_PIN, LOW);  // Initially fan is off
  
  // Setup for automation control
  pinMode(AUTOMATION_START_STOP_BTN, INPUT_PULLUP);
  pinMode(AUTOMATION_RESET_BTN, INPUT_PULLUP);
  pinMode(AUTOMATION_LED_PIN, OUTPUT);
  
  // Attach servos
  gripperServo1.attach(GRIPPER_SERVO1_PIN);
  gripperServo2.attach(GRIPPER_SERVO2_PIN);
  flipperServo1.attach(FLIPPER_SERVO1_PIN);
  flipperServo2.attach(FLIPPER_SERVO2_PIN);
  
  // Read initial potentiometer positions
  initialPotGripperValue = analogRead(GRIPPER_POT_PIN);
  initialPotFlipperValue = analogRead(FLIPPER_POT_PIN);
  
  // Set initial servo positions based on potentiometer values
  gripperCurrentPos1 = map(initialPotGripperValue, 0, 1023, 0, 180);
  gripperCurrentPos2 = 180 - gripperCurrentPos1;
  
  flipperCurrentPos1 = map(initialPotFlipperValue, 0, 1023, 0, 180);
  flipperCurrentPos2 = 180 - flipperCurrentPos1;
  
  // Set servos to match potentiometer position immediately
  gripperServo1.write(gripperCurrentPos1);
  gripperServo2.write(gripperCurrentPos2);
  
  flipperServo1.write(flipperCurrentPos1);
  flipperServo2.write(flipperCurrentPos2);
  
  // Store last potentiometer values
  gripperLastPotValue = initialPotGripperValue;
  flipperLastPotValue = initialPotFlipperValue;
  
  // Short delay to allow servos to reach position
  delay(100);
  
  // Initialization complete
  initializationComplete = true;
}

void loop() {
  // Handle individual mechanism controls when automation is not running
  if (!isAutomationRunning) {
    // Handle gripper mechanism
    handleGripperSaveButton();
    handleGripperPlayPauseButton();
    handleGripperResetButton();

    if (!isGripperPlaying) {
      handleGripperManualControl();
    } else {
      handleGripperPlayback();
    }

    // Handle flipper mechanism
    handleFlipperSaveButton();
    handleFlipperPlayPauseButton();
    handleFlipperResetButton();

    if (!isFlipperPlaying) {
      handleFlipperManualControl();
    } else {
      handleFlipperPlayback();
    }
  } else {
    // When automation is running, handle the automated sequence
    handleAutomatedSequence();
  }

  // Handle fan control in all modes (manual and automation)
  updateFanControl();

  // Always handle the automation control buttons
  handleAutomationStartStopButton();
  handleAutomationResetButton();
}

// New function to handle fan control based on flipper position
// Function to update fan control based on flipper position
void updateFanControl() {
  // If not in automated mode and the flipper is manually playing
  if (!isAutomationRunning && isFlipperPlaying) {
    // Check if flipper is moving to position 2 (not position 1)
    if (isFlipperMoving && !flipperMovingToPos1) {
      int current1 = flipperServo1.read();
      int threshold = flipperPos2Servo1 - FAN_ACTIVATION_THRESHOLD;
      
      // Check if we're approaching position 2 and should turn on fan
      if (!isFanOn && current1 >= threshold) {
        turnFanOn();
      }
    }
    // Check if we need to turn off the fan when at position 2 before moving back
    else if (!isFlipperMoving && !flipperMovingToPos1 && isFanOn) {
      if (fanTurnOffTime == 0) {
        // Set up a timer to turn off the fan before movement starts
        fanTurnOffTime = millis() + (FLIPPER_MOVE_DELAY - FAN_DEACTIVATION_TIME);
      }
      else if (millis() >= fanTurnOffTime) {
        turnFanOff();
        fanTurnOffTime = 0;
      }
    }
    // Reset the fan turn-off timer if we've started moving to position 1
    else if (flipperMovingToPos1) {
      if (isFanOn) {
        turnFanOff();
      }
      fanTurnOffTime = 0;
    }
  }
}

// Function to turn fan on
void turnFanOn() {
  if (!isFanOn) {
    digitalWrite(FAN_RELAY_PIN, HIGH);
    isFanOn = true;
  }
}

// Function to turn fan off
void turnFanOff() {
  if (isFanOn) {
    digitalWrite(FAN_RELAY_PIN, LOW);
    isFanOn = false;
  }
}

// Gripper mechanism functions
void handleGripperManualControl() {
  int potValue = analogRead(GRIPPER_POT_PIN);
  if (abs(potValue - gripperLastPotValue) > 5) {  
    gripperCurrentPos1 = map(potValue, 0, 1023, 0, 180);
    gripperServo1.write(gripperCurrentPos1);
    gripperServo2.write(180 - gripperCurrentPos1);
    gripperLastPotValue = potValue;
  }
}

void handleGripperSaveButton() {
  int reading = digitalRead(GRIPPER_SAVE_BTN);
  if (reading != lastGripperSaveState) {
    lastGripperSaveDebounceTime = millis();
  }
  if ((millis() - lastGripperSaveDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {  
      if (isGripperFirstPosition) {
        gripperPos1Servo1 = gripperServo1.read();
        gripperPos1Servo2 = gripperServo2.read();
        isGripperFirstPosition = false;
        blinkLED(GRIPPER_LED_PIN, 1);
      } else {
        gripperPos2Servo1 = gripperServo1.read();
        gripperPos2Servo2 = gripperServo2.read();
        isGripperFirstPosition = true;
        gripperPositionsSaved = true;
        blinkLED(GRIPPER_LED_PIN, 2);
      }
      while(digitalRead(GRIPPER_SAVE_BTN) == LOW);
    }
  }
  lastGripperSaveState = reading;
}

void handleGripperPlayPauseButton() {
  if (!gripperPositionsSaved) return;
  int reading = digitalRead(GRIPPER_PLAY_PAUSE_BTN);
  if (reading != lastGripperPlayPauseState) {
    lastGripperPlayPauseDebounceTime = millis();
  }
  if ((millis() - lastGripperPlayPauseDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {
      if (isGripperPlaying) {
        gripperPausedTargetPos1 = gripperTargetPos1;
        gripperPausedTargetPos2 = gripperTargetPos2;
        wasGripperMoving = isGripperMoving;
        wasGripperPaused = true;
      } else {
        wasGripperPaused = true;
      }
      
      isGripperPlaying = !isGripperPlaying;
      
      blinkLED(GRIPPER_LED_PIN, 3);
      while(digitalRead(GRIPPER_PLAY_PAUSE_BTN) == LOW);
    }
  }
  lastGripperPlayPauseState = reading;
}

void handleGripperResetButton() {
  int reading = digitalRead(GRIPPER_RESET_BTN);
  if (reading != lastGripperResetState) {
    lastGripperResetDebounceTime = millis();
  }
  if ((millis() - lastGripperResetDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {  
      resetGripperMechanism();
      blinkLED(GRIPPER_LED_PIN, 4);
      while(digitalRead(GRIPPER_RESET_BTN) == LOW);
    }
  }
  lastGripperResetState = reading;
}

void handleGripperPlayback() {
  if (wasGripperPaused) {
    if (wasGripperMoving) {
      gripperTargetPos1 = gripperPausedTargetPos1;
      gripperTargetPos2 = gripperPausedTargetPos2;
      isGripperMoving = true;
    }
    wasGripperPaused = false;
    wasGripperMoving = false;
  } 
  else if (!isGripperMoving) {
    if (millis() - gripperMoveStartTime >= GRIPPER_MOVE_DELAY) {
      if (gripperMovingToPos1) {
        gripperTargetPos1 = gripperPos1Servo1;
        gripperTargetPos2 = gripperPos1Servo2;
      } else {
        gripperTargetPos1 = gripperPos2Servo1;
        gripperTargetPos2 = gripperPos2Servo2;
      }
      isGripperMoving = true;
      gripperMoveStartTime = millis();
    }
  }
  
  if (isGripperMoving) {
    updateGripperServoPosition();
  }
}

void updateGripperServoPosition() {
  int current1 = gripperServo1.read();
  int current2 = gripperServo2.read();
  int remaining = abs(gripperTargetPos1 - current1);
  int stepDelay = (remaining <= 20 && gripperMovingToPos1) ? 20 : 5; // Slow down when approaching pos2
  if (millis() - gripperMoveStartTime >= stepDelay) {
    if (current1 != gripperTargetPos1) {
      current1 += (gripperTargetPos1 > current1) ? 1 : -1;
      gripperServo1.write(current1);
    }
    if (current2 != gripperTargetPos2) {
      current2 += (gripperTargetPos2 > current2) ? 1 : -1;
      gripperServo2.write(current2);
    }
    gripperMoveStartTime = millis();
  }
  if (current1 == gripperTargetPos1 && current2 == gripperTargetPos2) {
    isGripperMoving = false;
    gripperMovingToPos1 = !gripperMovingToPos1;
    gripperMoveStartTime = millis();
  }
}

// Flipper mechanism functions
void handleFlipperManualControl() {
  int potValue = analogRead(FLIPPER_POT_PIN);
  if (abs(potValue - flipperLastPotValue) > 5) {  
    flipperCurrentPos1 = map(potValue, 0, 1023, 0, 180);
    flipperServo1.write(flipperCurrentPos1);
    flipperServo2.write(180 - flipperCurrentPos1);
    flipperLastPotValue = potValue;
  }
}

void handleFlipperSaveButton() {
  int reading = digitalRead(FLIPPER_SAVE_BTN);
  if (reading != lastFlipperSaveState) {
    lastFlipperSaveDebounceTime = millis();
  }
  if ((millis() - lastFlipperSaveDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {  
      if (isFlipperFirstPosition) {
        flipperPos1Servo1 = flipperServo1.read();
        flipperPos1Servo2 = flipperServo2.read();
        isFlipperFirstPosition = false;
        blinkLED(FLIPPER_LED_PIN, 1);
      } else {
        flipperPos2Servo1 = flipperServo1.read();
        flipperPos2Servo2 = flipperServo2.read();
        isFlipperFirstPosition = true;
        flipperPositionsSaved = true;
        blinkLED(FLIPPER_LED_PIN, 2);
      }
      while(digitalRead(FLIPPER_SAVE_BTN) == LOW);
    }
  }
  lastFlipperSaveState = reading;
}

void handleFlipperPlayPauseButton() {
  if (!flipperPositionsSaved) return;
  int reading = digitalRead(FLIPPER_PLAY_PAUSE_BTN);
  if (reading != lastFlipperPlayPauseState) {
    lastFlipperPlayPauseDebounceTime = millis();
  }
  if ((millis() - lastFlipperPlayPauseDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {
      if (isFlipperPlaying) {
        flipperPausedTargetPos1 = flipperTargetPos1;
        flipperPausedTargetPos2 = flipperTargetPos2;
        wasFlipperMoving = isFlipperMoving;
        wasFlipperPaused = true;
      } else {
        wasFlipperPaused = true;
      }
      
      isFlipperPlaying = !isFlipperPlaying;
      
      blinkLED(FLIPPER_LED_PIN, 3);
      while(digitalRead(FLIPPER_PLAY_PAUSE_BTN) == LOW);
    }
  }
  lastFlipperPlayPauseState = reading;
}

void handleFlipperResetButton() {
  int reading = digitalRead(FLIPPER_RESET_BTN);
  if (reading != lastFlipperResetState) {
    lastFlipperResetDebounceTime = millis();
  }
  if ((millis() - lastFlipperResetDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {  
      resetFlipperMechanism();
      blinkLED(FLIPPER_LED_PIN, 4);
      while(digitalRead(FLIPPER_RESET_BTN) == LOW);
    }
  }
  lastFlipperResetState = reading;
}

void handleFlipperPlayback() {
  if (wasFlipperPaused) {
    if (wasFlipperMoving) {
      flipperTargetPos1 = flipperPausedTargetPos1;
      flipperTargetPos2 = flipperPausedTargetPos2;
      isFlipperMoving = true;
    }
    wasFlipperPaused = false;
    wasFlipperMoving = false;
  } 
  else if (!isFlipperMoving) {
    if (millis() - flipperMoveStartTime >= FLIPPER_MOVE_DELAY) {
      if (flipperMovingToPos1) {
        flipperTargetPos1 = flipperPos1Servo1;
        flipperTargetPos2 = flipperPos1Servo2;
      } else {
        flipperTargetPos1 = flipperPos2Servo1;
        flipperTargetPos2 = flipperPos2Servo2;
      }
      isFlipperMoving = true;
      flipperMoveStartTime = millis();
      
      // Reset the fan turn-off timer when starting a new movement
      fanTurnOffTime = 0;
    }
  }
  
  if (isFlipperMoving) {
    updateFlipperServoPosition();
  }
}

void updateFlipperServoPosition() {
  int current1 = flipperServo1.read();
  int current2 = flipperServo2.read();
  
  // Change to match the first code's speed (constant 50ms delay)
  int stepDelay = 50; // Changed from variable speed to constant 50ms like in first code
  
  if (millis() - flipperMoveStartTime >= stepDelay) {
    if (current1 != flipperTargetPos1) {
      current1 += (flipperTargetPos1 > current1) ? 1 : -1;
      flipperServo1.write(current1);
    }
    if (current2 != flipperTargetPos2) {
      current2 += (flipperTargetPos2 > current2) ? 1 : -1;
      flipperServo2.write(current2);
    }
    flipperMoveStartTime = millis();
  }
  if (current1 == flipperTargetPos1 && current2 == flipperTargetPos2) {
    isFlipperMoving = false;
    flipperMovingToPos1 = !flipperMovingToPos1;
    flipperMoveStartTime = millis();
    
    // If we just reached position 2, setup the time to turn off the fan before moving back
    if (!flipperMovingToPos1 && isFanOn) {
      fanTurnOffTime = millis() + (FLIPPER_MOVE_DELAY - FAN_DEACTIVATION_TIME);
    }
  }
}

// Automation control functions
void handleAutomationStartStopButton() {
  // Only allow automation to start if both mechanisms have positions saved
  if (!gripperPositionsSaved || !flipperPositionsSaved) return;
  
  int reading = digitalRead(AUTOMATION_START_STOP_BTN);
  if (reading != lastAutomationStartStopState) {
    lastAutomationStartStopDebounceTime = millis();
  }
  if ((millis() - lastAutomationStartStopDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {
      isAutomationRunning = !isAutomationRunning;
      
      if (isAutomationRunning) {
        // If starting automation, initialize state
        if (!wasAutomationPaused) {
          automationState = GRIPPER_CYCLE;
          gripperCompletedCycle = false;
          flipperCompletedCycle = false;
          
          // Ensure both mechanisms are at first position to start
          ensureGripperAtFirstPosition();
          ensureFlipperAtFirstPosition();
          
          cycleStartTime = millis();
        }
        
        wasAutomationPaused = false;
        digitalWrite(AUTOMATION_LED_PIN, HIGH); // Turn on LED when automation is running
      } else {
        // Pause the automation
        wasAutomationPaused = true;
        digitalWrite(AUTOMATION_LED_PIN, LOW); // Turn off LED when automation is paused
        
        // Turn off fan when automation is stopped
        turnFanOff();
      }
      
      blinkLED(AUTOMATION_LED_PIN, 3);
      while(digitalRead(AUTOMATION_START_STOP_BTN) == LOW);
    }
  }
  lastAutomationStartStopState = reading;
}

void handleAutomationResetButton() {
  int reading = digitalRead(AUTOMATION_RESET_BTN);
  if (reading != lastAutomationResetState) {
    lastAutomationResetDebounceTime = millis();
  }
  if ((millis() - lastAutomationResetDebounceTime) > DEBOUNCE_DELAY) {
    if (reading == LOW) {
      // Reset automation
      isAutomationRunning = false;
      wasAutomationPaused = false;
      automationState = IDLE;
      
      // Turn off fan when automation is reset
      turnFanOff();
      
      // Reset both mechanisms
      resetGripperMechanism();
      resetFlipperMechanism();
      
      // Complete reset including saved positions
      gripperPositionsSaved = false;
      flipperPositionsSaved = false;
      
      digitalWrite(AUTOMATION_LED_PIN, LOW);
      blinkLED(AUTOMATION_LED_PIN, 4);
      while(digitalRead(AUTOMATION_RESET_BTN) == LOW);
    }
  }
  lastAutomationResetState = reading;
}

void handleAutomatedSequence() {
  switch (automationState) {
    case GRIPPER_CYCLE:
      // Move gripper from position 1 to position 2
      if (!isGripperMoving) {
        // Start movement to position 2
        gripperTargetPos1 = gripperPos2Servo1;
        gripperTargetPos2 = gripperPos2Servo2;
        isGripperMoving = true;
        
        // ðŸ”½ Send signal to Pi to capture image
        if (isAutomationRunning) {
          Serial.println("CAPTURE");
        }
        gripperMoveStartTime = millis();
      } else {
        // Continue updating servo positions
        updateGripperServoPosition();

        
        // If we've reached position 2, switch to wait state
        if (!isGripperMoving) {
          automationState = GRIPPER_WAIT_POS2;
          cycleStartTime = millis();
        }
      }
      break;
      
    case GRIPPER_WAIT_POS2:
      // Wait at position 2 for the specified time
      if (millis() - cycleStartTime >= GRIPPER_POS2_WAIT) {
        // Start movement back to position 1
        gripperTargetPos1 = gripperPos1Servo1;
        gripperTargetPos2 = gripperPos1Servo2;
        isGripperMoving = true;
        gripperMoveStartTime = millis();
        automationState = GRIPPER_WAIT_POS1;
      }
      break;
      
    case GRIPPER_WAIT_POS1:
      // Continue movement to position 1
      if (isGripperMoving) {
        updateGripperServoPosition();
      } else {
        // We've reached position 1, wait for the specified time
        if (millis() - gripperMoveStartTime >= GRIPPER_POS1_WAIT) {
          // Gripper cycle is complete, move to flipper
          automationState = FLIPPER_CYCLE;
          cycleStartTime = millis();
        }
      }
      break;
      
    case FLIPPER_CYCLE:
      // Move flipper from position 1 to position 2
      if (!isFlipperMoving) {
        // Start movement to position 2
        flipperTargetPos1 = flipperPos2Servo1;
        flipperTargetPos2 = flipperPos2Servo2;
        isFlipperMoving = true;
        flipperMoveStartTime = millis();
      } else {
        // Continue updating servo positions
        updateFlipperServoPosition();
        
        // Check if we're approaching position 2 and need to turn on fan
        if (!isFanOn) {
          int current1 = flipperServo1.read();
          int threshold = flipperPos2Servo1 - FAN_ACTIVATION_THRESHOLD;
          
          if (current1 >= threshold) {
            turnFanOn();
          }
        }
        
        // If we've reached position 2, switch to wait state
        // If we've reached position 2, switch to wait state
        if (!isFlipperMoving) {
          automationState = FLIPPER_WAIT_POS2;
          cycleStartTime = millis();
        }
      }
      break;
      
    case FLIPPER_WAIT_POS2:
      // Wait at position 2 for the specified time
      if (millis() - cycleStartTime >= FLIPPER_POS2_WAIT) {
        // Turn off fan before moving back
        if (isFanOn && fanTurnOffTime == 0) {
          fanTurnOffTime = millis() + FAN_DEACTIVATION_TIME;
        }
        
        if (!isFanOn || millis() >= fanTurnOffTime) {
          if (isFanOn) {
            turnFanOff();
            fanTurnOffTime = 0;
          }
          
          // Start movement back to position 1
          flipperTargetPos1 = flipperPos1Servo1;
          flipperTargetPos2 = flipperPos1Servo2;
          isFlipperMoving = true;
          flipperMoveStartTime = millis();
          automationState = FLIPPER_WAIT_POS1;
        }
      }
      break;
      
    case FLIPPER_WAIT_POS1:
      // Continue movement to position 1
      if (isFlipperMoving) {
        updateFlipperServoPosition();
      } else {
        // We've reached position 1, wait for the specified time
        if (millis() - flipperMoveStartTime >= FLIPPER_POS1_WAIT) {
          // Flipper cycle is complete, start new cycle from gripper
          automationState = COMPLETED_CYCLE;
          cycleStartTime = millis();
        }
      }
      break;
      
    case COMPLETED_CYCLE:
      // Wait a short delay between complete cycles
      if (millis() - cycleStartTime >= MECHANISM_SWITCH_DELAY) {
        // Start a new cycle from the beginning
        automationState = GRIPPER_CYCLE;
        cycleStartTime = millis();
      }
      break;
      
    case IDLE:
    default:
      // Idle state, do nothing
      break;
  }
}

// Helper functions for automation
void ensureGripperAtFirstPosition() {
  // Ensure gripper is at position 1 to start automation
  int current1 = gripperServo1.read();
  int current2 = gripperServo2.read();
  
  if (current1 != gripperPos1Servo1 || current2 != gripperPos1Servo2) {
    gripperTargetPos1 = gripperPos1Servo1;
    gripperTargetPos2 = gripperPos1Servo2;
    isGripperMoving = true;
    gripperMoveStartTime = millis();
    
    // Move to position 1
    while (isGripperMoving) {
      updateGripperServoPosition();
      delay(10);
    }
  }
}

void ensureFlipperAtFirstPosition() {
  // Ensure flipper is at position 1 to start automation
  int current1 = flipperServo1.read();
  int current2 = flipperServo2.read();
  
  if (current1 != flipperPos1Servo1 || current2 != flipperPos1Servo2) {
    flipperTargetPos1 = flipperPos1Servo1;
    flipperTargetPos2 = flipperPos1Servo2;
    isFlipperMoving = true;
    flipperMoveStartTime = millis();
    
    // Move to position 1
    while (isFlipperMoving) {
      updateFlipperServoPosition();
      delay(10);
    }
  }
  
  // Ensure fan is off when starting
  turnFanOff();
}

// Reset functions
void resetGripperMechanism() {
  isGripperPlaying = false;
  isGripperMoving = false;
  gripperMovingToPos1 = true;
  isGripperFirstPosition = true;
  
  // Reset the servo position based on current pot position
  int potValue = analogRead(GRIPPER_POT_PIN);
  gripperCurrentPos1 = map(potValue, 0, 1023, 0, 180);
  gripperServo1.write(gripperCurrentPos1);
  gripperServo2.write(180 - gripperCurrentPos1);
  gripperLastPotValue = potValue;
}

void resetFlipperMechanism() {
  isFlipperPlaying = false;
  isFlipperMoving = false;
  flipperMovingToPos1 = true;
  isFlipperFirstPosition = true;
  
  // Reset the servo position based on current pot position
  int potValue = analogRead(FLIPPER_POT_PIN);
  flipperCurrentPos1 = map(potValue, 0, 1023, 0, 180);
  flipperServo1.write(flipperCurrentPos1);
  flipperServo2.write(180 - flipperCurrentPos1);
  flipperLastPotValue = potValue;
  
  // Ensure fan is off when reset
  turnFanOff();
}

// Utility function for LED feedback
void blinkLED(int ledPin, int times) {
  for (int i = 0; i < times; i++) {
    digitalWrite(ledPin, HIGH);
    delay(100);
    digitalWrite(ledPin, LOW);
    delay(100);
  }
  
  // If it's the automation LED, restore its state after blinking
  if (ledPin == AUTOMATION_LED_PIN && isAutomationRunning) {
    digitalWrite(AUTOMATION_LED_PIN, HIGH);
  }
}

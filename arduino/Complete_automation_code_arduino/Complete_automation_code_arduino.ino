#include <Servo.h>

Servo fan;
Servo fliper;

void setup() {

  fan.attach(8);
  fliper.attach(11);

  fan.write(180);
  fliper.write(140);

  delay(1000);
}

void loop() {

  // 🔵 STEP 1: FAN 180 → 100
  for (int pos = 180; pos >= 0; pos--) {
    fan.write(pos);
    delay(25);
  }


  // 🔥 NO DELAY — START FLIPPER IMMEDIATELY

  // 🔵 STEP 2: FLIP PAGE (100 → 0)
  for (int pos = 140; pos >= 0; pos--) {
    fliper.write(pos);
    delay(5);
  }

  delay(200);

  // Flipper return under page
  for (int pos = 0; pos <= 140; pos++) {
    fliper.write(pos);
    delay(5);
  }

  delay(200);

  // 🔵 STEP 3: FAN 100 → 180
  for (int pos = 0; pos <= 180; pos++) {
    fan.write(pos);
    delay(10);
  }

  delay(3500);
}
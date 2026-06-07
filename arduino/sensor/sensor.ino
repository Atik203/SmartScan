const int SENSOR_PIN = A0;

void setup()
{
  Serial.begin(9600);
  Serial.println("TCRT5000 ANALOG SURFACE TEST");
  Serial.println("Move different surfaces under sensor...");
  Serial.println("--------------------------------------");
}

void loop()
{
  int value = analogRead(SENSOR_PIN);

  Serial.print("Sensor Value: ");
  Serial.print(value);

  // Simple interpretation guide
  if (value < 200)
  {
    Serial.println("  -> VERY CLOSE / HIGH REFLECTION (white paper)");
  }
  else if (value < 500)
  {
    Serial.println("  -> MEDIUM REFLECTION (book/page/skin)");
  }
  else if (value < 800)
  {
    Serial.println("  -> LOW REFLECTION (dark surface)");
  }
  else
  {
    Serial.println("  -> NO OBJECT / AIR");
  }

  delay(200);
}
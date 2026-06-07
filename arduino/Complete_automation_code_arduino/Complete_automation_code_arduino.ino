const int STACK_SENSOR  = 2;
const int OUTPUT_SENSOR = 3;

void setup()
{
  Serial.begin(9600);

  pinMode(STACK_SENSOR, INPUT);
  pinMode(OUTPUT_SENSOR, INPUT);

  Serial.println("TCRT5000 Sensor Test");
  Serial.println("--------------------");
}

void loop()
{
  int stackState = digitalRead(STACK_SENSOR);
  int outputState = digitalRead(OUTPUT_SENSOR);

  Serial.print("STACK_SENSOR: ");
  Serial.print(stackState);

  if (stackState == HIGH)
    Serial.print(" (HIGH)");
  else
    Serial.print(" (LOW)");

  Serial.print("    OUTPUT_SENSOR: ");
  Serial.print(outputState);

  if (outputState == HIGH)
    Serial.println(" (HIGH)");
  else
    Serial.println(" (LOW)");

  delay(200);
}
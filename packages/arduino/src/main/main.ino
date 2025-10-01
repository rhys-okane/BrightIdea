// This is a working implementation of the LED control system using commands in the format "index,r,g,b;"
// Use this with the web ui

#include <FastLED.h>

#define LED_PIN 12
#define NUM_LEDS 60  // Adjust as needed
#define BRIGHTNESS  128
#define LED_TYPE    WS2812B
#define COLOR_ORDER GRB

CRGB leds[NUM_LEDS];

String inputBuffer = "";

void setup() {
  Serial.begin(115200);
  FastLED.addLeds<LED_TYPE, LED_PIN, COLOR_ORDER>(leds, NUM_LEDS);
  FastLED.setBrightness(BRIGHTNESS);
  FastLED.clear();
  FastLED.show();

  // processCommand("0,255,0,0;");
}

void loop() {
  while (Serial.available()) {
    char c = Serial.read();
    if (c == ';') {
      processCommand(inputBuffer);
      inputBuffer = "";
    } else {
      inputBuffer += c;
    }
  }
}

void processCommand(const String& cmd) {
  String command = cmd;
  command.trim();  // Remove any trailing newline or space
  Serial.println(command);
  Serial.println(command.length());

  if (command.equalsIgnoreCase("OFF")) {
    FastLED.clear();
    FastLED.show();
    Serial.println("All LEDs turned off");
    return;
  }


  int index, r, g, b;
  int firstComma = command.indexOf(',');
  int secondComma = command.indexOf(',', firstComma + 1);
  int thirdComma = command.indexOf(',', secondComma + 1);

  if (firstComma == -1 || secondComma == -1 || thirdComma == -1) {
    Serial.println("Invalid command format");
    return;
  }

  index = command.substring(0, firstComma).toInt();
  r = command.substring(firstComma + 1, secondComma).toInt();
  g = command.substring(secondComma + 1, thirdComma).toInt();
  b = command.substring(thirdComma + 1).toInt();

  if (index < 0 || index >= NUM_LEDS) {
    Serial.println("LED index out of range");
    return;
  }

  leds[index] = CRGB(r, g, b);
  FastLED.show();
}

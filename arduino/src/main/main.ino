#include <Adafruit_NeoPixel.h>

// LED strip configuration
#define LED_PIN 6
#define LED_COUNT 96  // Note: 96 LEDs despite strip initialization with 100
Adafruit_NeoPixel strip(100, LED_PIN, NEO_GRB + NEO_KHZ800);

// Buffer for incoming serial data
String inputBuffer = "";
bool commandReady = false;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize NeoPixel strip
  strip.begin();
  strip.show(); // Initialize all pixels to 'off'
  strip.setBrightness(255); // Set to maximum brightness initially
  
  Serial.println("Arduino LED Controller Ready");
}

void loop() {
  // Read incoming serial data
  while (Serial.available() > 0) {
    char incomingChar = Serial.read();
    
    if (incomingChar == ';') {
      // Command terminator found
      commandReady = true;
    } else {
      // Add character to buffer
      inputBuffer += incomingChar;
    }
  }
  
  // Process command when ready
  if (commandReady) {
    processCommand(inputBuffer);
    inputBuffer = "";
    commandReady = false;
  }
}

void processCommand(String command) {
  command.trim(); // Remove any whitespace
  
  if (command == "OFF") {
    // Turn off all LEDs
    turnOffAllLEDs();
    Serial.println("All LEDs OFF");
  } else if (command.length() > 0) {
    // Parse RGB+brightness command: "r,g,b,brightness"
    parseAndSetLED(command);
  }
}

void turnOffAllLEDs() {
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(0, 0, 0));
  }
  strip.show();
}

void parseAndSetLED(String command) {
  // Find comma positions
  int firstComma = command.indexOf(',');
  int secondComma = command.indexOf(',', firstComma + 1);
  int thirdComma = command.indexOf(',', secondComma + 1);
  
  // Validate command format
  if (firstComma == -1 || secondComma == -1 || thirdComma == -1) {
    Serial.println("Error: Invalid command format");
    return;
  }
  
  // Extract values
  int r = command.substring(0, firstComma).toInt();
  int g = command.substring(firstComma + 1, secondComma).toInt();
  int b = command.substring(secondComma + 1, thirdComma).toInt();
  int brightness = command.substring(thirdComma + 1).toInt();
  
  // Validate ranges
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || brightness < 0 || brightness > 255) {
    Serial.println("Error: Values out of range");
    return;
  }
  
  // Apply brightness scaling to RGB values
  float brightnessFactor = brightness / 255.0;
  int scaledR = (int)(r * brightnessFactor);
  int scaledG = (int)(g * brightnessFactor);
  int scaledB = (int)(b * brightnessFactor);
  
  // Set all LEDs to the same color (since no LED index specified)
  // Note: This assumes we're setting all LEDs to the same color
  // If you need individual LED control, you'd need to modify the protocol
  for (int i = 0; i < LED_COUNT; i++) {
    strip.setPixelColor(i, strip.Color(scaledR, scaledG, scaledB));
  }
  
  strip.show();
  
  // Optional: Send confirmation back
  Serial.print("LED set to RGB(");
  Serial.print(scaledR);
  Serial.print(",");
  Serial.print(scaledG);
  Serial.print(",");
  Serial.print(scaledB);
  Serial.print(") brightness ");
  Serial.println(brightness);
}

// Alternative function if you want individual LED control
// You'd need to modify the protocol to include LED index
void setIndividualLED(int ledIndex, int r, int g, int b, int brightness) {
  if (ledIndex < 0 || ledIndex >= LED_COUNT) {
    Serial.println("Error: LED index out of range");
    return;
  }
  
  float brightnessFactor = brightness / 255.0;
  int scaledR = (int)(r * brightnessFactor);
  int scaledG = (int)(g * brightnessFactor);
  int scaledB = (int)(b * brightnessFactor);
  
  strip.setPixelColor(ledIndex, strip.Color(scaledR, scaledG, scaledB));
  strip.show();
}
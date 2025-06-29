// src/constants/LedGrid.ts

// const LEDS_PER_COLUMN = 6;

export const LED_COLUMN_COUNT = 16;
export const LED_ROW_COUNT = 6; // Change this value to adjust the number of rows

const powerSupplyVoltage = 5;
const powerSupplyMaxCurrent = 3;

const ledWattage = 0.3;

// brightness is 255 for full brightness, and it will use ledWattage watts per LED at this brightness
// this variable is the max safe brightness level to not overwhelm the power supply

// TODO: Maybe it's better to calculate this based on how many leds are powered at once, this seems quite limiting otherwise
const theoreticalMaxBrightness =
  (powerSupplyMaxCurrent * powerSupplyVoltage) / ledWattage;
export const MAX_SAFE_BRIGHTNESS = Math.floor(theoreticalMaxBrightness * 0.9); // 90% of max to be safe

console.log(`Max safe brightness: ${MAX_SAFE_BRIGHTNESS}`);

const WLED_URL = "http://4.3.2.1/json";

const indexes = [
  [5, 6, 17, 18, 29, 30, 41, 42, 53, 54],
  [4, 7, 16, 19, 28, 31, 40, 43, 52, 55],
  [3, 8, 15, 20, 27, 32, 39, 44, 51, 56],
  [2, 9, 14, 21, 26, 33, 38, 45, 50, 57],
  [1, 10, 13, 22, 25, 34, 37, 46, 49, 58],
  [0, 11, 12, 23, 24, 35, 36, 47, 48, 59],
] as const;

export async function setLeds() {
  try {
    console.log("Setting WLED LEDs");
    const response = await fetch(`${WLED_URL}/si`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        seg: {
          i: [6, "FF0000"],
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("WLED response:", data);
  } catch (error) {
    console.error("Error setting WLED LEDs:", error);
  }
}

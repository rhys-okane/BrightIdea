import * as target from "./PlayDesign";

it("should return the correct index for the top left LED", () => {
  const result = target.getIndex(0, 0);

  expect(result).toBe(5);
});

it("should return the correct index for the bottom left LED", () => {
  const result = target.getIndex(5, 0);

  expect(result).toBe(0);
});

it("should return the correct index for the top right LED", () => {
  const result = target.getIndex(0, 9);

  expect(result).toBe(59);
});

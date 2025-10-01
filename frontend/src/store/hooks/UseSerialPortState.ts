import type { HighBrow } from "../types/HighBrow";
import type { UseZustandState } from "../types/UseZustandState";
import { useHighBrowStore } from "../ZustandStore";

export const useSerialPortState = (): UseZustandState<
  HighBrow["serialPort"]
> => [
  useHighBrowStore((state) => state.serialPort),
  useHighBrowStore((state) => state.setSerialPort),
];

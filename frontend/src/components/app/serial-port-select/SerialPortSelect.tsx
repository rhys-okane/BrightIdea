import { useSerialPortState } from "@src/store/hooks/UseSerialPortState";
import { useEffect, type FC } from "react";

export const SerialPortSelect: FC = () => {
  const [, setSerialPort] = useSerialPortState();

  useEffect(() => {
    (async () => {})();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
          HighBrow
        </h1>
        <p className="text-lg text-gray-400">
          Select a serial port to connect to your helmet visor LEDs
        </p>
      </header>
      <section className="flex flex-col items-center gap-6 w-full">
        <div className="text-red-400">No serial port selected</div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={async () => {
            try {
              const port = await navigator.serial.requestPort();
              await port.open({ baudRate: 115200 });
              setSerialPort(port);
            } catch (error) {
              console.error("Failed to open serial port:", error);
            }
          }}
        >
          Select Serial Port
        </button>
      </section>
    </main>
  );
};

import { useSerialPortState } from "@src/store/hooks/UseSerialPortState";
import { use, useEffect, useState, type FC } from "react";

export const SerialPortSelect: FC = () => {
  const [serialPort, setSerialPort] = useSerialPortState();
  const [serialPorts, setSerialPorts] = useState<SerialPort[]>([]);

  useEffect(() => {
    (async () => {
      const ports = await navigator.serial.getPorts();

      console.log(ports);
      setSerialPorts(ports);
    })();
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
        {serialPorts.length === 0 && (
          <div className="text-gray-500">No serial ports available</div>
        )}

        {serialPorts.map((port) => (
          <button
            key={
              (port.getInfo().usbVendorId ?? 0) +
              (port.getInfo().usbProductId ?? 0)
            }
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={async () => {
              try {
                await port.open({ baudRate: 115200 });
                setSerialPort(port);
              } catch (error) {
                console.error("Failed to open serial port:", error);
              }
            }}
          >
            Connect to{" "}
            {(port.getInfo().usbVendorId ?? 0) +
              (port.getInfo().usbProductId ?? 0)}
          </button>
        ))}
      </section>
    </main>
  );
};

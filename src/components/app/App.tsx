import { type FC } from "react";
import "../../Main.css";
import { Router } from "@src/components/app/router/Router";
import { useSerialPortState } from "@src/store/hooks/UseSerialPortState";
import { SerialPortSelect } from "@src/components/app/serial-port-select/SerialPortSelect";

export const App: FC = () => {
  const [serialPort] = useSerialPortState();

  if (!navigator.serial) {
    return (
      <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            HighBrow
          </h1>
          <p className="text-lg text-gray-400">
            Your browser does not support the Web Serial API.
          </p>
        </header>
        <section className="flex flex-col items-center gap-6 w-full">
          <div className="text-red-400">Web Serial API is not supported</div>
        </section>
      </main>
    );
  }

  if (!serialPort) {
    return <SerialPortSelect />;
  }

  return <Router />;
};

export default App;

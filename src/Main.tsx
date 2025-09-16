import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./Main.css";
import { App } from "./components/app/App.tsx";
import WledClient from "wled-js";

// @ts-expect-error lol
globalThis.wled = () => {
  (async () => {
    const a = new WledClient("4.3.2.1");
    await a.turn(false);
  })();
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

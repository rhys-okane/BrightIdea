import { useHighBrowStore } from "@src/store/ZustandStore";
import type { FC } from "react";

export const AudioMode: FC = () => {
  const setAudioMode = useHighBrowStore((state) => state.setAudioMode);

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center w-full">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white">Audio Mode</h1>
        <p className="text-lg text-gray-300 mt-2">
          This feature is under development.
        </p>
      </header>
      <div className="flex flex-col items-center">
        <p className="text-gray-400 mb-4">
          Audio mode will allow you to visualize audio input.
        </p>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          onClick={() => alert("Audio mode functionality coming soon!")}
        >
          Start Audio Mode
        </button>
        <button
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition"
          onClick={() => setAudioMode(false)}
        >
          Back to Design Picker
        </button>
      </div>
    </main>
  );
};

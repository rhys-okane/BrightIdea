import { playDesign } from "@src/components/app/router/hooks/play/PlayDesign";
import { useDesignsState } from "@src/store/hooks/UseDesignsState";
import { usePlayingDesignIdState } from "@src/store/hooks/UsePlayingDesignIdState";
import { useSerialPortState } from "@src/store/hooks/UseSerialPortState";
import { useEffect, useMemo } from "react";

export const useDesignPlayer = () => {
  const [serialPort, setSerialPort] = useSerialPortState();
  const [playingDesignId] = usePlayingDesignIdState();
  const [designs] = useDesignsState();

  const isAudioMode = playingDesignId === "audio";

  const design = useMemo(() => {
    if (!playingDesignId || isAudioMode) return undefined;
    return designs.find((d) => d.id === playingDesignId);
  }, [designs, isAudioMode, playingDesignId]);

  return useEffect(() => {
    if (!serialPort) return;
    if (isAudioMode) {
      // TODO: Audio mode
      console.log(
        "Audio mode is active, not currently supported for serial port communication."
      );
      return;
    }

    console.log(serialPort.getInfo());

    serialPort.addEventListener("disconnect", () => {
      console.log("Serial port disconnected");
      setSerialPort(undefined);
    });

    const reader = serialPort.readable?.getReader();
    const writer = serialPort.writable?.getWriter();

    if (!writer) {
      console.error("Failed to get serial port reader or writer");
      return;
    }

    const interval = setInterval(() => {
      if (!reader) return;

      reader.read().then(({ value }) => {
        if (value) {
          const message = new TextDecoder().decode(value);
          console.log("Received message from serial port:", message);
        }
      });
    }, 500);

    const abortController = new AbortController();

    (async () => {
      try {
        if (design) await playDesign(writer, design, abortController.signal);
      } catch {
        abortController.abort();
      }
    })();

    return () => {
      console.log("Cleaning up design player");
      // clearInterval(interval);

      abortController.abort();
      try {
        reader?.releaseLock();
      } catch {
        console.error("Failed to release serial port reader lock");
      }

      try {
        writer?.releaseLock();
      } catch {
        console.error("Failed to release serial port writer lock");
      }
    };
  });
};

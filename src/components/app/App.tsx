import type { FC } from "react";
import "../../Main.css";
import { DesignPicker } from "@src/components/app/design-picker/DesignPicker";
import { useEditingDesignIdState } from "@src/store/hooks/UseEditingDesignIdState";
import { DesignEditor } from "@src/components/app/design-editor/DesignEditor";

export const App: FC = () => {
  const [editingDesignId] = useEditingDesignIdState();

  if (editingDesignId) {
    return <DesignEditor designId={editingDesignId} />;
  }

  return <DesignPicker />;
};

export default App;

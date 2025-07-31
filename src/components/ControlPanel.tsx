import React from "react";
import {
  MessageSquare,
  Image as ImageIcon,
  Video,
  Code,
  Headphones,
} from "lucide-react";

import useFlowStore from "../store/flowStore";
import { FlowState } from "@/types";

type Props = {
  onRequestAddNode: () => void;
};

const ControlPanel: React.FC<Props> = ({ onRequestAddNode }) => {
  const nodes = useFlowStore((state: FlowState) => state.nodes);
  const edges = useFlowStore((state: FlowState) => state.edges);

  const handleExport = () => {
    const flowData = { nodes, edges };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", "whatsapp-flow.json");
    linkElement.click();
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const flowData = JSON.parse(event.target?.result as string);
            localStorage.setItem("whatsapp-flow", JSON.stringify(flowData));
            window.location.reload();
          } catch {
            alert("Arquivo inválido!");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const mensagens = [
    { label: "Texto", value: "text", icon: <MessageSquare /> },
    { label: "Imagem", value: "image", icon: <ImageIcon /> },
    { label: "Vídeo", value: "video", icon: <Video /> },
    { label: "Embed", value: "embed", icon: <Code /> },
    { label: "Áudio", value: "audio", icon: <Headphones /> },
  ];

  return (
    <aside className="w-72 h-full border-r bg-white px-4 py-6 overflow-y-auto text-[13px]">
      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar"
          className="w-full border rounded px-3 py-1 text-sm"
        />
      </div>

      {/* Seção: Mensagens */}
      <div className="mb-6">
        <h4 className="text-xs text-gray-500 uppercase mb-2 font-semibold tracking-wide">
          Mensagens
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {mensagens.map((item) => (
            <div
              key={item.value}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData("component-type", item.value)
              }
              className="flex items-center gap-2 border rounded px-2 py-1 text-sm text-gray-700 bg-white cursor-move hover:bg-gray-50"
            >
              {item.icon}
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ControlPanel;

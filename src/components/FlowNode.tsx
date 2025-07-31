import React from "react";
import { Handle, Position } from "reactflow";
import useFlowStore from "../store/flowStore";
import { FlowNodeProps } from "../types";
import Image from "next/image";
import { nanoid } from "nanoid";

const FlowNode: React.FC<FlowNodeProps> = ({ id, data, selected }) => {
  const updateNode = useFlowStore((s) => s.updateNode);
  const removeNode = useFlowStore((s) => s.removeNode);
  const addComponentToNode = useFlowStore((s) => s.addComponentToNode);

  const handleComponentEdit = (compId: string, newContent: string) => {
    const updatedComponents = (data.components || []).map((c) =>
      c.id === compId ? { ...c, content: newContent } : c
    );
    updateNode(id, { components: updatedComponents });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeNode(id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rawType = e.dataTransfer.getData("component-type");

    if (!["text", "button", "image", "delay"].includes(rawType)) return;

    const type = rawType as "text" | "button" | "image";

    addComponentToNode(id, {
      id: nanoid(), // ✅ agora compatível com SSR
      type,
      content: type === "button" ? "Clique aqui" : "",
    });
  };

  return (
    <div
      className={`bg-white border border-gray-300 rounded-lg shadow-sm w-[260px] p-0 text-sm ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-orange-300"
      />

      {/* Header do nó */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        <div className="text-lg">💬</div>
        <div className="text-sm font-medium text-gray-800">{data.title}</div>
      </div>

      {/* Conteúdo dos componentes */}
      <div className="px-3 py-2 space-y-2">
        {(data.components || []).map((comp) => (
          <div key={comp.id}>
            {comp.type === "text" && (
              <textarea
                className="w-full text-sm border rounded-md p-2 resize-none bg-gray-50"
                rows={2}
                value={comp.content}
                onChange={(e) => handleComponentEdit(comp.id, e.target.value)}
              />
            )}
            {comp.type === "button" && (
              <button className="w-full bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                {comp.content}
              </button>
            )}
            {comp.type === "image" && (
              <div className="space-y-1">
                <div
                  className="relative w-full h-32 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
                  onClick={() =>
                    document.getElementById(`file-${comp.id}`)?.click()
                  }
                >
                  {comp.content ? (
                    <Image
                      src={comp.content}
                      alt="imagem"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                      Clique para enviar imagem
                    </div>
                  )}
                </div>
                <input
                  id={`file-${comp.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (reader.result) {
                        handleComponentEdit(comp.id, reader.result.toString());
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </div>
            )}
            {comp.type === "delay" && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded px-3 py-2">
                ⏱ Delay:
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                  value={comp.content}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      handleComponentEdit(comp.id, val);
                    }
                  }}
                />
                s
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Rodapé do nó */}
      <div className="flex justify-between items-center text-xs text-gray-500 border-t px-3 py-2">
        <span>⏱ {data.delay || 0}s</span>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          Excluir
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-orange-300"
      />
    </div>
  );
};

export default FlowNode;

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

    if (!["text", "button", "image"].includes(rawType)) return;

    const type = rawType as "text" | "button" | "image";

    addComponentToNode(id, {
      id: nanoid(), // ✅ agora compatível com SSR
      type,
      content: type === "button" ? "Clique aqui" : "",
    });
  };

  return (
    <div
      className={`bg-white shadow-md border border-gray-200 rounded-2xl p-4 w-[300px] text-sm space-y-3 ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2 bg-blue-400"
      />

      <div className="text-gray-900 font-semibold">{data.title}</div>

      <div className="space-y-2">
        {(data.components || []).map((comp) => (
          <div key={comp.id}>
            {comp.type === "text" && (
              <textarea
                className="w-full text-sm border rounded-md p-2 resize-none"
                rows={2}
                value={comp.content}
                onChange={(e) => handleComponentEdit(comp.id, e.target.value)}
              />
            )}
            {comp.type === "button" && (
              <button className="w-full bg-blue-100 text-blue-800 px-3 py-1 rounded">
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
                    reader.readAsDataURL(file); // ✅ transforma em base64
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between text-xs text-gray-500 pt-2">
        <span>Delay: {data.delay || 0}s</span>
        <button onClick={handleDelete} className="text-red-500 hover:underline">
          Excluir
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2 bg-blue-400"
      />
    </div>
  );
};

export default FlowNode;

import React from "react";
import useFlowStore from "../store/flowStore";
import { FlowState } from "@/types";

type Props = {
  onRequestAddNode: () => void;
};

const ControlPanel: React.FC<Props> = ({ onRequestAddNode }) => {
  const nodes = useFlowStore((state: FlowState) => state.nodes);
  const edges = useFlowStore((state: FlowState) => state.edges);

  const handleExport = (): void => {
    // Exportar o fluxo como JSON
    const flowData = { nodes, edges };
    const dataStr = JSON.stringify(flowData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "whatsapp-flow.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (): void => {
    // Criar um input de arquivo invisível
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          try {
            const flowData = JSON.parse(event.target?.result as string) as {
              nodes: FlowState["nodes"];
              edges: FlowState["edges"];
            };
            localStorage.setItem("whatsapp-flow", JSON.stringify(flowData));
            window.location.reload(); // Recarregar para aplicar as mudanças
          } catch (error) {
            console.error("Erro ao importar arquivo:", error);
            alert("Arquivo inválido!");
          }
        };
        reader.readAsText(file);
      }
    };

    input.click();
  };

  return (
    <aside className="w-72 h-full border-r border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-6 overflow-y-auto">
      <h3 className="text-xl font-bold mb-4">Painel de Controle</h3>

      <div className="space-y-3 mb-6">
        <button
          onClick={onRequestAddNode}
          className="w-full bg-blue-600 text-white font-medium rounded-md py-2 px-3 hover:bg-blue-700 transition"
        >
          Adicionar Mensagem
        </button>
        <button
          onClick={handleExport}
          className="w-full bg-gray-700 text-white font-medium rounded-md py-2 px-3 hover:bg-gray-800 transition"
        >
          Exportar Fluxo
        </button>
        <button
          onClick={handleImport}
          className="w-full bg-green-600 text-white font-medium rounded-md py-2 px-3 hover:bg-green-700 transition"
        >
          Importar Fluxo
        </button>
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300">
        <p>Total de mensagens: {nodes.length}</p>
        <p>Total de conexões: {edges.length}</p>
      </div>

      <div className="mt-6 text-xs text-gray-600 dark:text-gray-400">
        <h4 className="font-semibold mb-2">Instruções:</h4>
        <ul className="list-disc ml-5 space-y-1">
          <li>Clique no botão &quot;Adicionar Mensagem&quot;</li>
          <li>Depois clique no canvas para posicionar</li>
          <li>Arraste os nós para reposicionar</li>
          <li>Conecte nós arrastando de um para outro</li>
        </ul>
      </div>

      <h4 className="text-sm font-medium mt-8 mb-2">Componentes:</h4>
      <div className="flex flex-col space-y-2">
        {["text", "button", "image"].map((type) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("component-type", type)}
            className="cursor-move px-3 py-2 border rounded-md bg-gray-100 text-center text-sm hover:bg-gray-200"
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>
    </aside>
  );
};

export default ControlPanel;

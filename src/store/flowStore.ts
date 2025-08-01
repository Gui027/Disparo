import { create } from "zustand";
import { nanoid } from "nanoid";
import { Edge, XYPosition } from "reactflow";
import { FlowNode, FlowState, NodeData, NodeComponent } from "@/types";

const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  init: () => {
    try {
      const savedFlow = localStorage.getItem("whatsapp-flow");
      if (savedFlow) {
        const { nodes, edges } = JSON.parse(savedFlow) as {
          nodes: FlowNode[];
          edges: Edge[];
        };
        set({ nodes, edges });
      }
    } catch (error) {
      console.error("Erro ao carregar fluxo:", error);
    }
  },

  saveFlow: () => {
    try {
      const { nodes, edges } = get();
      localStorage.setItem("whatsapp-flow", JSON.stringify({ nodes, edges }));
    } catch (error) {
      console.error("Erro ao salvar fluxo:", error);
    }
  },

  addNode: (position: XYPosition, components: NodeComponent[] = []) => {
  const existingNodes = get().nodes;

  // Filtra os nós com títulos padrão "Grupo #N"
  const grupoTitles = existingNodes
    .map((node) => node.data.title)
    .filter((title) => /^Grupo #\d+$/.test(title || ""));

  // Extrai os números e pega o maior
  const usedNumbers = grupoTitles
    .map((title) => parseInt(title!.replace("Grupo #", ""), 10))
    .filter((num) => !isNaN(num));

  const nextNumber = usedNumbers.length > 0 ? Math.max(...usedNumbers) + 1 : 1;
  const autoTitle = `Grupo #${nextNumber}`;

  const newNode: FlowNode = {
    id: nanoid(),
    type: "flowNode",
    position,
    data: {
      title: autoTitle,
      delay: 0,
      components,
    },
  };

  set((state) => ({
    nodes: [...state.nodes, newNode],
  }));

  get().saveFlow();
  return newNode.id;
},


  updateNode: (id: string, data: Partial<NodeData>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));

    get().saveFlow();
  },

  removeNode: (id: string) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      ),
    }));

    get().saveFlow();
  },

  addEdge: (edge: Omit<Edge, "id">) => {
    const newEdge: Edge = {
      ...edge,
      id: `${edge.source}-${edge.target}`,
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    get().saveFlow();
  },

  removeEdge: (id: string) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));

    get().saveFlow();
  },

  updateNodePositions: (nodes: FlowNode[]) => {
    set((state) => ({
      nodes: state.nodes.map((existingNode) => {
        const updatedNode = nodes.find((node) => node.id === existingNode.id);
        return updatedNode
          ? { ...existingNode, position: updatedNode.position }
          : existingNode;
      }),
    }));

    get().saveFlow();
  },

  addComponentToNode: (nodeId, component: NodeComponent) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                components: [...(node.data.components || []), component],
              },
            }
          : node
      ),
    }));

    get().saveFlow();
  },
}));

export default useFlowStore;

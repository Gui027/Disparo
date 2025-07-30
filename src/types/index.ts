import { Node, Edge, XYPosition, NodeProps } from "reactflow";

// Tipos de componentes possíveis
export type ComponentType = "text" | "button" | "image";

export interface NodeComponent {
  id: string;
  type: ComponentType;
  content: string;
}

// Dados de cada nó
export interface NodeData {
  title: string;
  delay: number;
  components: NodeComponent[];
}

// Tipo para o nó completo
export type FlowNode = Node<NodeData>;

// Tipo para as propriedades do componente FlowNode
export type FlowNodeProps = NodeProps<NodeData>;

// Tipo para o estado do store
export interface FlowState {
  nodes: FlowNode[];
  edges: Edge[];
  init: () => void;
  saveFlow: () => void;
  addNode: (position: XYPosition) => string;
  updateNode: (id: string, data: Partial<NodeData>) => void;
  removeNode: (id: string) => void;
  addEdge: (edge: Omit<Edge, "id">) => void;
  removeEdge: (id: string) => void;
  updateNodePositions: (nodes: FlowNode[]) => void;
  addComponentToNode: (nodeId: string, component: NodeComponent) => void;
}

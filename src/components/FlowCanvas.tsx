import React, { useCallback, useEffect, MouseEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeDragHandler,
  useNodesState,
  useEdgesState,
  NodeTypes,
  Connection,
  MarkerType,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";

import useFlowStore from "../store/flowStore";
import FlowNode from "./FlowNode";
import { FlowNode as FlowNodeType, FlowState } from "../types";

type Props = {
  isAddingNode: boolean;
  onFinishAddNode: () => void;
};

const nodeTypes: NodeTypes = {
  flowNode: FlowNode,
};

const FlowCanvas: React.FC<Props> = ({ isAddingNode, onFinishAddNode }) => {
  const storeNodes = useFlowStore((state: FlowState) => state.nodes);
  const storeEdges = useFlowStore((state: FlowState) => state.edges);
  const addStoreNode = useFlowStore((state: FlowState) => state.addNode);
  const updateNodePositions = useFlowStore(
    (state: FlowState) => state.updateNodePositions
  );
  const initStore = useFlowStore((state: FlowState) => state.init);
  const addStoreEdge = useFlowStore((state: FlowState) => state.addEdge);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    initStore();
  }, [initStore]);

  useEffect(() => {
    setNodes(storeNodes);
    setEdges(storeEdges);
  }, [storeNodes, storeEdges, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addStoreEdge({
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle,
          targetHandle: params.targetHandle,
        });
      }
    },
    [addStoreEdge]
  );

  const onPaneClick = useCallback(
    (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isAddingNode && target.classList.contains("react-flow__pane")) {
        const bounds = event.currentTarget.getBoundingClientRect();
        const position = {
          x: event.clientX - bounds.left,
          y: event.clientY - bounds.top,
        };
        addStoreNode(position);
        onFinishAddNode();
      }
    },
    [addStoreNode, isAddingNode, onFinishAddNode]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (event: MouseEvent, node: Node) => {
      updateNodePositions([node as FlowNodeType]);
    },
    [updateNodePositions]
  );

  return (
    <div className="w-full h-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        connectionLineType={ConnectionLineType.Bezier}
        connectionLineStyle={{ stroke: "#999", strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: "default",
          style: { stroke: "#999", strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#999",
          },
        }}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;

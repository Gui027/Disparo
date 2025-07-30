"use client";

import { useState } from "react";
import { ReactFlowProvider } from "@xyflow/react";
import ControlPanel from "../components/ControlPanel";
import FlowCanvas from "../components/FlowCanvas";

export default function Page() {
  const [isAddingNode, setIsAddingNode] = useState(false);

  return (
    <div className="flex h-screen w-full">
      <ReactFlowProvider>
        <ControlPanel onRequestAddNode={() => setIsAddingNode(true)} />
        <FlowCanvas
          isAddingNode={isAddingNode}
          onFinishAddNode={() => setIsAddingNode(false)}
        />
      </ReactFlowProvider>
    </div>
  );
}

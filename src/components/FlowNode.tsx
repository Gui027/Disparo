import React from "react";
import { Handle, Position } from "reactflow";
import useFlowStore from "../store/flowStore";
import { FlowNodeProps, NodeComponent } from "../types";
import Image from "next/image";
import { nanoid } from "nanoid";
import { Trash, Copy, Trash2 } from "lucide-react";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({
  component,
  onEdit,
  onContextMenu,
}: {
  component: NodeComponent;
  onEdit: (id: string, val: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onContextMenu={(e) => onContextMenu(e, component.id)}
      className="relative"
    >
      {component.type === "text" && (
        <textarea
          className="w-full text-sm border rounded-md p-2 resize-none bg-gray-50"
          rows={2}
          value={component.content}
          onChange={(e) => onEdit(component.id, e.target.value)}
        />
      )}
      {component.type === "button" && (
        <button className="w-full bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
          {component.content}
        </button>
      )}
      {component.type === "image" && (
        <div className="space-y-1">
          <div
            className="relative w-full h-32 rounded-md overflow-hidden bg-gray-100 cursor-pointer"
            onClick={() =>
              document.getElementById(`file-${component.id}`)?.click()
            }
          >
            {component.content ? (
              <Image
                src={component.content}
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
            id={`file-${component.id}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                if (reader.result) {
                  onEdit(component.id, reader.result.toString());
                }
              };
              reader.readAsDataURL(file);
            }}
          />
        </div>
      )}
      {component.type === "delay" && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-orange-50 border border-orange-200 rounded px-3 py-2">
          ⏱ Delay:
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
            value={component.content}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) {
                onEdit(component.id, val);
              }
            }}
          />
          s
        </div>
      )}
    </div>
  );
};

const FlowNode: React.FC<FlowNodeProps> = ({ id, data, selected }) => {
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    compId: string;
  } | null>(null);

  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState(data.title || "");
  const [draggingComponent, setDraggingComponent] = React.useState<NodeComponent | null>(null);

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

    const type = rawType as "text" | "button" | "image" | "delay";

    addComponentToNode(id, {
      id: nanoid(),
      type,
      content: type === "button" ? "Clique aqui" : "",
    });
  };

  const handleComponentContext = (e: React.MouseEvent, compId: string) => {
    e.preventDefault();
    const nodeElement = e.currentTarget.closest(".flow-node") as HTMLElement;
    if (!nodeElement) return;

    const nodeRect = nodeElement.getBoundingClientRect();
    const offsetX = e.clientX - nodeRect.left;
    const offsetY = e.clientY - nodeRect.top;

    setContextMenu({ x: offsetX, y: offsetY, compId });
  };

  const handleTitleSave = () => {
    const newTitle = titleValue.trim() || data.title;
    updateNode(id, { title: newTitle });
    setEditingTitle(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  return (
    <div
      className={`flow-node bg-white border border-gray-300 rounded-lg shadow-sm w-[260px] p-0 text-sm ${
        selected ? "ring-2 ring-blue-500" : ""
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-orange-300" />

      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200">
        
        <div className="text-sm font-medium text-gray-800 cursor-pointer" onClick={() => setEditingTitle(true)}>
          {editingTitle ? (
            <input
              type="text"
              autoFocus
              className="text-sm font-medium text-gray-800 bg-gray-100 rounded px-1 py-0.5 focus:outline-none"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSave();
                if (e.key === "Escape") {
                  setTitleValue(data.title || "");
                  setEditingTitle(false);
                }
              }}
            />
          ) : (
            data.title
          )}
        </div>
      </div>

      <div className="px-3 py-2 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={({ active }) => {
            const found = data.components.find((c) => c.id === active.id);
            if (found) setDraggingComponent(found);
          }}
          onDragEnd={({ active, over }) => {
            setDraggingComponent(null);
            if (active.id !== over?.id) {
              const oldIndex = data.components.findIndex((c) => c.id === active.id);
              const newIndex = data.components.findIndex((c) => c.id === over?.id);
              const newOrder = arrayMove(data.components, oldIndex, newIndex);
              updateNode(id, { components: newOrder });
            }
          }}
        >
          <SortableContext items={data.components.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            {data.components.map((comp) => (
              <SortableItem
                key={comp.id}
                component={comp}
                onEdit={handleComponentEdit}
                onContextMenu={handleComponentContext}
              />
            ))}
          </SortableContext>

          <DragOverlay>
            {draggingComponent && (
              <div className="p-2 bg-white rounded border shadow-md w-[240px] opacity-90">
                {draggingComponent.type === "text" && <div className="text-xs text-gray-400">Texto</div>}
                {draggingComponent.type === "button" && <div className="text-xs text-blue-500 font-medium">Botão</div>}
                {draggingComponent.type === "image" && <div className="text-xs text-gray-500">🖼️ Imagem</div>}
                {draggingComponent.type === "delay" && <div className="text-xs text-orange-600">⏱ Delay</div>}
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 border-t px-3 py-2">
        <span>⏱ {data.delay || 0}s</span>
        <button onClick={handleDelete} title="Excluir">
          <Trash className="w-4 h-4 text-red-500 hover:text-red-700" />
        </button>
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-orange-300" />

      {contextMenu && (
        <div
          className="absolute z-50 bg-white border shadow-md rounded text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-gray-700"
            onClick={() => {
              const comp = data.components.find((c) => c.id === contextMenu.compId);
              if (!comp) return;
              addComponentToNode(id, {
                ...comp,
                id: nanoid(),
              });
              setContextMenu(null);
            }}
          >
            <Copy className="w-4 h-4" />
            Duplicar
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left text-red-500"
            onClick={() => {
              const newComponents = data.components.filter((c) => c.id !== contextMenu.compId);
              updateNode(id, { components: newComponents });
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      )}
    </div>
  );
};

export default FlowNode;
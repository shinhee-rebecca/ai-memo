"use client";

import { useCallback, useMemo } from "react";

import {
  Background,
  Controls,
  Edge,
  Node,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { type Memo } from "@/lib/memo";

import { MemoNode } from "./nodes/memo-node";
import { TagNode } from "./nodes/tag-node";

const nodeTypes = {
  memo: MemoNode,
  tag: TagNode,
};

interface RelationshipViewProps {
  memos: Memo[];
}

export function RelationshipView({ memos }: RelationshipViewProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const tagMap = new Map<string, Memo[]>();
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Group memos by tags
    memos.forEach((memo) => {
      memo.tags.forEach((tag) => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(memo);
      });
    });

    // Create tag nodes (positioned in the center area)
    const tagEntries = Array.from(tagMap.entries());
    const tagCount = tagEntries.length;
    const centerX = 400;
    const centerY = 300;
    const radius = Math.min(150, 50 + tagCount * 10);

    tagEntries.forEach(([tag, tagMemos], index) => {
      const angle = (index / tagCount) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      nodes.push({
        id: `tag-${tag}`,
        type: "tag",
        position: { x, y },
        data: { label: tag, memoCount: tagMemos.length },
      });
    });

    // Create memo nodes (positioned around their tags)
    const memoPositions = new Map<string, { x: number; y: number }>();

    memos.forEach((memo) => {
      if (memo.tags.length === 0) return;

      // Calculate average position based on connected tags
      let avgX = 0;
      let avgY = 0;
      memo.tags.forEach((tag) => {
        const tagNode = nodes.find((n) => n.id === `tag-${tag}`);
        if (tagNode) {
          avgX += tagNode.position.x;
          avgY += tagNode.position.y;
        }
      });
      avgX /= memo.tags.length;
      avgY /= memo.tags.length;

      // Add some random offset to avoid overlapping
      const offsetRadius = 80 + Math.random() * 40;
      const offsetAngle = Math.random() * 2 * Math.PI;
      const x = avgX + offsetRadius * Math.cos(offsetAngle);
      const y = avgY + offsetRadius * Math.sin(offsetAngle);

      memoPositions.set(memo.id, { x, y });

      nodes.push({
        id: `memo-${memo.id}`,
        type: "memo",
        position: { x, y },
        data: {
          title: memo.title,
          content: memo.content,
          tags: memo.tags,
        },
      });

      // Create edges between memo and its tags
      memo.tags.forEach((tag) => {
        edges.push({
          id: `edge-${memo.id}-${tag}`,
          source: `memo-${memo.id}`,
          target: `tag-${tag}`,
          type: "smoothstep",
          animated: false,
          style: { stroke: "#cbd5e1", strokeWidth: 1.5 },
        });
      });
    });

    return { nodes, edges };
  }, [memos]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <Background color="#e2e8f0" gap={16} size={1} />
        <Controls className="rounded-lg border border-slate-200 bg-white shadow-sm" />
      </ReactFlow>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Background,
  Controls,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Edge, Node } from "@xyflow/react";

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

export function RelationshipView(props: RelationshipViewProps) {
  return (
    <ReactFlowProvider>
      <RelationshipGraph {...props} />
    </ReactFlowProvider>
  );
}

function RelationshipGraph({ memos }: RelationshipViewProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  const tagStats = useMemo(() => {
    const counts = new Map<string, number>();

    memos.forEach((memo) => {
      memo.tags.forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });

    return Array.from(counts.entries()).map(([tag, count]) => ({
      tag,
      count,
    }));
  }, [memos]);

  useEffect(() => {
    if (selectedTag && !tagStats.some((tag) => tag.tag === selectedTag)) {
      setSelectedTag(null);
    }
  }, [selectedTag, tagStats]);

  const tagNodes = useMemo<Node[]>(() => {
    if (tagStats.length === 0) return [];

    const radius = 220;
    const angleStep = (2 * Math.PI) / tagStats.length;

    return tagStats.map((tag, index) => {
      const angle = angleStep * index - Math.PI / 2;
      return {
        id: `tag-${tag.tag}`,
        type: "tag",
        data: { label: tag.tag, memoCount: tag.count },
        position: {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
        },
      } satisfies Node;
    });
  }, [tagStats]);

  useEffect(() => {
    if (tagNodes.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    if (!selectedTag) {
      setEdges([]);
      setNodes(
        tagNodes.map((node) => ({
          ...node,
          data: { ...node.data, selected: false },
        }))
      );
      return;
    }

    const selectedNode = tagNodes.find(
      (node) => node.id === `tag-${selectedTag}`
    );

    if (!selectedNode) {
      setSelectedTag(null);
      return;
    }

    const relatedMemos = memos.filter((memo) =>
      memo.tags.includes(selectedTag)
    );

    const memoRingRadius = 140;
    const memoNodes: Node[] = relatedMemos.map((memo, index) => {
      const angle =
        (index / Math.max(relatedMemos.length, 1)) * 2 * Math.PI -
        Math.PI / 2;

      return {
        id: `memo-${memo.id}`,
        type: "memo",
        data: {
          title: memo.title,
          content: memo.content,
          tags: memo.tags,
        },
        position: {
          x: selectedNode.position.x + Math.cos(angle) * memoRingRadius,
          y: selectedNode.position.y + Math.sin(angle) * memoRingRadius,
        },
      };
    });

    const memoEdges: Edge[] = relatedMemos.map((memo) => ({
      id: `edge-${selectedTag}-${memo.id}`,
      source: `tag-${selectedTag}`,
      target: `memo-${memo.id}`,
      animated: true,
      type: "smoothstep",
      style: { stroke: "#f59e0b" },
    }));

    const tagNodesWithSelection = tagNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        selected: node.id === `tag-${selectedTag}`,
      },
    }));

    setNodes([...tagNodesWithSelection, ...memoNodes]);
    setEdges(memoEdges);
  }, [memos, selectedTag, setEdges, setNodes, tagNodes]);

  useEffect(() => {
    if (nodes.length === 0) return;

    const timeout = setTimeout(() => {
      fitView({ padding: 0.2 });
    }, 50);

    return () => clearTimeout(timeout);
  }, [fitView, nodes]);

  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => {
      if (node.type !== "tag") return;
      const tag = (node.data as { label?: string }).label;
      if (!tag) return;

      setSelectedTag((prev) => (prev === tag ? null : tag));
    },
    []
  );

  if (tagStats.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
          아직 메모가 없습니다. 메모를 작성하면 태그 기반 관계도를 보여드릴게요.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-inner">
      <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
        <span className="font-semibold text-slate-800">
          태그를 선택하면 연결된 메모가 나타나요.
        </span>
        {selectedTag && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            #{selectedTag} 선택됨
          </span>
        )}
      </div>

      <div className="relative flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          nodesDraggable={false}
          elementsSelectable={false}
          panOnScroll
          zoomOnScroll
          fitView
          fitViewOptions={{ padding: 0.3 }}
          className="h-full"
        >
          <Background gap={24} color="#e2e8f0" />
          <Controls showInteractive={false} position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}

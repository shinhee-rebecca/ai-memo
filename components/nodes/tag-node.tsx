"use client";

import { useState } from "react";

import { Handle, Position } from "@xyflow/react";

interface TagNodeProps {
  data: {
    label: string;
    memoCount: number;
    selected?: boolean;
  };
}

export function TagNode({ data }: TagNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />

      <div
        className={`relative inline-flex min-w-[72px] cursor-pointer items-center justify-center rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:scale-105 hover:bg-amber-500 hover:shadow-lg ${
          data.selected ? "ring-4 ring-amber-200 shadow-lg" : ""
        }`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        #{data.label}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
          <div className="font-semibold text-slate-900">#{data.label}</div>
          <div className="text-sm text-slate-600">
            연결된 메모 {data.memoCount}개
          </div>
        </div>
      )}
    </div>
  );
}

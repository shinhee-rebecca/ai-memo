"use client";

import { useState } from "react";

import { Handle, Position } from "@xyflow/react";
import { Star } from "lucide-react";

interface TagNodeProps {
  data: {
    label: string;
    memoCount: number;
  };
}

export function TagNode({ data }: TagNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />

      <div
        className="relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-amber-400 shadow-md transition hover:scale-110 hover:bg-amber-500 hover:shadow-lg"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Star className="h-7 w-7 fill-white text-white" />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
          <div className="font-semibold text-slate-900">#{data.label}</div>
          <div className="text-sm text-slate-600">
            {data.memoCount}개의 메모
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";

import { Handle, Position } from "@xyflow/react";

interface MemoNodeProps {
  data: {
    title: string;
    content: string;
    tags: string[];
  };
}

export function MemoNode({ data }: MemoNodeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <Handle type="source" position={Position.Top} className="opacity-0" />
      <Handle type="target" position={Position.Bottom} className="opacity-0" />

      <div
        className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-slate-300 bg-white shadow-md transition hover:scale-110 hover:border-slate-500 hover:shadow-lg"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Empty circle - no text inside */}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="mb-1 font-semibold text-slate-900">{data.title}</div>
          <div className="text-sm text-slate-600 line-clamp-3">
            {data.content}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

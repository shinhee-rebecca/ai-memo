"use client";

import { useMemo } from "react";

import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";

import { type Memo } from "@/lib/memo";

ChartJS.register(ArcElement, Tooltip, Legend);

interface ChartViewProps {
  memos: Memo[];
}

export function ChartView({ memos }: ChartViewProps) {
  const chartData = useMemo(() => {
    // Filter memos from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentMemos = memos.filter(
      (memo) => new Date(memo.created_at) >= thirtyDaysAgo
    );

    // Count tags
    const tagCounts = new Map<string, { count: number; memos: Memo[] }>();
    recentMemos.forEach((memo) => {
      memo.tags.forEach((tag) => {
        if (!tagCounts.has(tag)) {
          tagCounts.set(tag, { count: 0, memos: [] });
        }
        const tagData = tagCounts.get(tag)!;
        tagData.count++;
        tagData.memos.push(memo);
      });
    });

    // Sort by count and take top 10
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10);

    // Calculate "기타" if there are more tags
    const otherTags = Array.from(tagCounts.entries()).slice(10);
    const otherCount = otherTags.reduce((sum, [, data]) => sum + data.count, 0);
    const otherMemos = otherTags.flatMap(([, data]) => data.memos);

    const labels: string[] = [];
    const data: number[] = [];
    const tagToMemos = new Map<string, Memo[]>();

    sortedTags.forEach(([tag, { count, memos: tagMemos }]) => {
      labels.push(tag);
      data.push(count);
      tagToMemos.set(tag, tagMemos);
    });

    if (otherCount > 0) {
      labels.push("기타");
      data.push(otherCount);
      tagToMemos.set("기타", otherMemos);
    }

    // Generate colors
    const colors = [
      "#0f172a", // slate-900
      "#1e293b", // slate-800
      "#334155", // slate-700
      "#475569", // slate-600
      "#64748b", // slate-500
      "#94a3b8", // slate-400
      "#cbd5e1", // slate-300
      "#e2e8f0", // slate-200
      "#f1f5f9", // slate-100
      "#f8fafc", // slate-50
    ];

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ],
      tagToMemos,
    };
  }, [memos]);

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "#ffffff",
        titleColor: "#0f172a",
        bodyColor: "#475569",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const tag = context[0].label;
            const count = context[0].parsed;
            return `#${tag} (${count}개)`;
          },
          label: (context: any) => {
            const tag = context.label;
            const tagMemos = chartData.tagToMemos.get(tag) || [];

            // Get 2 most recent memos
            const recentMemos = [...tagMemos]
              .sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )
              .slice(0, 2);

            const lines: string[] = [""];
            recentMemos.forEach((memo, index) => {
              const preview =
                memo.content.length > 40
                  ? memo.content.substring(0, 40) + "..."
                  : memo.content;
              lines.push(`${index + 1}. ${memo.title}`);
              lines.push(`   ${preview}`);
              if (index < recentMemos.length - 1) {
                lines.push("");
              }
            });

            return lines;
          },
          afterLabel: () => {
            return "";
          },
        },
      },
    },
  };

  if (chartData.labels.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center text-sm text-slate-500">
          최근 30일간 작성된 메모가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Pie Chart */}
      <div className="flex flex-1 items-center justify-center">
        <div className="h-[320px] w-[320px]">
          <Pie data={chartData} options={options} />
        </div>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2">
        {chartData.labels.map((label, index) => {
          const count = chartData.datasets[0].data[index];
          const total = chartData.datasets[0].data.reduce(
            (sum, val) => sum + val,
            0
          );
          const percentage = ((count / total) * 100).toFixed(1);
          const color = chartData.datasets[0].backgroundColor[index];

          return (
            <div
              key={label}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">#{label}</span>
              </div>
              <span className="font-semibold">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

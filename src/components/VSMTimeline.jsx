import React, { useMemo } from "react";

const VSMTimeline = ({ processes }) => {
  const metrics = useMemo(() => {
    let totalTime = 0;
    const segments = [];

    processes.forEach((p) => {
      const ct = Number(p.ct) || 0;
      const wt = Number(p.wt) || 0;

      // 1. Add Waiting Time segment BEFORE each process
      if (wt > 0) {
        segments.push({
          type: "WT",
          duration: wt,
          label: `WT (${p.name || "Queue"})`,
          isVA: false,
          isWT: true,
        });
        totalTime += wt;
      }

      // 2. Add Process (CT) segment — color by VA/NVA
      if (ct > 0) {
        segments.push({
          type: p.isVA ? "VA" : "NVA",
          duration: ct,
          label: p.name || "Process",
          isVA: p.isVA,
          isWT: false,
        });
        totalTime += ct;
      }
    });

    // Summary breakdowns
    const totalVA  = processes.reduce((acc, p) => acc + (p.isVA ? (Number(p.ct) || 0) : 0), 0);
    const totalNVA = processes.reduce((acc, p) => acc + (!p.isVA ? (Number(p.ct) || 0) : 0), 0);
    const totalWT  = processes.reduce((acc, p) => acc + (Number(p.wt) || 0), 0);
    const vaRatio  = totalTime > 0 ? ((totalVA / totalTime) * 100).toFixed(1) : 0;

    return { segments, totalTime, totalVA, totalNVA, totalWT, vaRatio };
  }, [processes]);

  if (processes.length === 0) return null;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Lean Value Stream Timeline
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-medium">Flow Efficiency:</span>
          <span
            className={`text-sm font-bold ${
              Number(metrics.vaRatio) >= 50 ? "text-green-600" : "text-red-600"
            }`}
          >
            {metrics.vaRatio}%
          </span>
        </div>
      </div>

      {/* Stacked Timeline Bar */}
      <div className="w-full h-10 flex rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-inner">
        {metrics.segments.map((seg, idx) => {
          const widthPercent = metrics.totalTime > 0
            ? (seg.duration / metrics.totalTime) * 100
            : 0;
          if (widthPercent === 0) return null;

          let barColor = "";
          if (seg.isWT)       barColor = "bg-orange-400 hover:bg-orange-300";
          else if (seg.isVA)  barColor = "bg-green-500 hover:bg-green-400";
          else                barColor = "bg-red-500 hover:bg-red-400";

          return (
            <div
              key={idx}
              style={{ width: `${widthPercent}%` }}
              className={`h-full relative group transition-all duration-500 border-r border-white/30 last:border-r-0 ${barColor}`}
              title={`${seg.label}: ${seg.duration} min`}
            >
              {/* Inline label if wide enough */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {widthPercent > 7 && (
                  <span className="text-[9px] font-bold text-white truncate px-0.5 drop-shadow">
                    {seg.duration}m
                  </span>
                )}
              </div>

              {/* Hover tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-xl">
                {seg.label}: <span className="font-bold">{seg.duration} min</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">VA (Process)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">NVA (Process)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Waiting Time</span>
        </div>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-100">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Lead Time</p>
          <p className="text-lg font-bold text-gray-800">{metrics.totalTime}</p>
          <p className="text-[10px] text-gray-400">min</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-100">
          <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">VA Time</p>
          <p className="text-lg font-bold text-green-700">{metrics.totalVA}</p>
          <p className="text-[10px] text-green-500">min</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">NVA Time</p>
          <p className="text-lg font-bold text-red-700">{metrics.totalNVA}</p>
          <p className="text-[10px] text-red-500">min</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-100">
          <p className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-1">Waiting Time</p>
          <p className="text-lg font-bold text-orange-700">{metrics.totalWT}</p>
          <p className="text-[10px] text-orange-500">min</p>
        </div>
      </div>
    </div>
  );
};

export default VSMTimeline;

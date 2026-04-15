import React from "react";
import { trackBottleneckClick, trackDrilldown } from "../utils/analytics";

const ProcessCard = ({ process, isBottleneck, onClick }) => {
  const { name, isVA, ct, wt, hasChildren } = process;

  // Determine colors based on type
  const type = isVA ? "VA" : "NVA";
  const lt = (Number(ct) || 0) + (Number(wt) || 0);
  const bgColor = isVA ? "bg-green-50" : "bg-red-50";
  const borderColor = isVA ? "border-green-300" : "border-red-300";
  const headerColor = isVA ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100";

  // Bottleneck styling
  const bottleneckClasses = isBottleneck
    ? "ring-4 ring-orange-500 shadow-lg shadow-orange-200 scale-105"
    : "hover:shadow-md";

  const handleCardClick = () => {
    if (isBottleneck) {
      trackBottleneckClick({ processName: name, processCT: ct });
    }

    if (hasChildren && typeof onClick === 'function') {
      trackDrilldown({ processName: name, action: 'view_details' });
      onClick(process);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative flex flex-col w-48 rounded-lg border-2 ${borderColor} ${bgColor} ${bottleneckClasses} transition-all duration-300 ${
        hasChildren ? "cursor-pointer hover:scale-105" : "cursor-default"
      }`}
    >
      {isBottleneck && (
        <span className="absolute -top-3 -right-3 flex h-6 w-6">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-6 w-6 bg-orange-500 text-white text-xs items-center justify-center font-bold">!</span>
        </span>
      )}

      {/* Header */}
      <div className={`px-3 py-2 font-bold text-sm text-center border-b ${borderColor} ${headerColor} rounded-t-md`}>
        {name}
      </div>

      {/* Body / Metrics */}
      <div className="p-3 text-sm flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs font-semibold">CT</span>
          <span className="font-mono font-medium">{ct}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-xs font-semibold">LT</span>
          <span className="font-mono font-medium">{lt}</span>
        </div>
        <div className="flex justify-between items-center mt-1 border-t border-gray-200 pt-1">
          <span className="text-gray-500 text-xs font-semibold">Type</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${isVA ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{type}</span>
        </div>
      </div>

      {/* Drill down indicator */}
      {hasChildren && (
        <div className="bg-white/50 text-center py-1 text-xs text-gray-500 border-t rounded-b-md flex justify-center items-center gap-1">
          <span>Click to drill down</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </div>
      )}
    </div>
  );
};

export default ProcessCard;

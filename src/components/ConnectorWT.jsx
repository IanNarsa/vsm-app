import React from "react";
import { AlertCircle } from "lucide-react";

const ConnectorWT = ({ wt }) => {
  const isHighWT = wt >= 30;
  
  return (
    <div className="flex flex-col items-center justify-center w-20 shrink-0 relative group">
      {/* WT Label */}
      <div 
        className={`absolute -top-10 flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold transition-all duration-300 transform group-hover:-translate-y-1
          ${isHighWT 
            ? "bg-red-100 text-red-700 border border-red-200 shadow-sm animate-pulse" 
            : "bg-orange-50 text-orange-700 border border-orange-100"}`}
      >
        {isHighWT && <AlertCircle size={12} className="text-red-600" />}
        WT: {wt}m
      </div>

      {/* The Arrow Connector */}
      <div className="h-0.5 w-full bg-gray-300 relative">
        <div 
          className={`absolute right-0 top-1/2 -mt-1.5 w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-b-[6px] border-b-transparent
            ${isHighWT ? "border-l-red-500" : "border-l-gray-400"}`}
        ></div>
        
        {/* Highlight line for high WT */}
        {isHighWT && (
          <div className="absolute top-0 left-0 h-full w-full bg-red-400 animate-pulse opacity-50"></div>
        )}
      </div>
    </div>
  );
};

export default ConnectorWT;

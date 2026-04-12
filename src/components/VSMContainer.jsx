import React, { useState, useMemo } from "react";
import VSMFlow from "./VSMFlow";
import { vsmDummyData } from "../data/vsmData";

const VSMContainer = () => {
  // activePath stores the hierarchy from root to current selected processes node.
  // Initially, it contains root data.
  const [activePath, setActivePath] = useState([vsmDummyData]);

  // Current active processes to render
  const currentLevelData = activePath[activePath.length - 1];
  const processes = currentLevelData.processes || [];

  // Derived calculations for metrics in the current layer
  const { totalCT, totalLT, highestCT } = useMemo(() => {
    let ctSum = 0;
    let ltSum = 0;
    let maxCt = -1;

    processes.forEach(p => {
      ctSum += p.ct || 0;
      ltSum += p.lt || 0;
      if (p.ct > maxCt) maxCt = p.ct;
    });

    return { totalCT: ctSum, totalLT: ltSum, highestCT: maxCt };
  }, [processes]);

  // Handle drill down to a specific process if it has children
  const handleDrillDown = (process) => {
    if (process.hasChildren && process.children) {
      setActivePath(prev => [...prev, process.children]);
    }
  };

  // Navigate back one level
  const handleBack = () => {
    if (activePath.length > 1) {
      setActivePath(prev => prev.slice(0, prev.length - 1));
    }
  };

  // Navigate to a specific level in the breadcrumb
  const handleBreadcrumbClick = (index) => {
    setActivePath(prev => prev.slice(0, index + 1));
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col pt-8 pb-12">
      {/* Header section with Breadcrumb and Metrics */}
      <div className="bg-white rounded-t-xl border border-gray-200 p-5 shadow-sm">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-gray-500 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
          {activePath.map((item, index) => {
            const isLast = index === activePath.length - 1;
            return (
              <div key={item.id} className="flex items-center">
                <button
                  onClick={() => handleBreadcrumbClick(index)}
                  className={`hover:text-blue-600 transition-colors ${
                    isLast ? "text-gray-900 font-bold" : "text-gray-500"
                  }`}
                  disabled={isLast}
                >
                  {item.name}
                </button>
                {!isLast && (
                  <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </nav>

        {/* Aggregated Metrics Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentLevelData.name} Metrics</h2>
            <p className="text-sm text-gray-500 mt-1">Aggregated values for this layer</p>
          </div>
          
          <div className="flex gap-4 mt-4 md:mt-0">
            <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg text-center">
              <span className="block text-xs font-bold text-blue-600 uppercase tracking-wider">Total Cycle Time</span>
              <span className="block text-xl font-mono font-bold text-blue-900">{totalCT}</span>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg text-center">
              <span className="block text-xs font-bold text-indigo-600 uppercase tracking-wider">Total Lead Time</span>
              <span className="block text-xl font-mono font-bold text-indigo-900">{totalLT}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control panel if not root */}
      {activePath.length > 1 && (
        <div className="bg-gray-50 border-x border-b border-gray-200 px-5 py-3 flex justify-start">
          <button
            onClick={handleBack}
            className="flex items-center text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded transition shadow-sm"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Parent Process
          </button>
        </div>
      )}

      {/* Main Flow Canvas */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl shadow-sm overflow-hidden flex flex-col justify-center min-h-[350px]">
        {/* Simple animation container wrapping the flow */}
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <VSMFlow processes={processes} highestCT={highestCT} onDrillDown={handleDrillDown} />
        </div>
      </div>
    </div>
  );
};

export default VSMContainer;

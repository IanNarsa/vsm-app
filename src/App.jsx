import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import FormInput from './components/FormInput';
import CalculationEngine from './components/CalculationEngine';
import VSMFlow from './components/VSMFlow';
import ExportButton from './components/ExportButton';
import SEO from './components/SEO';
import {
  trackGenerateVSM,
  trackDrilldown,
  trackBackNavigation,
} from './utils/analytics';
import { vsmDummyData } from './data/vsmData';

// ─── Pure utility functions (outside component for stable references) ──────────

/**
 * Traverse the tree to the current active layer and return it.
 */
function getNodeAtPath(tree, pathIds) {
  let current = tree;
  for (let i = 1; i < pathIds.length; i++) {
    const childId = pathIds[i];
    const next = current.processes?.find(p => p.children && p.children.id === childId);
    if (next?.children) {
      current = next.children;
    } else {
      break;
    }
  }
  return current;
}

/**
 * Immutably update the processes array at the target path in the tree.
 */
function updateTreeAtPath(node, pathIds, newProcesses, index = 1) {
  if (index >= pathIds.length) {
    return { ...node, processes: newProcesses };
  }
  const targetId = pathIds[index];
  return {
    ...node,
    processes: (node.processes || []).map(p => {
      if (p.children && p.children.id === targetId) {
        return { ...p, children: updateTreeAtPath(p.children, pathIds, newProcesses, index + 1) };
      }
      return p;
    }),
  };
}

// ──────────────────────────────────────────────────────────────────────────────

function App() {
  const [treeData, setTreeData] = useState(vsmDummyData);
  const [activePathIds, setActivePathIds] = useState(['root']);
  const canvasRef = useRef(null);

  // ── Derived state ────────────────────────────────────────────────────────────

  const currentNode = useMemo(
    () => getNodeAtPath(treeData, activePathIds),
    [treeData, activePathIds]
  );

  const processes = useMemo(() => currentNode.processes || [], [currentNode]);

  const highestCT = useMemo(
    () => Math.max(0, ...processes.map(p => Number(p.ct) || 0)),
    [processes]
  );

  const breadcrumbs = useMemo(() => {
    let current = treeData;
    const crumbs = [{ id: current.id, name: current.name }];
    for (let i = 1; i < activePathIds.length; i++) {
      const childId = activePathIds[i];
      const next = current.processes?.find(p => p.children && p.children.id === childId);
      if (next?.children) {
        current = next.children;
        crumbs.push({ id: current.id, name: current.name });
      }
    }
    return crumbs;
  }, [treeData, activePathIds]);

  // ── GA4: fire generate_vsm_click when process count changes ─────────────────

  const prevProcessCount = useRef(null);
  useEffect(() => {
    if (processes.length === 0) return;
    if (processes.length === prevProcessCount.current) return;
    prevProcessCount.current = processes.length;
    const vaCount = processes.filter(p => p.isVA).length;
    const nvaCount = processes.length - vaCount;
    trackGenerateVSM({ totalProcesses: processes.length, totalVA: vaCount, totalNVA: nvaCount });
  }, [processes.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Process CRUD handlers ────────────────────────────────────────────────────

  const addProcess = useCallback(() => {
    const newId = `p-${Date.now()}`;
    const newProcess = { id: newId, name: '', isVA: false, ct: 0, wt: 0, hasChildren: false };
    setTreeData(prev => {
      const cur = getNodeAtPath(prev, activePathIds).processes || [];
      return updateTreeAtPath(prev, activePathIds, [...cur, newProcess]);
    });
  }, [activePathIds]);

  const removeProcess = useCallback((id) => {
    setTreeData(prev => {
      const cur = getNodeAtPath(prev, activePathIds).processes || [];
      return updateTreeAtPath(prev, activePathIds, cur.filter(p => p.id !== id));
    });
  }, [activePathIds]);

  const updateProcess = useCallback((id, field, value) => {
    setTreeData(prev => {
      const cur = getNodeAtPath(prev, activePathIds).processes || [];
      return updateTreeAtPath(prev, activePathIds, cur.map(p => p.id === id ? { ...p, [field]: value } : p));
    });
  }, [activePathIds]);

  // ── Navigation handlers ──────────────────────────────────────────────────────

  const handleDrillDown = useCallback((process) => {
    if (process.hasChildren && process.children) {
      trackDrilldown({
        processName: process.name,
        action: 'view_details',
        layerDepth: activePathIds.length,
      });
      setActivePathIds(prev => [...prev, process.children.id]);
    }
  }, [activePathIds]);

  const handleManageChildren = useCallback((process) => {
    if (process.hasChildren && process.children) {
      setActivePathIds(prev => [...prev, process.children.id]);
    } else {
      const newChildrenId = `${process.id}-detail`;
      const updatedProcess = {
        ...process,
        hasChildren: true,
        children: {
          id: newChildrenId,
          name: `${process.name || 'Process'} Details`,
          processes: [],
        },
      };
      setTreeData(prev => {
        const cur = getNodeAtPath(prev, activePathIds).processes || [];
        return updateTreeAtPath(prev, activePathIds, cur.map(p => p.id === process.id ? updatedProcess : p));
      });
      setActivePathIds(prev => [...prev, newChildrenId]);
    }
  }, [activePathIds]);

  const handleBack = useCallback(() => {
    if (activePathIds.length > 1) {
      trackBackNavigation(activePathIds.length - 1);
      setActivePathIds(prev => prev.slice(0, -1));
    }
  }, [activePathIds]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <SEO
        title="FlowLean — Value Stream Mapping & Bottleneck Analysis Tool"
        description="Identify bottlenecks, reduce delays, and improve process flow in minutes. FlowLean helps you visualize workflows, analyze lead time, and uncover hidden inefficiencies—without complex tools or setup."
        url="https://flow-lean.com/"
      />
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lean VSM Builder</h1>
            <p className="text-gray-500 mt-1">Multi-Layer Value Stream Mapping Tool</p>
          </div>
          <ExportButton canvasRef={canvasRef} totalProcesses={processes.length} />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Column: Input Form */}
          <div className="lg:col-span-1 border-gray-100 h-full">
            <FormInput
              processes={processes}
              addProcess={addProcess}
              removeProcess={removeProcess}
              updateProcess={updateProcess}
              handleManageChildren={handleManageChildren}
            />
          </div>

          {/* Right Column: Visualization & Metrics */}
          <div className="lg:col-span-3 space-y-6">
            <div className="flex flex-col gap-6" ref={canvasRef}>

              {/* KPI Metrics */}
              <CalculationEngine processes={processes} />

              {/* VSM Context & Canvas Area */}
              <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Navigation Bar inside Canvas */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 rounded-t-xl flex justify-between items-center">
                  <nav aria-label="VSM layer breadcrumb" className="flex items-center text-sm font-medium text-gray-500 flex-wrap">
                    {breadcrumbs.map((item, index, arr) => {
                      const isLast = index === arr.length - 1;
                      return (
                        <div key={item.id} className="flex items-center">
                          <span className={isLast ? 'text-gray-900 font-bold' : 'text-gray-500'}>
                            {item.name}
                          </span>
                          {!isLast && (
                            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </nav>

                  {activePathIds.length > 1 && (
                    <button
                      onClick={handleBack}
                      aria-label="Go back to parent process layer"
                      className="no-export flex items-center text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded transition shadow-sm"
                    >
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Parent Process
                    </button>
                  )}
                </div>

                {/* The horizontal flow view */}
                <div className="p-4 min-h-[300px] flex items-center justify-center overflow-x-auto bg-white">
                  <VSMFlow processes={processes} highestCT={highestCT} onDrillDown={handleDrillDown} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;

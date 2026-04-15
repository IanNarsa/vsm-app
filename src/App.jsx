import React, { useState, useRef, useMemo } from 'react';
import FormInput from './components/FormInput';
import CalculationEngine from './components/CalculationEngine';
import VSMFlow from './components/VSMFlow';
import ExportButton from './components/ExportButton';
import SEO from './components/SEO';
import { vsmDummyData } from './data/vsmData';

function App() {
  const [treeData, setTreeData] = useState(vsmDummyData);
  const [activePathIds, setActivePathIds] = useState(['root']);
  const canvasRef = useRef(null);

  const getCurrentNode = () => {
    let current = treeData;
    for (let i = 1; i < activePathIds.length; i++) {
        const childId = activePathIds[i];
        const next = current.processes.find(p => p.children && p.children.id === childId);
        if (next && next.children) {
            current = next.children;
        } else {
            break;
        }
    }
    return current;
  };

  const currentNode = getCurrentNode();
  const processes = currentNode.processes || [];

  const highestCT = useMemo(() => {
    return Math.max(0, ...processes.map(p => Number(p.ct) || 0));
  }, [processes]);

  const updateTreeRecursively = (node, pathIds, newProcesses, currentIndex = 1) => {
    if (currentIndex >= pathIds.length) {
      return { ...node, processes: newProcesses };
    }
    const targetChildId = pathIds[currentIndex];
    
    return {
      ...node,
      processes: node.processes.map(p => {
        if (p.children && p.children.id === targetChildId) {
           return { ...p, children: updateTreeRecursively(p.children, pathIds, newProcesses, currentIndex + 1) };
        }
        return p;
      })
    };
  };

  const updateCurrentLayerProcesses = (newProcesses) => {
     setTreeData(prev => updateTreeRecursively(prev, activePathIds, newProcesses));
  };

  const addProcess = () => {
    const newId = `p-${Date.now()}`;
    const newProcess = { id: newId, name: '', isVA: false, ct: 0, wt: 0, hasChildren: false };
    updateCurrentLayerProcesses([...processes, newProcess]);
  };

  const removeProcess = (id) => {
    updateCurrentLayerProcesses(processes.filter(p => p.id !== id));
  };

  const updateProcess = (id, field, value) => {
    updateCurrentLayerProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleDrillDown = (process) => {
     if (process.hasChildren && process.children) {
        setActivePathIds(prev => [...prev, process.children.id]);
     }
  };

  const handleManageChildren = (process) => {
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
               processes: []
           }
        };
        const newProcessesList = processes.map(p => p.id === process.id ? updatedProcess : p);
        setTreeData(prev => updateTreeRecursively(prev, activePathIds, newProcessesList));
        setActivePathIds(prev => [...prev, newChildrenId]);
     }
  };

  const handleBack = () => {
     if (activePathIds.length > 1) {
        setActivePathIds(prev => prev.slice(0, -1));
     }
  };

  // Build breadcrumb logic
  const buildBreadcrumbs = () => {
    let current = treeData;
    const crumbs = [{ id: current.id, name: current.name }];
    for (let i = 1; i < activePathIds.length; i++) {
        const childId = activePathIds[i];
        const next = current.processes.find(p => p.children && p.children.id === childId);
        if (next && next.children) {
            current = next.children;
            crumbs.push({ id: current.id, name: current.name });
        }
    }
    return crumbs;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 md:px-8">
      <SEO
        title="FlowLean — Free Online Value Stream Mapping Tool"
        description="Build, visualize, and analyze Value Stream Maps (VSM) online. FlowLean is a free Lean Manufacturing tool for process flow analysis, Lead Time calculation, and waste elimination."
        url="https://flow-lean.com/"
      />
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lean VSM Builder</h1>
            <p className="text-gray-500 mt-1">Multi-Layer Value Stream Mapping Tool</p>
          </div>
          <ExportButton canvasRef={canvasRef} />
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
                          {buildBreadcrumbs().map((item, index, arr) => {
                            const isLast = index === arr.length - 1;
                            return (
                              <div key={item.id} className="flex items-center">
                                <span className={isLast ? "text-gray-900 font-bold" : "text-gray-500"}>
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

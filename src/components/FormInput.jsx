import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  trackAddProcess,
  trackEditProcess,
  trackDeleteProcess,
  trackDrilldown,
} from '../utils/analytics';

export default function FormInput({ processes, addProcess, removeProcess, updateProcess, handleManageChildren }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 h-full">
      <div className="flex flex-col gap-3 mb-5 border-b border-gray-100 pb-4">

        {/* Baris 1: Judul (Full Width) */}
        <div className="w-full">
          <h2 className="text-2xl font-bold text-gray-800">
            Process Steps
          </h2>
        </div>
         <div className="w-full">
          <button
            onClick={() => {
              addProcess();
              trackAddProcess(processes.length + 1);
            }}
            className="flex items-center justify-center gap-1.5 bg-blue-600 text-white w-full py-2.5 rounded-md hover:bg-blue-700 transition text-sm font-medium shadow-sm"
          >
            <Plus size={18} />
            Add Process
          </button>
        </div>
      </div>

      <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2">
        {processes.map((process, index) => (
          <div key={process.id} className="p-3.5 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-3 shadow-sm hover:border-blue-200 transition-colors">

            {/* Row 1: Process Name */}
            <div className="w-full">
              <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide whitespace-nowrap">Process Name</label>
              <input
                type="text"
                value={process.name}
                onChange={(e) => {
                  updateProcess(process.id, 'name', e.target.value);
                }}
                onBlur={(e) => {
                  trackEditProcess({ processName: e.target.value, field: 'name', value: e.target.value });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="e.g. Assembly"
              />
            </div>

            {/* Row 2: Drill Down / Add Detail Flow */}
            <div className="w-full">
              <button
                onClick={() => {
                  handleManageChildren(process);
                  trackDrilldown({
                    processName: process.name,
                    action: process.hasChildren ? 'edit' : 'create',
                    layerDepth: 0,
                  });
                }}
                className={`w-full px-2.5 py-2 text-xs font-bold rounded-md border transition-colors shadow-sm text-center
                  ${process.hasChildren
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                    : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                title={process.hasChildren ? "Manage detailed flow (Drill Down)" : "Add sub-processes (Enable Drill Down)"}
              >
                {process.hasChildren ? "Edit Detail Flow" : "+ Add Detail Flow"}
              </button>
            </div>

            {/* Row 2: CT and WT */}
            <div className="flex flex-row items-end gap-3 w-full">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">CT (min)</label>
                <input
                  type="number"
                  min="0"
                  value={process.ct === 0 ? '' : process.ct}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    updateProcess(process.id, 'ct', val === '' ? 0 : parseInt(val, 10));
                  }}
                  onBlur={(e) => {
                    trackEditProcess({ processName: process.name, field: 'ct', value: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wide">WT (min)</label>
                <input
                  type="number"
                  min="0"
                  value={process.wt === 0 ? '' : process.wt}
                  placeholder="0"
                  onChange={(e) => {
                    const val = e.target.value;
                    updateProcess(process.id, 'wt', val === '' ? 0 : parseInt(val, 10));
                  }}
                  onBlur={(e) => {
                    trackEditProcess({ processName: process.name, field: 'wt', value: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>
            </div>

            {/* Row 3: Flags and Delete */}
            <div className="flex flex-row items-center justify-between w-full pt-3 mt-1 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id={`va-${process.id}`}
                    checked={process.isVA}
                    onChange={(e) => {
                      updateProcess(process.id, 'isVA', e.target.checked);
                      trackEditProcess({ processName: process.name, field: 'is_va', value: e.target.checked });
                    }}
                    className="flex-shrink-0 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                  />
                </div>
                <label htmlFor={`va-${process.id}`} className="text-sm font-bold text-gray-700 cursor-pointer select-none">
                  Value Added
                </label>
              </div>

              <button
                onClick={() => {
                  removeProcess(process.id);
                  trackDeleteProcess({
                    processName: process.name,
                    processIndex: index,
                    totalProcesses: processes.length - 1,
                  });
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Remove Process"
                disabled={processes.length === 1}
              >
                <Trash2 size={18} />
              </button>
            </div>

          </div>
        ))}
        {processes.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No processes added yet. Click "Add Process" to start.
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';

// Forward ref to allow exporting
const VSMCanvas = React.forwardRef(({ processes }, ref) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Value Stream Map</h2>
      
      <div 
        ref={ref} 
        className="flex items-center min-w-max p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200"
      >
        {processes.map((process, index) => (
          <React.Fragment key={process.id}>
            <div className="flex flex-col items-center">
              {/* Process Block */}
              <div 
                className={`w-40 p-4 rounded-lg shadow-sm border-2 text-center relative ${
                  process.isVA 
                    ? 'bg-green-50 border-green-400' 
                    : 'bg-red-50 border-red-300'
                }`}
              >
                <div className={`absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3 px-2 py-0.5 text-xs font-bold rounded-full text-white ${process.isVA ? 'bg-green-500' : 'bg-red-500'}`}>
                  {process.isVA ? 'VA' : 'NVA'}
                </div>
                
                <h3 className="font-bold text-gray-800 mb-2 truncate" title={process.name}>
                  {process.name || 'Unnamed'}
                </h3>
                
                <div className="text-sm bg-white rounded p-1 border border-gray-100 mt-2">
                  <p className="text-gray-600"><span className="font-semibold">CT:</span> {process.ct}m</p>
                </div>
              </div>
            </div>

            {/* Connection / Wait Time indicator */}
            {index < processes.length - 1 && (
              <div className="flex flex-col items-center justify-center w-24">
                <div className="relative flex items-center justify-center w-full group">
                  <div className="h-0.5 w-full bg-orange-300 relative">
                    <ArrowRight className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 text-orange-400" size={20} />
                  </div>
                </div>
                
                <div className="mt-2 bg-orange-100 px-2 py-1 rounded text-xs font-medium border border-orange-200 whitespace-nowrap">
                  WT: {process.wt}m
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
        
        {processes.length === 0 && (
          <div className="text-gray-400 italic w-full text-center">
            Map will be visualized here...
          </div>
        )}
      </div>
    </div>
  );
});

export default VSMCanvas;

import React from "react";
import ProcessCard from "./ProcessCard";
import ConnectorWT from "./ConnectorWT";

const VSMFlow = ({ processes, highestCT, onDrillDown }) => {
  // Only the FIRST process with the highest CT gets the bottleneck badge.
  // Guard: if highestCT === 0 (all processes have CT=0), no bottleneck is shown.
  const bottleneckIndex = highestCT > 0
    ? processes.findIndex(p => Number(p.ct) === highestCT)
    : -1;

  return (
    <div className="flex flex-row items-center py-6 overflow-x-auto gap-0 min-h-[300px] px-8 w-full">
      {processes.map((process, index) => (
        <React.Fragment key={process.id}>
          {/* Connector before the card (Wait time for this step) */}
          {/* We show WT of first process at the beginning, or connector between i and i+1 */}
          {(index === 0 && process.wt > 0) ? (
             <ConnectorWT wt={process.wt} />
          ) : (
            index > 0 && <ConnectorWT wt={process.wt} />
          )}

          <ProcessCard
            process={process}
            isBottleneck={index === bottleneckIndex}
            onClick={onDrillDown}
          />
        </React.Fragment>
      ))}
      
      {/* Visual buffer for the end */}
      <div className="w-12 shrink-0 h-1"></div>
    </div>
  );
};

export default VSMFlow;

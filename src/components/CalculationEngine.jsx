import React, { useState } from 'react';

const METRICS_INFO = [
  {
    key: 'totalLeadTime',
    label: 'Total Lead Time',
    unit: 'min',
    color: { bg: 'bg-blue-50', border: 'border-blue-100', label: 'text-blue-600', value: 'text-blue-900', bar: 'bg-blue-400' },
    tooltip: 'Total waktu dari awal hingga akhir proses, mencakup Cycle Time dan Waiting Time. Rumus: LT = CT + WT.',
  },
  {
    key: 'totalCT',
    label: 'Total Cycle Time',
    unit: 'min',
    color: { bg: 'bg-violet-50', border: 'border-violet-100', label: 'text-violet-600', value: 'text-violet-900', bar: 'bg-violet-400' },
    tooltip: 'Total akumulasi waktu aktif pengerjaan di seluruh proses. Tidak termasuk waktu tunggu antar proses.',
  },
  {
    key: 'vaTime',
    label: 'VA Time',
    unit: 'min',
    color: { bg: 'bg-green-50', border: 'border-green-100', label: 'text-green-600', value: 'text-green-900', bar: 'bg-green-500' },
    tooltip: 'Value Added Time — total waktu dari proses yang benar-benar memberikan nilai tambah bagi pelanggan.',
  },
  {
    key: 'nvaTime',
    label: 'NVA Time',
    unit: 'min',
    color: { bg: 'bg-red-50', border: 'border-red-100', label: 'text-red-600', value: 'text-red-900', bar: 'bg-red-400' },
    tooltip: 'Non-Value Added Time — total waktu dari proses yang tidak memberikan nilai tambah. Target utama eliminasi dalam Lean.',
  },
  {
    key: 'totalWT',
    key2: 'waitingOnly',
    label: 'Waiting Time',
    unit: 'min',
    color: { bg: 'bg-amber-50', border: 'border-amber-100', label: 'text-amber-600', value: 'text-amber-900', bar: 'bg-amber-400' },
    tooltip: 'Total antrian / waktu yang terbuang saat menunggu antar proses. Ini adalah salah satu bentuk waste (pemborosan) utama dalam Lean. Semakin kecil, semakin efisien aliran nilai Anda.',
    isWT: true,
  },
  {
    key: 'vaRatio',
    label: 'VA Ratio',
    unit: '%',
    color: { bg: 'bg-teal-50', border: 'border-teal-100', label: 'text-teal-600', value: 'text-teal-900', bar: 'bg-teal-400' },
    tooltip: 'Flow Efficiency — persentase waktu yang benar-benar bernilai tambah terhadap total Lead Time. Target ideal Lean: ≥ 25%. Industri kelas dunia dapat mencapai 50%+.',
    isRatio: true,
  },
];

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <button className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" tabIndex={-1} aria-label={`More info: ${text}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-gray-900 text-white text-[10px] font-medium rounded-lg px-3 py-2 z-50 shadow-xl leading-relaxed pointer-events-none">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}

export default function CalculationEngine({ processes }) {
  const totalCT = processes.reduce((sum, p) => sum + (Number(p.ct) || 0), 0);
  const totalWT = processes.reduce((sum, p) => sum + (Number(p.wt) || 0), 0);
  const totalLeadTime = totalCT + totalWT;
  const vaTime = processes.filter(p => p.isVA).reduce((sum, p) => sum + (Number(p.ct) || 0), 0);
  const nvaTime = processes.filter(p => !p.isVA).reduce((sum, p) => sum + (Number(p.ct) || 0), 0);
  const vaRatio = totalLeadTime > 0 ? ((vaTime / totalLeadTime) * 100).toFixed(1) : '0.0';
  const isEfficient = Number(vaRatio) >= 25;

  const values = { totalLeadTime, totalCT, totalWT, vaTime, nvaTime, vaRatio };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Lean Metrics Summary</h2>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isEfficient ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isEfficient ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isEfficient ? 'Flow Efficient' : 'High Waste Detected'}
        </div>
      </div>

      {/* Stacked mini timeline bar */}
      {/* <div className="w-full h-2 flex rounded-full overflow-hidden bg-gray-100 mb-5">
        {totalLeadTime > 0 && <>
          <div style={{ width: `${(vaTime / totalLeadTime) * 100}%` }} className="h-full bg-green-500 transition-all duration-700"></div>
          <div style={{ width: `${(nvaTime / totalLeadTime) * 100}%` }} className="h-full bg-red-400 transition-all duration-700"></div>
          <div style={{ width: `${(totalWT / totalLeadTime) * 100}%` }} className="h-full bg-orange-400 transition-all duration-700"></div>
        </>}
      </div> */}

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {METRICS_INFO.map((m, idx) => {
          const rawValue = m.isWT ? values.totalWT : (m.isRatio ? values.vaRatio : values[m.key]);
          const displayValue = m.isRatio ? `${rawValue}%` : `${rawValue}`;
          return (
            <div
              key={idx}
              className={`relative ${m.color.bg} border ${m.color.border} rounded-xl p-3 flex flex-col gap-2 group`}
            >
              {/* Top row: label + info icon */}
              <div className="flex items-start justify-between gap-1">
                <p className={`text-[10px] font-bold uppercase tracking-wide leading-tight ${m.color.label}`}>
                  {m.label}
                </p>
                <InfoTooltip text={m.tooltip} />
              </div>

              {/* Value */}
              <p className={`text-xl font-bold leading-none ${m.color.value}`}>
                {displayValue}
              </p>

              {/* Unit */}
              <p className={`text-[10px] ${m.color.label} opacity-70 font-medium`}>
                {m.isRatio ? 'efficiency' : 'minutes'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * GA4 Event Tracking Utility — VSM Lean App
 *
 * Struktur event yang digunakan:
 *   event_name     : snake_case, deskriptif
 *   event_category : grouping logis (process_management | navigation | export | visualization)
 *   event_label    : (opsional) identifier tambahan yang mudah dibaca di GA4
 *
 * Cara pakai:
 *   import { trackEvent, EVENTS } from '../utils/analytics';
 *   trackEvent(EVENTS.ADD_PROCESS, { total_processes: 5 });
 */

// ─── Event Name Catalog ────────────────────────────────────────────────────────
// Sentralisasi nama event agar tidak ada typo & mudah di-refactor
export const EVENTS = {
  // Process Management
  ADD_PROCESS:    'add_process_click',
  EDIT_PROCESS:   'edit_process_click',
  DELETE_PROCESS: 'delete_process_click',

  // Visualization
  GENERATE_VSM:   'generate_vsm_click',
  BOTTLENECK:     'bottleneck_click',

  // Navigation
  DRILLDOWN:      'drilldown_process_click',
  BACK_NAV:       'back_navigation_click',
  BREADCRUMB_NAV: 'breadcrumb_navigation_click',

  // Export
  EXPORT_PNG:     'export_png_click',
  EXPORT_PDF:     'export_pdf_click',
};

// ─── Category Catalog ──────────────────────────────────────────────────────────
export const CATEGORY = {
  PROCESS_MANAGEMENT: 'process_management',
  NAVIGATION:         'navigation',
  EXPORT:             'export',
  VISUALIZATION:      'visualization',
};

// ─── Core trackEvent Helper ────────────────────────────────────────────────────
/**
 * Kirim event ke GA4 via gtag('event', ...).
 * Aman digunakan meskipun gtag belum ready / diblokir adblocker.
 *
 * @param {string} eventName  - Nama event dari EVENTS catalog (snake_case)
 * @param {Object} params     - Parameter tambahan (event_category, event_label, dll)
 */
export const trackEvent = (eventName, params = {}) => {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', eventName, {
    event_category: CATEGORY.VISUALIZATION, // default fallback
    ...params,
  });

  // Debug log hanya di development build
  if (import.meta.env.DEV) {
    console.log(`[GA4 Event] ${eventName}`, { event_category: CATEGORY.VISUALIZATION, ...params });
  }
};

// ─── Pre-built Event Helpers ───────────────────────────────────────────────────
// Gunakan helper ini di komponen agar tidak perlu ingat nama event / parameter.

/** Dipanggil saat user klik tombol "Add Process" */
export const trackAddProcess = (totalProcesses) =>
  trackEvent(EVENTS.ADD_PROCESS, {
    event_category: CATEGORY.PROCESS_MANAGEMENT,
    event_label: `total_${totalProcesses}`,
    total_processes: totalProcesses,
  });

/** Dipanggil saat user selesai mengedit field di process card (onBlur) */
export const trackEditProcess = ({ processName, field, value } = {}) =>
  trackEvent(EVENTS.EDIT_PROCESS, {
    event_category: CATEGORY.PROCESS_MANAGEMENT,
    event_label: field,
    process_name: processName,
    field,
    value,
  });

/** Dipanggil saat user menghapus sebuah process */
export const trackDeleteProcess = ({ processName, processIndex, totalProcesses } = {}) =>
  trackEvent(EVENTS.DELETE_PROCESS, {
    event_category: CATEGORY.PROCESS_MANAGEMENT,
    event_label: processName,
    process_name: processName,
    process_index: processIndex,
    total_processes: totalProcesses,
  });

/** Dipanggil saat diagram VSM di-render (first render atau setelah perubahan signifikan) */
export const trackGenerateVSM = ({ totalProcesses, totalVA, totalNVA } = {}) =>
  trackEvent(EVENTS.GENERATE_VSM, {
    event_category: CATEGORY.VISUALIZATION,
    event_label: `processes_${totalProcesses}`,
    total_processes: totalProcesses,
    total_va: totalVA,
    total_nva: totalNVA,
  });

/** Dipanggil saat user klik process card yang merupakan bottleneck */
export const trackBottleneckClick = ({ processName, processCT } = {}) =>
  trackEvent(EVENTS.BOTTLENECK, {
    event_category: CATEGORY.VISUALIZATION,
    event_label: processName,
    process_name: processName,
    process_ct: processCT,
  });

/** Dipanggil saat user drill down ke sub-layer */
export const trackDrilldown = ({ processName, action = 'view', layerDepth } = {}) =>
  trackEvent(EVENTS.DRILLDOWN, {
    event_category: CATEGORY.NAVIGATION,
    event_label: processName,
    process_name: processName,
    action,
    layer_depth: layerDepth,
  });

/** Dipanggil saat user klik tombol "Back to Parent Process" */
export const trackBackNavigation = (layerDepth) =>
  trackEvent(EVENTS.BACK_NAV, {
    event_category: CATEGORY.NAVIGATION,
    event_label: `depth_${layerDepth}`,
    layer_depth: layerDepth,
  });

/** Dipanggil saat user klik breadcrumb untuk navigasi ke layer tertentu */
export const trackBreadcrumbNavigation = ({ targetName, targetIndex } = {}) =>
  trackEvent(EVENTS.BREADCRUMB_NAV, {
    event_category: CATEGORY.NAVIGATION,
    event_label: targetName,
    target_layer_name: targetName,
    target_layer_index: targetIndex,
  });

/** Dipanggil saat user klik "Download PNG" */
export const trackExportPNG = (totalProcesses) =>
  trackEvent(EVENTS.EXPORT_PNG, {
    event_category: CATEGORY.EXPORT,
    event_label: `processes_${totalProcesses}`,
    total_processes: totalProcesses,
  });

/** Dipanggil saat user klik "Download PDF" */
export const trackExportPDF = (totalProcesses) =>
  trackEvent(EVENTS.EXPORT_PDF, {
    event_category: CATEGORY.EXPORT,
    event_label: `processes_${totalProcesses}`,
    total_processes: totalProcesses,
  });

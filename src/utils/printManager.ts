import { PackageData } from '../types';

/**
 * Isolated, high-fidelity print & PDF export engine.
 * Renders the quotation sheet in an isolated hidden iframe with custom <title>
 * and clean A4 styling without text truncation or clipped numbers.
 */
export function printIsolatedCostingSheet(packageData: PackageData): void {
  const pkgName = (packageData.packageDetails.packageName || 'Domestic Tour Package').trim();
  const travelDate = (packageData.packageDetails.travelDate || new Date().toISOString().split('T')[0]).trim();
  const days = packageData.packageDetails.days || 1;
  const nights = packageData.packageDetails.nights || 0;

  // 100% Windows-safe file name
  const safeFilename = `${pkgName} - ${travelDate} - ${days} Days ${nights} Nights`
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  const printElement = document.getElementById('printable-costing-sheet');
  if (!printElement) {
    document.title = safeFilename;
    window.print();
    return;
  }

  // Create isolated invisible iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;z-index:-1;');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.title = safeFilename;
    window.print();
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    return;
  }

  // Extract stylesheets
  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((el) => el.outerHTML)
    .join('\n');

  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>${safeFilename}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0;
            padding: 0;
            font-size: 11px;
            line-height: 1.4;
          }
          .print-only {
            display: block !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          th, td {
            border: 1px solid #cbd5e1 !important;
            padding: 5px 8px !important;
            text-align: left;
          }
          th {
            background-color: #f1f5f9 !important;
            font-weight: 700 !important;
            color: #1e293b !important;
          }
        </style>
      </head>
      <body>
        <div class="print-only">
          ${printElement.innerHTML}
        </div>
      </body>
    </html>
  `);
  iframeDoc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print fallback triggered:', e);
      document.title = safeFilename;
      window.print();
    } finally {
      setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 3000);
    }
  }, 250);
}

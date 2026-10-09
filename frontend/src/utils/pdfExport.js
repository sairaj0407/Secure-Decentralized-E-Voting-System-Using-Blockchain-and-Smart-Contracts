import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exports a specified DOM element to a high-resolution, print-ready PDF document.
 * Designed for official Election Commission of India (ECI) e-EPIC identity cards
 * and statutory voting slips (VVPAT equivalents).
 *
 * @param {HTMLElement} element - The DOM element to capture.
 * @param {string} filename - The target filename (e.g. 'ECI_e-EPIC_BR3048080.pdf').
 * @param {object} options - Customization options (orientation, format, title, etc.).
 */
export async function exportToPdf(element, filename = "ECI_Document.pdf", options = {}) {
  if (!element) {
    console.error("PDF Export Error: Target element not provided.");
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: options.scale || 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: options.backgroundColor || "#ffffff",
      windowWidth: options.windowWidth || undefined,
      onclone: (clonedDoc) => {
        const noPrintElements = clonedDoc.querySelectorAll(".no-print");
        noPrintElements.forEach((el) => {
          el.style.display = "none";
        });
      }
    });

    const imgData = canvas.toDataURL("image/png");

    const orientation = options.orientation || (canvas.width > canvas.height ? "landscape" : "portrait");
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: options.format || "a4"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = options.margin !== undefined ? options.margin : 10;
    const availWidth = pageWidth - margin * 2;
    const availHeight = pageHeight - margin * 2;

    let renderWidth = availWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    if (renderHeight > availHeight) {
      renderHeight = availHeight;
      renderWidth = (canvas.width * renderHeight) / canvas.height;
    }

    const posX = margin + (availWidth - renderWidth) / 2;
    const posY = margin + (availHeight - renderHeight) / 2;

    pdf.addImage(imgData, "PNG", posX, posY, renderWidth, renderHeight, undefined, "FAST");
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error("Failed to generate PDF document:", error);
    window.print();
    return false;
  }
}

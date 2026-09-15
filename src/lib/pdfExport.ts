import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

export async function exportCVToPDF(elementId: string, fileName: string = 'Curriculo-Profissional.pdf'): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Elemento não encontrado');
  }

  // Yield to main thread immediately so touch/click feedback is instant
  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    // Generate high-resolution image natively using the browser's rendering engine.
    // This perfectly supports all modern CSS including Tailwind v4's oklch colors,
    // gradients, and modern layout features without canvas parsing errors.
    const dataUrl = await toJpeg(element, {
      quality: 0.98,
      pixelRatio: 2.5, // High resolution for crisp professional print quality
      backgroundColor: '#ffffff',
      filter: (node) => {
        // Exclude UI action buttons and elements marked to be ignored
        if (node instanceof HTMLElement) {
          if (node.dataset?.html2canvasIgnore === 'true') {
            return false;
          }
        }
        return true;
      },
      style: {
        transform: 'none', // Remove any UI scaling for the export
        boxShadow: 'none', // Remove UI shadows
        margin: '0',
      },
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(dataUrl);
    const imgWidth = imgProps.width;
    const imgHeight = imgProps.height;
    
    const calculatedHeight = (imgHeight / imgWidth) * pdfWidth;

    if (calculatedHeight <= pdfHeight) {
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, calculatedHeight, undefined, 'FAST');
    } else {
      let heightLeft = calculatedHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      // Handle multi-page documents (like long resumes or cover letters)
      while (heightLeft > 0) {
        position = heightLeft - calculatedHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'JPEG', 0, position, pdfWidth, calculatedHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    // Force real Chrome-style Blob download trigger
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

  } catch (error) {
    console.error('PDF export error:', error);
    throw new Error('Falha ao gerar o ficheiro PDF. Por favor, verifique a sua ligação ou tente num computador.');
  }
}

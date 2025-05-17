// Utility for downloading application as PDF
// This uses html2canvas and jsPDF

export async function downloadAsPDF(elementId, filename = 'application.pdf') {
  try {
    // Check if running in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.error('PDF generation requires a browser environment');
      return false;
    }
    
    // Check if element exists
    const element = document.getElementById(elementId);
    if (!element) {
      console.error('Element not found:', elementId);
      return false;
    }
    
    // Show a loading message
    const loadingMessage = document.createElement('div');
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.background = 'rgba(255,255,255,0.9)';
    loadingMessage.style.borderRadius = '8px';
    loadingMessage.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    loadingMessage.style.zIndex = '9999';
    loadingMessage.innerText = 'Generating PDF...';
    document.body.appendChild(loadingMessage);
    
    try {
      // Import libraries dynamically to reduce initial load time
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas').then(module => module.default),
        import('jspdf').then(module => module.default)
      ]);

      // Prepare the element for direct rendering
      // First, add specific print styles to properly display tables
      const printStyle = document.createElement('style');
      printStyle.id = 'print-pdf-style';
      printStyle.textContent = `
        /* Force table layouts */
        #${elementId} table {
          border-collapse: collapse !important;
          width: 100% !important;
          table-layout: fixed !important;
        }
        
        #${elementId} table td, 
        #${elementId} table th {
          border: 1px solid #ccc !important;
          padding: 4px !important;
          vertical-align: middle !important;
          height: 24px !important;
          font-size: 10px !important;
        }
        
        #${elementId} .inline-block.w-3.h-3 {
          display: inline-block !important;
          width: 8px !important; 
          height: 8px !important;
          min-width: 8px !important;
          min-height: 8px !important;
          border-radius: 50% !important;
          margin-right: 4px !important;
          vertical-align: middle !important;
        }
        
        #${elementId} .bg-green-500 {
          background-color: #10B981 !important;
        }
        
        #${elementId} .bg-gray-300 {
          background-color: #D1D5DB !important;
        }
        
        /* Fix Bonus Points & Eligibility section */
        #${elementId} .border.rounded-md.overflow-hidden {
          page-break-inside: avoid !important;
          box-sizing: border-box !important;
        }
        
        /* Fix grid layouts */
        #${elementId} .grid {
          display: grid !important;
        }
        
        #${elementId} .grid-cols-1 {
          grid-template-columns: 1fr !important;
        }
        
        #${elementId} .grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        
        #${elementId} .print\\:grid-cols-2 {
          grid-template-columns: 1fr 1fr !important;
        }
        
        #${elementId} .border-r {
          border-right: 1px solid #ccc !important;
        }
      `;
      document.head.appendChild(printStyle);
      
      // Use a more direct approach - create a temporary image of the element with html2canvas
      const scale = 1.5; // Higher scale for better quality
      
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate canvas
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#FFFFFF',
        allowTaint: true,
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight,
        onclone: (clonedDoc) => {
          // Get cloned element
          const clonedElement = clonedDoc.getElementById(elementId);
          
          // Hide elements not meant for printing
          const printHiddenElements = clonedElement.querySelectorAll('.print\\:hidden');
          printHiddenElements.forEach(el => {
            el.style.display = 'none';
          });
          
          // Set table cell vertical alignment
          const tableCells = clonedElement.querySelectorAll('td, th');
          tableCells.forEach(cell => {
            cell.style.verticalAlign = 'middle';
            cell.style.textAlign = cell.classList.contains('text-center') ? 'center' : 
                                  cell.classList.contains('text-right') ? 'right' : 'left';
            cell.style.paddingTop = '4px';
            cell.style.paddingBottom = '4px';
            cell.style.paddingLeft = '6px';
            cell.style.paddingRight = '6px';
            cell.style.height = '24px';
            
            // Ensure content is visible
            cell.style.overflow = 'visible';
            cell.style.whiteSpace = 'normal';
          });
          
          // Fix grid layouts
          const gridElements = clonedElement.querySelectorAll('.grid');
          gridElements.forEach(grid => {
            grid.style.display = 'grid';
            
            // Set grid to fixed layout based on class
            if (grid.classList.contains('grid-cols-2') || grid.classList.contains('print:grid-cols-2')) {
              grid.style.gridTemplateColumns = '1fr 1fr';
            } else if (grid.classList.contains('grid-cols-3')) {
              grid.style.gridTemplateColumns = '1fr 1fr 1fr';
            } else {
              grid.style.gridTemplateColumns = '1fr';
            }
            
            // Add some gap
            grid.style.gap = '8px';
          });
          
          // Fix indicator dots
          const dots = clonedElement.querySelectorAll('.inline-block.w-3.h-3');
          dots.forEach(dot => {
            dot.style.display = 'inline-block';
            dot.style.width = '8px';
            dot.style.height = '8px';
            dot.style.borderRadius = '50%';
            dot.style.margin = '0 4px 0 0';
            dot.style.verticalAlign = 'middle';
            
            // Ensure colors show in PDF
            if (dot.classList.contains('bg-green-500')) {
              dot.style.backgroundColor = '#10B981';
            } else if (dot.classList.contains('bg-gray-300')) {
              dot.style.backgroundColor = '#D1D5DB';
            }
          });
          //Add aa page break here 
          // Bonus Points & Eligibility section - special treatment
          const bonusSection = clonedElement.querySelector('.border.rounded-md.overflow-hidden');
          if (bonusSection) {
            bonusSection.style.breakInside = 'avoid';
            bonusSection.style.pageBreakInside = 'avoid';
            bonusSection.style.display = 'block';
            bonusSection.style.margin = '15px 0';
            bonusSection.style.border = '1px solid #ccc';
          }
          
          // Apply specific styling to force page breaks
          const pageBreaks = clonedElement.querySelectorAll('.pdf-page-break');
          pageBreaks.forEach(pageBreak => {
            pageBreak.style.pageBreakAfter = 'always';
            pageBreak.style.breakAfter = 'page';
            pageBreak.style.display = 'block';
            pageBreak.style.height = '1px';
            pageBreak.style.width = '100%';
            pageBreak.style.margin = '0';
            pageBreak.style.padding = '0';
          });
          
          // Force tables to be fixed layout with equal columns
          const tables = clonedElement.querySelectorAll('table');
          tables.forEach(table => {
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.tableLayout = 'fixed';
            
            // Add border to all cells
            const cells = table.querySelectorAll('td, th');
            cells.forEach(cell => {
              cell.style.border = '1px solid #ccc';
            });
          });
          
          return clonedDoc;
        }
      });
      
      // Calculate dimensions
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate dimensions for A4 paper
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Calculate image dimensions maintaining aspect ratio
      const canvasAspectRatio = canvas.width / canvas.height;
      const imgWidth = pdfWidth;
      const imgHeight = imgWidth / canvasAspectRatio;
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
        // Remove headers and footers
        compress: true
      });
      
      // Disable headers/footers in the PDF
      pdf.setDisplayMode('fullwidth', 'continuous');
      
      // Add margins - but not for headers/footers
      const margin = 10; // mm
      
      // Calculate number of pages needed
      const totalPages = Math.ceil(imgHeight / pdfHeight);
      
      // Add each page
      for (let i = 0; i < totalPages; i++) {
        // Add new page if not first page
        if (i > 0) {
          pdf.addPage();
        }
        
        // Calculate crop area for current page
        const sourceY = i * (canvas.height * (pdfHeight / imgHeight));
        const sourceHeight = Math.min(canvas.height - sourceY, canvas.height * (pdfHeight / imgHeight));
        
        // Create a new canvas for this page slice
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sourceHeight;
        
        // Draw the slice of the original canvas
        const ctx = pageCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0, sourceY,
          canvas.width, sourceHeight,
          0, 0,
          pageCanvas.width, pageCanvas.height
        );
        
        // Add this slice to the PDF
        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(
          pageImgData,
          'PNG',
          0, 0,
          pdfWidth, (sourceHeight * pdfWidth) / canvas.width
        );
      }
      
      // Save the PDF
      pdf.save(filename);
      
      return true;
    } finally {
      // Clean up
      const printStyle = document.getElementById('print-pdf-style');
      if (printStyle) printStyle.remove();
      
      if (loadingMessage && loadingMessage.parentNode) {
        loadingMessage.parentNode.removeChild(loadingMessage);
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('Failed to generate PDF. Please try again or use Print instead.');
    return false;
  }
} 
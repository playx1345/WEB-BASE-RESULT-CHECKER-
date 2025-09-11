import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface StudentResult {
  id: string;
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  session: string;
  level: string;
}

interface StudentProfile {
  full_name: string;
  matric_number?: string;
  level: string;
}

interface PDFGenerationOptions {
  results: StudentResult[];
  profile: StudentProfile;
  cgpa?: number;
  totalGP?: number;
}

export const generateResultsPDF = async ({
  results,
  profile,
  cgpa = 0,
  totalGP = 0
}: PDFGenerationOptions): Promise<void> => {
  try {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('STUDENT ACADEMIC RESULTS', pageWidth / 2, 20, { align: 'center' });
    
    // Student Info
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    let yPosition = 40;
    
    pdf.text(`Student Name: ${profile.full_name}`, 20, yPosition);
    yPosition += 8;
    
    if (profile.matric_number) {
      pdf.text(`Matric Number: ${profile.matric_number}`, 20, yPosition);
      yPosition += 8;
    }
    
    pdf.text(`Level: ${profile.level}`, 20, yPosition);
    yPosition += 8;
    
    pdf.text(`CGPA: ${cgpa.toFixed(2)}`, 20, yPosition);
    yPosition += 8;
    
    pdf.text(`Total Grade Points: ${totalGP.toFixed(2)}`, 20, yPosition);
    yPosition += 15;
    
    // Table headers
    pdf.setFont('helvetica', 'bold');
    pdf.text('Course Code', 20, yPosition);
    pdf.text('Course Title', 60, yPosition);
    pdf.text('CU', 130, yPosition);
    pdf.text('Grade', 150, yPosition);
    pdf.text('GP', 170, yPosition);
    
    // Draw line under headers
    yPosition += 2;
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 8;
    
    // Results
    pdf.setFont('helvetica', 'normal');
    
    // Group results by session and semester
    const groupedResults = results.reduce((acc, result) => {
      const key = `${result.session} - ${result.semester}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(result);
      return acc;
    }, {} as Record<string, StudentResult[]>);
    
    Object.entries(groupedResults).forEach(([sessionSemester, sessionResults]) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Session/Semester header
      pdf.setFont('helvetica', 'bold');
      pdf.text(sessionSemester, 20, yPosition);
      yPosition += 8;
      
      pdf.setFont('helvetica', 'normal');
      
      sessionResults.forEach((result) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(result.course_code, 20, yPosition);
        
        // Truncate long course titles
        const maxTitleLength = 30;
        const courseTitle = result.course_title.length > maxTitleLength 
          ? result.course_title.substring(0, maxTitleLength) + '...'
          : result.course_title;
        pdf.text(courseTitle, 60, yPosition);
        
        pdf.text(result.credit_unit.toString(), 130, yPosition);
        pdf.text(result.grade, 150, yPosition);
        pdf.text(result.point.toFixed(2), 170, yPosition);
        
        yPosition += 6;
      });
      
      yPosition += 5; // Extra space between sessions
    });
    
    // Footer
    const currentDate = new Date().toLocaleDateString();
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${currentDate}`, 20, pageHeight - 10);
    pdf.text('Barkin Grade Access System', pageWidth - 20, pageHeight - 10, { align: 'right' });
    
    // Download the PDF
    const fileName = `${profile.full_name.replace(/\s+/g, '_')}_Results_${currentDate.replace(/\//g, '-')}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export const generateResultsFromElement = async (elementId: string, fileName: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }
    
    const canvas = await html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF from element:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};
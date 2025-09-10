import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

// Export analytics data to PDF
export const exportAnalyticsToPDF = async (elementId: string, filename: string = 'analytics-report') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found');
    }

    // Create canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Calculate dimensions to fit the page
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    // Add title
    pdf.setFontSize(16);
    pdf.text('Analytics Report', 20, 20);
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
    
    position = 40;

    // Add the image
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add new pages if content is longer than one page
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
};

// Export analytics data to Excel
export const exportAnalyticsToExcel = (data: any, filename: string = 'analytics-data') => {
  try {
    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Students', data.totalStudents || 0],
      ['Excellent Performers', data.excellentPerformers || 0],
      ['Average Performers', data.averagePerformers || 0],
      ['Students Needing Support', data.strugglingStudents || 0],
      ['Fee Collection Rate', `${data.feeCollectionRate || 0}%`],
      ['Report Generated', new Date().toLocaleString()]
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    // Create level distribution sheet
    if (data.levelDistribution) {
      const levelData = [
        ['Level', 'Student Count'],
        ...Object.entries(data.levelDistribution).map(([level, count]) => [level, count])
      ];
      const levelSheet = XLSX.utils.aoa_to_sheet(levelData);
      XLSX.utils.book_append_sheet(workbook, levelSheet, 'Level Distribution');
    }

    // Create grade distribution sheet
    if (data.gradeDistribution) {
      const gradeData = [
        ['Grade', 'Count'],
        ...Object.entries(data.gradeDistribution).map(([grade, count]) => [grade, count])
      ];
      const gradeSheet = XLSX.utils.aoa_to_sheet(gradeData);
      XLSX.utils.book_append_sheet(workbook, gradeSheet, 'Grade Distribution');
    }

    // Create top performers sheet
    if (data.topPerformers && Array.isArray(data.topPerformers)) {
      const performersData = [
        ['Rank', 'Matric Number', 'Full Name', 'Level', 'CGPA'],
        ...data.topPerformers.map((performer: any) => [
          performer.rank,
          performer.matricNumber,
          performer.fullName,
          performer.level,
          performer.cgp
        ])
      ];
      const performersSheet = XLSX.utils.aoa_to_sheet(performersData);
      XLSX.utils.book_append_sheet(workbook, performersSheet, 'Top Performers');
    }

    // Create subject analysis sheet
    if (data.subjectAnalysis && Array.isArray(data.subjectAnalysis)) {
      const subjectData = [
        ['Course Code', 'Course Title', 'Average Grade Point', 'Student Count', 'Pass Rate'],
        ...data.subjectAnalysis.map((subject: any) => [
          subject.courseCode,
          subject.courseTitle,
          subject.averagePoint,
          subject.studentCount,
          `${subject.passRate}%`
        ])
      ];
      const subjectSheet = XLSX.utils.aoa_to_sheet(subjectData);
      XLSX.utils.book_append_sheet(workbook, subjectSheet, 'Subject Analysis');
    }

    // Save the file
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

// Export individual student performance report
export const exportStudentReportToPDF = async (studentData: any, elementId: string) => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Student report element not found');
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add header
    pdf.setFontSize(18);
    pdf.text('Student Performance Report', 20, 20);
    
    pdf.setFontSize(12);
    pdf.text(`Student: ${studentData.fullName}`, 20, 35);
    pdf.text(`Matric Number: ${studentData.matricNumber}`, 20, 45);
    pdf.text(`Level: ${studentData.level}`, 20, 55);
    pdf.text(`CGPA: ${studentData.cgp}`, 20, 65);
    pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 75);

    // Add the chart/report content
    pdf.addImage(imgData, 'PNG', 0, 85, imgWidth, Math.min(imgHeight, 200));

    pdf.save(`student-report-${studentData.matricNumber}.pdf`);
  } catch (error) {
    console.error('Error exporting student report to PDF:', error);
    throw error;
  }
};
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Result {
  course_code: string;
  course_title: string;
  credit_unit: number;
  grade: string;
  point: number;
  semester: string;
  session: string;
  level: string;
}

interface StudentInfo {
  full_name: string;
  matric_number: string;
  level: string;
  cgpa?: number;
}

export const generateTranscript = (
  studentInfo: StudentInfo,
  results: Result[]
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Plateau State Polytechnic Barkin Ladi', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('Computer Science Department', pageWidth / 2, 28, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text('ACADEMIC TRANSCRIPT', pageWidth / 2, 36, { align: 'center' });
  
  // Student Information
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const studentInfoY = 48;
  doc.text(`Name: ${studentInfo.full_name}`, 14, studentInfoY);
  doc.text(`Matric Number: ${studentInfo.matric_number}`, 14, studentInfoY + 6);
  doc.text(`Level: ${studentInfo.level}`, 14, studentInfoY + 12);
  if (studentInfo.cgpa !== undefined) {
    doc.text(`CGPA: ${studentInfo.cgpa.toFixed(2)}`, 14, studentInfoY + 18);
  }
  
  doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, pageWidth - 14, studentInfoY, { align: 'right' });
  
  // Group results by session and semester
  const groupedResults = results.reduce((acc, result) => {
    const key = `${result.session} - ${result.semester}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(result);
    return acc;
  }, {} as Record<string, Result[]>);
  
  let currentY = studentInfoY + 30;
  
  // Generate table for each session/semester
  Object.entries(groupedResults).forEach(([sessionSemester, semesterResults]) => {
    // Calculate semester GPA
    const totalCredits = semesterResults.reduce((sum, result) => sum + result.credit_unit, 0);
    const totalGradePoints = semesterResults.reduce(
      (sum, result) => sum + result.point * result.credit_unit,
      0
    );
    const semesterGPA = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Session/Semester header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(sessionSemester, 14, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(`Semester GPA: ${semesterGPA}`, pageWidth - 14, currentY, { align: 'right' });
    currentY += 8;
    
    // Results table
    const tableData = semesterResults.map(result => [
      result.course_code,
      result.course_title,
      result.credit_unit.toString(),
      result.grade,
      result.point.toFixed(1),
    ]);
    
    autoTable(doc, {
      startY: currentY,
      head: [['Course Code', 'Course Title', 'Credits', 'Grade', 'Points']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 20, halign: 'center' },
      },
      margin: { left: 14, right: 14 },
      didDrawPage: (data) => {
        currentY = data.cursor?.y || currentY;
      },
    });
    
    // Get the final Y position from the last table
    const docWithAutoTable = doc as typeof doc & { lastAutoTable?: { finalY: number } };
    currentY = docWithAutoTable.lastAutoTable?.finalY ? docWithAutoTable.lastAutoTable.finalY + 10 : currentY + 10;
  });
  
  // Overall statistics
  if (currentY > 260) {
    doc.addPage();
    currentY = 20;
  }
  
  const totalCreditsEarned = results.reduce((sum, result) => sum + result.credit_unit, 0);
  const totalGradePoints = results.reduce(
    (sum, result) => sum + result.point * result.credit_unit,
    0
  );
  const overallCGPA = totalCreditsEarned > 0 ? (totalGradePoints / totalCreditsEarned).toFixed(2) : '0.00';
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Overall Academic Summary', 14, currentY);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  currentY += 8;
  doc.text(`Total Credit Units Earned: ${totalCreditsEarned}`, 14, currentY);
  currentY += 6;
  doc.text(`Cumulative Grade Point Average: ${overallCGPA}`, 14, currentY);
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  doc.setFontSize(8);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      'This is an official academic transcript',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    );
  }
  
  // Save the PDF
  const filename = `transcript_${studentInfo.matric_number}_${new Date().getTime()}.pdf`;
  doc.save(filename);
};

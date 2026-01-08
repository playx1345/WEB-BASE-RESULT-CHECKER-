import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Result {
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

interface StudentInfo {
  fullName: string;
  matricNumber: string;
  level: string;
  department: string;
}

interface SemesterSummary {
  session: string;
  semester: string;
  results: Result[];
  totalCredits: number;
  totalGradePoints: number;
  gpa: number;
}

export function generateResultsPDF(
  results: Result[],
  studentInfo: StudentInfo,
  cgpa: number
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header section
  const drawHeader = (yPos: number) => {
    // Institution name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PLATEAU STATE POLYTECHNIC, BARKIN LADI', pageWidth / 2, yPos, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('School of Information and Communication Technology', pageWidth / 2, yPos + 7, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DEPARTMENT OF COMPUTER SCIENCE', pageWidth / 2, yPos + 14, { align: 'center' });
    
    // Divider line
    doc.setDrawColor(0, 100, 0);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 20, pageWidth - 20, yPos + 20);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(20, yPos + 21.5, pageWidth - 20, yPos + 21.5);
    
    return yPos + 28;
  };
  
  // Document title
  const drawTitle = (yPos: number) => {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('STUDENT ACADEMIC RESULT', pageWidth / 2, yPos, { align: 'center' });
    return yPos + 10;
  };
  
  // Student info section
  const drawStudentInfo = (yPos: number) => {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const leftMargin = 20;
    const rightColumn = pageWidth / 2 + 10;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Name:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentInfo.fullName, leftMargin + 25, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Matric No:', rightColumn, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(studentInfo.matricNumber, rightColumn + 30, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Department:', leftMargin, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(studentInfo.department, leftMargin + 30, yPos + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Level:', rightColumn, yPos + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(studentInfo.level, rightColumn + 20, yPos + 6);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Print Date:', leftMargin, yPos + 12);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date().toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    }), leftMargin + 28, yPos + 12);
    
    return yPos + 20;
  };
  
  // Group results by session and semester
  const groupedResults = results.reduce((acc, result) => {
    const key = `${result.session}|${result.semester}`;
    if (!acc[key]) {
      acc[key] = {
        session: result.session,
        semester: result.semester,
        results: [],
        totalCredits: 0,
        totalGradePoints: 0,
        gpa: 0
      };
    }
    acc[key].results.push(result);
    acc[key].totalCredits += result.credit_unit;
    acc[key].totalGradePoints += result.point * result.credit_unit;
    return acc;
  }, {} as Record<string, SemesterSummary>);
  
  // Calculate GPA for each semester
  Object.values(groupedResults).forEach(semester => {
    semester.gpa = semester.totalCredits > 0 
      ? semester.totalGradePoints / semester.totalCredits 
      : 0;
  });
  
  // Sort by session and semester
  const sortedSemesters = Object.values(groupedResults).sort((a, b) => {
    if (a.session !== b.session) {
      return a.session.localeCompare(b.session);
    }
    return a.semester === 'first' ? -1 : 1;
  });
  
  let yPosition = drawHeader(15);
  yPosition = drawTitle(yPosition);
  yPosition = drawStudentInfo(yPosition);
  
  // Draw each semester's results
  sortedSemesters.forEach((semester, index) => {
    // Check if we need a new page
    if (yPosition > 240) {
      doc.addPage();
      yPosition = drawHeader(15);
    }
    
    // Semester header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    const semesterTitle = `${semester.session} Academic Session - ${semester.semester.charAt(0).toUpperCase() + semester.semester.slice(1)} Semester`;
    doc.text(semesterTitle, 20, yPosition);
    yPosition += 5;
    
    // Results table
    const tableData = semester.results.map(result => [
      result.course_code,
      result.course_title,
      result.credit_unit.toString(),
      result.grade,
      result.point.toFixed(1),
      (result.credit_unit * result.point).toFixed(1)
    ]);
    
    autoTable(doc, {
      startY: yPosition,
      head: [['Code', 'Course Title', 'Units', 'Grade', 'Points', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [0, 100, 0],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: 0
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPosition = (doc as any).lastAutoTable.finalY + 3;
    
    // Semester summary
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Credit Units: ${semester.totalCredits}`, 20, yPosition);
    doc.text(`Total Grade Points: ${semester.totalGradePoints.toFixed(2)}`, 80, yPosition);
    doc.text(`GPA: ${semester.gpa.toFixed(2)}`, 150, yPosition);
    
    yPosition += 10;
  });
  
  // Overall CGPA section
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 30;
  }
  
  doc.setDrawColor(0, 100, 0);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`CUMULATIVE GRADE POINT AVERAGE (CGPA): ${cgpa.toFixed(2)}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  
  // Footer with disclaimer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('This is a computer-generated document. For official use, please obtain a stamped copy from the Examination and Records Office.', pageWidth / 2, yPosition, { align: 'center', maxWidth: pageWidth - 40 });
  
  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  }
  
  // Save the PDF
  const fileName = `${studentInfo.matricNumber.replace(/\//g, '-')}_Results.pdf`;
  doc.save(fileName);
}

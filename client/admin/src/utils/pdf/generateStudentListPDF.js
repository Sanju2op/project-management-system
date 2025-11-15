// utils/pdf/generateStudentListPDF.js

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const generateStudentListPDF = (division, enrollments) => {
  const doc = new jsPDF();

  const { course, semester, year } = division;
  const title = `${course} Semester ${semester} ${year} - Student List`;

  // === Header ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 22);

  // === Table Data ===
  const rows = enrollments.map((e, i) => [
    i + 1,
    e.enrollmentNumber,
    e.name || "—",
    "", // Signature
  ]);

  // === MODERN autoTable CALL (pass doc as first arg) ===
  autoTable(doc, {
    head: [["Sr. No.", "Enrollment No.", "Student Name", "Signature"]],
    body: rows,
    startY: 30,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 20, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 70 },
      3: { cellWidth: 40, halign: "center" },
    },
  });

  // === Save ===
  doc.save(`Student_List_${course}_Sem${semester}_${year}.pdf`);
};

export default generateStudentListPDF;

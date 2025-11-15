// utils/pdf/generateBlankEvaluationPDF.js
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateBlankEvaluationPDF = ({ groups, parameters }) => {
  const doc = new jsPDF("landscape", "pt", "a4");

  doc.setFontSize(20);
  doc.text("BLANK EVALUATION SHEET", 420, 40, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Generated On: ${new Date().toLocaleDateString("en-IN")}`, 700, 40);

  const VERTICAL_SPACING = 25;
  const INFO_LINE_HEIGHT = 18;

  groups.forEach((group, gIdx) => {
    let startY = gIdx === 0 ? 70 : doc.lastAutoTable.finalY + VERTICAL_SPACING;

    if (startY + INFO_LINE_HEIGHT * 4 + 100 > doc.internal.pageSize.height) {
      doc.addPage();
      startY = 70;
    }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text(`GROUP: ${group.name}`, 40, startY);

    const course = group.division?.course || "N/A";
    const semester = group.division?.semester || "N/A";

    let currentY = startY + INFO_LINE_HEIGHT;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Course / Semester: ${course} ${semester}`, 40, currentY);

    currentY += INFO_LINE_HEIGHT;
    doc.text(`Project Title: ${group.projectTitle || "-"}`, 40, currentY);

    currentY += INFO_LINE_HEIGHT;
    doc.text(`Technology: ${group.projectTechnology || "N/A"}`, 40, currentY);

    const tableStartY = currentY + VERTICAL_SPACING;

    // Table header
    const head = [["Sr", "Student", "Enroll", ...parameters, "Total"]];

    // Table body: Student names & enrollment shown, marks blank
    const members = group.members || [];
    const body = members.map((member, idx) => {
      const row = [
        idx + 1,
        member.name || "Unknown",
        member.enrollment || "N/A",
      ];
      parameters.forEach(() => row.push("")); // blank marks
      row.push(""); // blank total
      return row;
    });

    autoTable(doc, {
      startY: tableStartY,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 8, halign: "center" },
      headStyles: {
        fillColor: "#7c3aed",
        textColor: "#fff",
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 140, halign: "left" },
        2: { cellWidth: 90 },
        ...parameters.reduce((a, _, i) => {
          a[3 + i] = { cellWidth: 70 };
          return a;
        }, {}),
        [3 + parameters.length]: { cellWidth: 60, fontStyle: "bold" },
      },
      margin: { left: 40, right: 40 },
    });
  });

  doc.save("Blank_Evaluation_Sheet.pdf");
};

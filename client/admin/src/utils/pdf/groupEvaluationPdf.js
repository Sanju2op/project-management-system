import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateGroupEvaluationsPDF = ({
  groups,
  parameters,
  evaluationsMap,
}) => {
  const doc = new jsPDF("landscape", "pt", "a4");

  doc.setFontSize(20);
  doc.text("PROJECT EVALUATION REPORT", 420, 40, { align: "center" });
  doc.setFontSize(11);
  doc.text(`Generated On: ${new Date().toLocaleDateString("en-IN")}`, 700, 40);

  const VERTICAL_SPACING = 25;
  const INFO_LINE_HEIGHT = 18;

  groups.forEach((group, gIdx) => {
    let startY = 0;
    if (gIdx === 0) {
      startY = 70;
    } else {
      startY = doc.lastAutoTable.finalY + VERTICAL_SPACING;
    }

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

    const totalMarks = parameters.reduce((sum, p) => sum + (p.marks || 0), 0);

    const head = [
      [
        "Sr",
        "Student",
        "Enroll",
        ...parameters.map((p) => `${p.name} (${p.marks})`),
        `Total (${totalMarks})`,
      ],
    ];

    const members = group.members || [];

    const body = members.map((member, idx) => {
      const enrollment = member.enrollment;
      const name = member.name || "Unknown";

      const marksObj =
        evaluationsMap.byEnrollment?.[group._id]?.[enrollment] || {};

      let total = 0;
      const row = [idx + 1, name, enrollment];

      parameters.forEach((param) => {
        const m = marksObj[param._id] ?? "-";
        row.push(m);
        if (typeof m === "number") total += m;
      });

      row.push(total);
      return row;
    });

    autoTable(doc, {
      startY: tableStartY,
      head,
      body,
      theme: "grid",
      styles: { fontSize: 9, cellPadding: 5, halign: "center" },
      headStyles: {
        fillColor: "#0d9488",
        textColor: "#fff",
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 120, halign: "left" },
        2: { cellWidth: 80 },
        ...parameters.reduce((acc, _, i) => {
          acc[3 + i] = { cellWidth: 60 };
          return acc;
        }, {}),
        [3 + parameters.length]: { cellWidth: 60, fontStyle: "bold" },
      },
      margin: { left: 40, right: 40 },
    });
  });

  doc.save("Group_Evaluation_Report.pdf");
};

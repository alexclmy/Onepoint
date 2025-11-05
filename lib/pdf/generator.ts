import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Contribution, ActionType } from "@/types";
import { ACTIONS } from "@/lib/actions/action-definitions";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PDFGenerationOptions {
  userInput: string;
  selectedActions: ActionType[];
  timeline: Contribution[];
  finalOutput: string;
}

export async function generateAnalysisPDF(options: PDFGenerationOptions): Promise<Blob> {
  const { userInput, selectedActions, timeline, finalOutput } = options;

  const doc = new jsPDF();
  let yPosition = 20;

  // Header with logo/branding
  doc.setFillColor(0, 157, 223); // #009DDF
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Onepoint AI Consulting", 15, 20);

  doc.setFontSize(10);
  doc.text("Rapport d'Analyse Stratégique", 15, 26);

  doc.setTextColor(0, 0, 0);
  yPosition = 40;

  // Date
  doc.setFontSize(10);
  doc.text(
    `Généré le ${format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}`,
    15,
    yPosition
  );
  yPosition += 10;

  // Separator
  doc.setDrawColor(0, 157, 223);
  doc.line(15, yPosition, 195, yPosition);
  yPosition += 10;

  // Context Section
  doc.setFontSize(16);
  doc.setTextColor(0, 157, 223);
  doc.text("Contexte de l'Analyse", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const splitContext = doc.splitTextToSize(userInput, 180);
  doc.text(splitContext, 15, yPosition);
  yPosition += splitContext.length * 5 + 10;

  // Actions Analyzed
  doc.setFontSize(14);
  doc.setTextColor(0, 157, 223);
  doc.text("Actions Réalisées", 15, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  selectedActions.forEach((actionId) => {
    const action = ACTIONS[actionId];
    doc.text(`• ${action.name}`, 15, yPosition);
    yPosition += 6;
  });

  yPosition += 10;

  // Add new page for final output
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setTextColor(0, 157, 223);
  doc.text("Synthèse Exécutive", 15, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Split final output into sections and pages
  const sections = finalOutput.split("\n\n");
  for (const section of sections) {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const splitSection = doc.splitTextToSize(section, 180);
    doc.text(splitSection, 15, yPosition);
    yPosition += splitSection.length * 5 + 5;
  }

  // Timeline Annex
  doc.addPage();
  yPosition = 20;

  doc.setFontSize(16);
  doc.setTextColor(0, 157, 223);
  doc.text("Annexe : Timeline des Contributions", 15, yPosition);
  yPosition += 10;

  // Timeline table
  const timelineData = timeline.map((c) => [
    format(new Date(c.timestamp), "HH:mm:ss"),
    c.agentName,
    c.type,
    c.content.slice(0, 100) + (c.content.length > 100 ? "..." : ""),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Heure", "Expert", "Type", "Contribution"]],
    body: timelineData,
    theme: "striped",
    headStyles: {
      fillColor: [0, 157, 223],
      textColor: [255, 255, 255],
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 25 },
      3: { cellWidth: 'auto' },
    },
  });

  // Footer on every page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount} | Onepoint AI Consulting Tool`,
      15,
      290
    );
  }

  return doc.output("blob");
}

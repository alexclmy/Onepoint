import { NextRequest, NextResponse } from "next/server";
import { generateAnalysisPDF } from "@/lib/pdf/generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const pdfBlob = await generateAnalysisPDF(body);

    return new NextResponse(pdfBlob, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="analyse-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}

// Adaptado de ARQUEO-CONTRATOS c799a921, client/src/lib/pdfUtils.ts generatePDF.
// Mantém template original; gera no backend, sem moeda inferida ou acesso externo.
import {jsPDF} from "jspdf";
import {autoTable} from "jspdf-autotable";

export interface PDFTableColumn {
  header: string;
  dataKey: string;
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  data: Record<string,string>[];
  columns: PDFTableColumn[];
  filename: string;
}

/**
 * Gera PDF com logo do Grupo Arqueo, cabeçalho e tabela de dados
 */
export async function generatePDF(options: PDFOptions) {
  const { title, subtitle, data, columns } = options;
  
  // Criar documento PDF
  const doc = new jsPDF();
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Adicionar logo do Grupo Arqueo (SVG convertido para base64)
  // Nota: Em produção, você pode carregar a imagem do servidor
  const logoSize = 25;
  const logoX = 15;
  const logoY = 15;
  
  // Adicionar retângulo com gradiente simulado para o logo
  doc.setFillColor(255, 107, 0); // Laranja do Grupo Arqueo
  doc.roundedRect(logoX, logoY, logoSize, logoSize, 3, 3, "F");
  
  // Adicionar texto "ARQUEO" ao lado do logo
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 107, 0);
  doc.text("ARQUEO", logoX + logoSize + 5, logoY + 12);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Contract Management", logoX + logoSize + 5, logoY + 18);
  
  // Adicionar data de geração no canto superior direito
  const currentDate = new Date().toLocaleDateString("pt-BR");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em: ${currentDate}`, pageWidth - 15, logoY + 10, { align: "right" });
  
  // Linha separadora
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(0.5);
  doc.line(15, logoY + logoSize + 5, pageWidth - 15, logoY + logoSize + 5);
  
  // Título do relatório
  let currentY = logoY + logoSize + 15;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  
  // Subtítulo (opcional)
  if (subtitle) {
    currentY += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, currentY, { align: "center" });
  }
  
  currentY += 10;
  
  // Gerar tabela com autoTable
  autoTable(doc, {
    startY: currentY,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => {
      const value = row[col.dataKey];
      
      return value ?? "-";
    })),
    theme: "striped",
    headStyles: {
      fillColor: [255, 107, 0], // Laranja do Grupo Arqueo
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    margin: { left: 15, right: 15 },
    didDrawPage: (data) => {
      // Adicionar rodapé em cada página
      const pageCount = doc.getNumberOfPages();
      const currentPage = data.pageNumber;
      
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Página ${currentPage} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
      
      // Adicionar linha no rodapé
      doc.setDrawColor(230, 230, 230);
      doc.setLineWidth(0.3);
      doc.line(15, pageHeight - 15, pageWidth - 15, pageHeight - 15);
      
      // Adicionar texto do Grupo Arqueo no rodapé
      doc.setFontSize(7);
      doc.text("Grupo Arqueo - Sistema de Gestão de Contratos", 15, pageHeight - 10);
    }
  });
  
  // Salvar PDF
  return Buffer.from(doc.output("arraybuffer"));
}


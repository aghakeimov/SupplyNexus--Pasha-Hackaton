// PDF Export Service — Bravo Supermarket Invoices
// Uses jsPDF with jspdf-autotable for professional PDF generation

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BRAVO_RED = [200, 16, 46];
const BRAVO_GREEN = [0, 166, 81];

function addHeader(doc, title, subtitle) {
  doc.setFillColor(...BRAVO_RED);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BRAVO', 14, 14);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SUPERMARKET', 14, 20);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 196, 12, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(subtitle, 196, 19, { align: 'right' });
  doc.setFillColor(...BRAVO_GREEN);
  doc.rect(0, 28, 210, 2, 'F');
}

function addFooter(doc) {
  const h = doc.internal.pageSize.height;
  doc.setFillColor(...BRAVO_RED);
  doc.rect(0, h - 16, 210, 16, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('SupplyNexus ERP — Bravo Supermarket', 14, h - 6);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 196, h - 6, { align: 'right' });
}

export function exportPurchaseOrderPDF(po) {
  try {
    const doc = new jsPDF();
    addHeader(doc, 'PURCHASE ORDER', po.id);

    let y = 38;
    doc.setTextColor(0); doc.setFontSize(10);
    const info = [
      ['Supplier:', po.supplier], ['Status:', (po.status || '').toUpperCase()],
      ['Priority:', (po.priority || '').toUpperCase()], ['Created:', po.created],
      ['Delivery:', po.delivery], ['Category:', po.category],
    ];
    info.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold'); doc.text(k, 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(v || '-'), 55, y);
      y += 6;
    });

    y += 4;
    const tableResult = autoTable(doc, {
      startY: y,
      head: [['#', 'Item', 'Qty', 'Unit', 'Unit Price', 'Total']],
      body: (po.items || []).map((item, i) => [i + 1, item.name, item.qty, item.unit || 'pcs', `$${item.unitPrice}`, `$${(item.total || 0).toLocaleString()}`]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: BRAVO_RED, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40) + 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`TOTAL: $${(po.total || 0).toLocaleString()}`, 196, finalY, { align: 'right' });

    if (po.notes) {
      doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text(`Notes: ${po.notes}`, 14, finalY + 10);
    }

    addFooter(doc);
    doc.save(`${po.id}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF error: ' + err.message);
  }
}

export function exportSalesOrderPDF(so) {
  try {
    const doc = new jsPDF();
    addHeader(doc, 'SALES ORDER / INVOICE', so.id);

    let y = 38;
    doc.setTextColor(0); doc.setFontSize(10);
    const info = [
      ['Customer:', so.customer], ['Status:', (so.status || '').toUpperCase()],
      ['Date:', so.date], ['Delivery:', so.deliveryDate],
      ['Payment:', (so.paymentStatus || '').toUpperCase()], ['Method:', so.paymentMethod],
    ];
    info.forEach(([k, v]) => {
      doc.setFont('helvetica', 'bold'); doc.text(k, 14, y);
      doc.setFont('helvetica', 'normal'); doc.text(String(v || '-'), 55, y);
      y += 6;
    });

    y += 4;
    autoTable(doc, {
      startY: y,
      head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
      body: (so.items || []).map((item, i) => [i + 1, item.name, item.qty, `$${item.unitPrice}`, `$${(item.total || 0).toLocaleString()}`]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: BRAVO_GREEN, textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    const finalY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : y + 40) + 8;
    doc.setTextColor(0);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`Subtotal: $${(so.subtotal || 0).toLocaleString()}`, 196, finalY, { align: 'right' });
    doc.text(`Discount: -$${(so.discount || 0).toLocaleString()}`, 196, finalY + 5, { align: 'right' });
    doc.text(`Tax (18%): $${(so.tax || 0).toLocaleString()}`, 196, finalY + 10, { align: 'right' });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.text(`TOTAL: $${(so.total || 0).toLocaleString()}`, 196, finalY + 18, { align: 'right' });

    const sigY = finalY + 35;
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.line(14, sigY, 80, sigY); doc.text('Authorized Signature', 14, sigY + 5);
    doc.line(130, sigY, 196, sigY); doc.text('Customer Signature', 130, sigY + 5);

    addFooter(doc);
    doc.save(`${so.id}.pdf`);
  } catch (err) {
    console.error('PDF export failed:', err);
    alert('PDF error: ' + err.message);
  }
}

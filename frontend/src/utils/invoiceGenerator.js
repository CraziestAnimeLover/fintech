import jsPDF from "jspdf";

export const downloadInvoice = (tx) => {

  const doc = new jsPDF();

  const tax = (tx.amount * 0.02).toFixed(2);
  const settle = (tx.amount * 0.98).toFixed(2);

  const invoiceNumber = `INV-${tx._id.slice(-6)}`;
  const date = new Date(tx.createdAt).toLocaleDateString();

  doc.setFontSize(20);
  doc.text("PAYMENT INVOICE", 14, 20);

  doc.setFontSize(12);
  doc.text("Your Company Name", 14, 30);
  doc.text("support@company.com", 14, 36);

  doc.text(`Invoice Number: ${invoiceNumber}`, 140, 30);
  doc.text(`Date: ${date}`, 140, 36);

  doc.line(14, 45, 195, 45);

  doc.text("Transaction Details", 14, 55);

  doc.text(`Transaction ID: ${tx._id}`, 14, 65);
  doc.text(`UTR Number: ${tx.utr || "-"}`, 14, 72);
  doc.text(`Status: ${tx.status}`, 14, 79);
  doc.text(`Method: ${tx.method}`, 14, 86);

  doc.line(14, 95, 195, 95);

  doc.text("Amount Breakdown", 14, 105);

  doc.text(`Transaction Amount: ₹${tx.amount}`, 14, 115);
  doc.text(`Tax (2%): ₹${tax}`, 14, 123);
  doc.text(`Settlement Amount: ₹${settle}`, 14, 131);

  doc.line(14, 140, 195, 140);

  doc.setFontSize(10);
  doc.text("This is a system generated invoice.", 14, 155);

  doc.save(`invoice_${invoiceNumber}.pdf`);
};
import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateInvoicePDF = (order) => {
    const doc = new jsPDF();

    // === HEADER ===
    doc.setFontSize(22);
    doc.text("M/s COSTERBOX PRIVATE LIMITED", 14, 20);

    doc.setFontSize(10);
    doc.text("C/o Kanhaiya Lal Soni, Morla Rd, Ward No 2", 14, 26);
    doc.text("Lamba Hari Singh, Tonk, Rajasthan - 304503", 14, 30);
    doc.text("GSTIN: 08AALCC8989L1ZK", 14, 35);
    doc.text("Contact: support@costerbox.in", 14, 40);

    doc.line(14, 45, 196, 45); // Horizontal Line

    // === INVOICE DETAILS ===
    doc.setFontSize(12);
    doc.text("TAX INVOICE", 14, 55);

    doc.setFontSize(10);
    doc.text(`Invoice No: INV-${order.orderId}`, 14, 62);
    doc.text(`Date: ${new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}`, 14, 67);

    // === BILL TO ===
    doc.text("Bill To:", 130, 55);
    doc.text(`${order.shipping.firstName} ${order.shipping.lastName}`, 130, 60);
    doc.text(order.shipping.address, 130, 65);
    doc.text(`${order.shipping.city} - ${order.shipping.zip}`, 130, 70);
    doc.text(`Ph: ${order.shipping.phone}`, 130, 75);

    // === TABLE ===
    const tableColumn = ["#", "Item Description", "HSN", "Qty", "Rate", "Taxable", "GST %", "Tax Amt", "Total"];
    const tableRows = [];

    let totalTaxable = 0;
    let totalTax = 0;
    let grandTotal = 0;

    order.items.forEach((item, index) => {
        // We need to re-calculate per item because we stored only final.
        // Assuming GST logic is consistent.
        const name = (item.name || "Item").toLowerCase();
        let hsn = "9703";
        let rate = 0.12;

        // Simplified quick logic based on `gstUtils` to ensure PDF generation is standalone
        if (name.includes("tote") || name.includes("bag")) { hsn = "4202"; rate = 0.12; }
        else if (name.includes("diary")) { hsn = "4820"; rate = 0.12; }
        else if (name.includes("shirt")) { rate = item.price > 1000 ? 0.12 : 0.05; hsn = "6109"; }
        else if (name.includes("gamcha")) { hsn = "6302"; rate = 0.05; }

        // Backward calc from Item Price (which is inclusive)
        const unitPrice = Number(item.price);
        const taxableUnit = unitPrice / (1 + rate);
        const taxUnit = unitPrice - taxableUnit;

        const rowTotal = unitPrice * item.quantity;
        const rowTaxable = taxableUnit * item.quantity;
        const rowTax = taxUnit * item.quantity;

        totalTaxable += rowTaxable;
        totalTax += rowTax;
        grandTotal += rowTotal;

        tableRows.push([
            index + 1,
            item.name,
            hsn,
            item.quantity,
            taxableUnit.toFixed(2),
            rowTaxable.toFixed(2),
            `${(rate * 100)}%`,
            rowTax.toFixed(2),
            rowTotal.toFixed(2)
        ]);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { fontSize: 8 }
    });

    // === TOTALS SECTION ===
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.text(`Total Taxable Value: Rs. ${totalTaxable.toFixed(2)}`, 130, finalY);
    doc.text(`Total Tax Amount: Rs. ${totalTax.toFixed(2)}`, 130, finalY + 5);
    doc.setFontSize(12);
    doc.text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, 130, finalY + 12);

    doc.setFontSize(8);
    doc.text("* This is a computer generated invoice.", 14, finalY + 30);

    // Download
    doc.save(`Invoice_${order.orderId}.pdf`);
};

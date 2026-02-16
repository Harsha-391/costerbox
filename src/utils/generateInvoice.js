import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
    // Handle potential missing data safely
    const safeDate = order.createdAt?.seconds
        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
        : new Date().toLocaleDateString();

    doc.text(`Invoice No: INV-${order.orderId || 'PENDING'}`, 14, 62);
    doc.text(`Date: ${safeDate}`, 14, 67);

    // === BILL TO ===
    const shipping = order.shipping || {};
    doc.text("Bill To:", 130, 55);
    doc.text(`${shipping.firstName || ''} ${shipping.lastName || ''}`, 130, 60);
    doc.text(shipping.address || '', 130, 65);
    doc.text(`${shipping.city || ''} - ${shipping.zip || ''}`, 130, 70);
    doc.text(`Ph: ${shipping.phone || ''}`, 130, 75);

    // === TABLE ===
    const tableColumn = ["#", "Item Description", "HSN", "Qty", "Rate", "Taxable", "GST %", "Tax Amt", "Total"];
    const tableRows = [];

    let totalTaxable = 0;
    let totalTax = 0;
    let grandTotal = 0;

    const items = Array.isArray(order.items) ? order.items : [];

    items.forEach((item, index) => {
        // We need to re-calculate per item because we stored only final.
        // Assuming GST logic is consistent.
        const name = (item.name || "Item").toLowerCase();
        // Default GST 5%
        let hsn = "9703";
        let rate = 0.05;

        // Specific Logic per Category Reform
        if (name.includes("hoop")) {
            hsn = "9703";
            rate = 0.18;
        }
        else if (name.includes("tote") || name.includes("bag")) { hsn = "4202"; rate = 0.05; }
        else if (name.includes("diary") || name.includes("journal") || name.includes("notebook")) { hsn = "4820"; rate = 0.05; }
        else if (name.includes("shirt") || name.includes("tee")) { hsn = "6109"; rate = 0.05; }
        else if (name.includes("gamcha")) { hsn = "6302"; rate = 0.05; }

        // Backward calc from Item Price (which is inclusive)
        const unitPrice = Number(item.price) || 0;
        const startQty = Number(item.quantity) || 1;

        const taxableUnit = unitPrice / (1 + rate);
        const taxUnit = unitPrice - taxableUnit;

        const rowTotal = unitPrice * startQty;
        const rowTaxable = taxableUnit * startQty;
        const rowTax = taxUnit * startQty;

        totalTaxable += rowTaxable;
        totalTax += rowTax;
        grandTotal += rowTotal;

        tableRows.push([
            index + 1,
            item.name || "Item",
            hsn,
            startQty,
            taxableUnit.toFixed(2),
            rowTaxable.toFixed(2),
            `${(rate * 100)}%`,
            rowTax.toFixed(2),
            rowTotal.toFixed(2)
        ]);
    });

    // Use explicit autoTable function call
    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 85,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0] },
        styles: { fontSize: 8 }
    });

    // === TOTALS SECTION ===
    const finalY = (doc.lastAutoTable?.finalY || 85) + 10;

    doc.setFontSize(10);
    doc.text(`Total Taxable Value: Rs. ${totalTaxable.toFixed(2)}`, 130, finalY);
    doc.text(`Total Tax Amount: Rs. ${totalTax.toFixed(2)}`, 130, finalY + 5);

    doc.setFontSize(12);
    // Use the calculated total from items to ensure consistency with the table
    doc.text(`Total Amount: Rs. ${grandTotal.toFixed(2)}`, 130, finalY + 12);

    // Show Advance / Due if applicable
    if (order.payment && Number(order.payment.pendingAmount) > 0) {
        doc.setFontSize(10);
        doc.text(`Advance Paid: Rs. ${Number(order.payment.paidAmount).toFixed(2)}`, 130, finalY + 18);

        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38); // Red color for attention
        doc.text(`Balance Due: Rs. ${Number(order.payment.pendingAmount).toFixed(2)}`, 130, finalY + 25);
        doc.setTextColor(0, 0, 0); // Reset color
    } else if (order.payment) {
        // Full Payment Case
        doc.setFontSize(10);
        doc.setTextColor(22, 101, 52); // Green
        doc.text(`Paid In Full`, 130, finalY + 18);
        doc.setTextColor(0, 0, 0);
    }

    doc.setFontSize(8);
    doc.text("* This is a computer generated invoice.", 14, finalY + 35);

    // Download
    doc.save(`Invoice_${order.orderId || 'new'}.pdf`);
};

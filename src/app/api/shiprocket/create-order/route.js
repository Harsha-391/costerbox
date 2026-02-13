/* src/app/api/shiprocket/create-order/route.js */
import { NextResponse } from 'next/server';
import { db } from '../../../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { createShiprocketOrder, addPickupLocation } from '../../../../lib/shiprocket';

export async function POST(req) {
    try {
        const body = await req.json();
        const { orderId } = body;

        // 1. Fetch Order Details
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const order = orderSnap.data();
        let pickup_location_id = 'Primary';

        // 2. If Custom Order, Ensure Artisan Pickup Location Exists
        if (order.isCustomOrder && order.artisanId) {
            const artisanEmail = order.artisanEmail;
            if (!artisanEmail) throw new Error("Artisan email missing in order.");

            const artisanRef = doc(db, "users", artisanEmail);
            const artisanSnap = await getDoc(artisanRef);

            if (!artisanSnap.exists()) throw new Error("Artisan profile not found.");

            const artisan = artisanSnap.data();
            const address = artisan.pickupAddress;

            if (!address || !address.line1 || !address.city) {
                return NextResponse.json({
                    success: false,
                    message: `Artisan ${artisan.name} has not set a COMPLETE pickup address.`
                }, { status: 400 });
            }

            // Create unique pickup code for artisan
            // Shiprocket Pickup Location Code must be less than 50 chars.
            // Use sanitized email or ID.
            const pickupCode = `artisan_${artisanEmail.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)}`;

            // Try to add pickup location to Shiprocket
            try {
                await addPickupLocation({
                    pickup_location: pickupCode,
                    name: artisan.name || "Artisan",
                    email: artisan.email,
                    phone: address.phone,
                    address: address.line1,
                    city: address.city,
                    state: address.state,
                    country: 'India',
                    pin_code: address.pincode
                });
            } catch (e) {
                // Ignore if already exists (Shiprocket might error 422, which is fine)
                console.log("Pickup location add result:", e.message);
            }
            pickup_location_id = pickupCode;
        }

        // 3. Create Order Payload
        // Shiprocket requires specific fields.
        const payload = {
            order_id: orderId,
            order_date: new Date().toISOString().split('T')[0] + " 12:00", // Format YYYY-MM-DD HH:MM
            pickup_location: pickup_location_id,
            billing_customer_name: order.shipping?.firstName || "Guest",
            billing_last_name: order.shipping?.lastName || "",
            billing_address: order.shipping?.address || "No Address",
            billing_city: order.shipping?.city || "Jaipur",
            billing_pincode: order.shipping?.pincode || "302001",
            billing_state: order.shipping?.state || "Rajasthan",
            billing_country: "India",
            billing_email: order.shipping?.email || "customer@example.com",
            billing_phone: order.shipping?.phone || "9999999999",
            shipping_is_billing: true,
            order_items: [
                {
                    name: order.product?.name || "Product",
                    sku: order.product?.id || "SKU123",
                    units: 1,
                    selling_price: Number(order.payment?.paidAmount || order.totalAmount || 100),
                    discount: 0,
                    tax: 0,
                    hsn: 441112 // Dummy HSN
                }
            ],
            payment_method: "Prepaid",
            sub_total: Number(order.payment?.paidAmount || order.totalAmount || 100),
            length: 10, breadth: 10, height: 10, weight: 0.5
        };

        const shipResponse = await createShiprocketOrder(payload);

        // 4. Update Order in Firestore
        await updateDoc(orderRef, {
            shipmentId: shipResponse.shipment_id || shipResponse.order_id, // Shiprocket returns order_id and shipment_id
            awbCode: shipResponse.awb_code || null,
            status: 'shipped', // Or 'ready_to_ship'
            shiprocketOrderId: shipResponse.order_id
        });

        return NextResponse.json({ success: true, data: shipResponse });

    } catch (error) {
        console.error("Shipping API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/* src/lib/shiprocket.js */
import axios from 'axios';

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let token = null;

// 1. Authenticate and get Token
export async function getShiprocketToken() {
    if (token) return token;

    try {
        const res = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD
        });
        token = res.data.token;
        return token;
    } catch (error) {
        console.error("Shiprocket Auth Error:", error.response?.data || error.message);
        throw new Error("Failed to authenticate with Shiprocket");
    }
}

// 2. Create Order
export async function createShiprocketOrder(orderData) {
    const authToken = await getShiprocketToken();
    try {
        const res = await axios.post('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', orderData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        return res.data;
    } catch (error) {
        console.error("Shiprocket Create Order Error:", error.response?.data || error.message);
        throw error;
    }
}

// 3. Add Pickup Location (For Artisan)
export async function addPickupLocation(locationData) {
    const authToken = await getShiprocketToken();
    try {
        const res = await axios.post('https://apiv2.shiprocket.in/v1/external/settings/company/add-pickup', locationData, {
            headers: { Authorization: `Bearer ${authToken}` }
        });
        return res.data;
    } catch (error) {
        console.error("Shiprocket Add Pickup Error:", error.response?.data || error.message);
        throw error;
    }
}

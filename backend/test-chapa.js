const https = require("https");
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "CHAPA_TEST-XXXXXXXXXXXXXXXXXXXXXXXX";

const chapaPayload = JSON.stringify({
    amount: 100,
    currency: "USD",
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    phone_number: "0900000000",
    tx_ref: `test-tx-${Date.now()}`,
    callback_url: `http://localhost:5000/api/payments/webhook`,
    return_url: `http://localhost:3000/payment/verify?tx_ref=test-tx-${Date.now()}`
});

console.log("Testing Chapa Initialization API...");

const req = https.request(
    "https://api.chapa.co/v1/transaction/initialize",
    {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${CHAPA_SECRET_KEY}`,
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(chapaPayload)
        }
    },
    (res) => {
        let output = "";
        res.on("data", (chunk) => output += chunk);
        res.on("end", () => {
             console.log("Status Code:", res.statusCode);
             console.log("Response Body:", output);
        });
    }
);

req.on("error", (error) => console.error("Error:", error.message));
req.write(chapaPayload);
req.end();

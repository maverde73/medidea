
async function main() {
    const baseUrl = "http://localhost:3000";

    // 1. Login
    console.log("Logging in...");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@medidea.local", password: "admin123" }),
    });

    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Login successful, token obtained.");

    // 2. Create Activity with New Equipment
    console.log("Creating activity with new equipment...");
    // We need a valid id_modello. Let's assume 1 exists or fetch models first.
    // Let's fetch models to be safe.
    const modelsRes = await fetch(`${baseUrl}/api/modelli`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const modelsData = await modelsRes.json();
    const modelId = modelsData.data[0]?.id;

    if (!modelId) {
        console.error("No models found to test with.");
        return;
    }
    console.log(`Using model ID: ${modelId}`);

    const payload = {
        id_cliente: 1, // Assumed valid from seeds
        id_modello: modelId,
        seriale: "API-TEST-SN-" + Date.now(),
        data_apertura_richiesta: "2024-01-01",
        stato: "APERTO",
        descrizione_richiesta: "Test API creation"
    };

    const createRes = await fetch(`${baseUrl}/api/attivita`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
    });

    if (!createRes.ok) {
        console.error("Create activity failed:", await createRes.text());
    } else {
        const createData = await createRes.json();
        console.log("Activity created successfully:", JSON.stringify(createData, null, 2));
    }
}

main().catch(console.error);

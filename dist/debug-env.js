export default async function handler(req, res) {
    const base64Creds = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    const jsonCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    console.log("=== DEBUG ENV VARS ===");
    console.log("BASE64 exists:", !!base64Creds);
    console.log("JSON exists:", !!jsonCreds);
    if (base64Creds) {
        console.log("BASE64 length:", base64Creds.length);
        console.log("BASE64 first 100 chars:", base64Creds.substring(0, 100));
        try {
            const decoded = Buffer.from(base64Creds, "base64").toString("utf8");
            console.log("Decoded length:", decoded.length);
            console.log("Decoded first 200 chars:", decoded.substring(0, 200));
            JSON.parse(decoded);
            console.log("✅ BASE64 JSON is valid");
        }
        catch (err) {
            console.log("❌ BASE64 JSON error:", err.message);
        }
    }
    if (jsonCreds) {
        console.log("JSON length:", jsonCreds.length);
        console.log("JSON first 200 chars:", jsonCreds.substring(0, 200));
        try {
            JSON.parse(jsonCreds);
            console.log("✅ JSON is valid");
        }
        catch (err) {
            console.log("❌ JSON error:", err.message);
            console.log("Error position:", err.message.match(/position (\d+)/)?.[1]);
        }
    }
    res.status(200).json({
        base64Exists: !!base64Creds,
        jsonExists: !!jsonCreds,
        base64Length: base64Creds?.length,
        jsonLength: jsonCreds?.length,
    });
}

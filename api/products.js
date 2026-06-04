export default async function handler(req, res) {
    const binId = process.env.JSONBIN_ID;
    const apiKey = process.env.JSONBIN_API_KEY;

    const url = `https://api.jsonbin.io/v3/b/${binId}`;

    // OBTENER PRODUCTOS
    if (req.method === "GET") {
        const response = await fetch(`${url}/latest`, {
            headers: {
                "X-Master-Key": apiKey
            }
        });

        const data = await response.json();
        return res.status(200).json(data.record);
    }

    // GUARDAR PRODUCTOS
    if (req.method === "PUT") {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": apiKey
            },
            body: JSON.stringify(req.body)
        });

        const data = await response.json();
        return res.status(200).json(data);
    }

    return res.status(405).json({ error: "Method not allowed" });
}
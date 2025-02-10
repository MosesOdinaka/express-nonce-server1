const express = require("express");
const app = express();
app.use(express.json());

const nonces = new Set(); // Store valid nonces temporarily

app.post("/login", (req, res) => {
    const { email, password, nonce } = req.body;

    // Check if nonce is valid
    if (!nonces.has(nonce)) {
        return res.status(400).json({ success: false, message: "Invalid request" });
    }

    // Remove nonce after use to prevent reuse
    nonces.delete(nonce);

    // Proceed with authentication (dummy check for example)
    if (email === "test@example.com" && password === "password123") {
        return res.json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
});

// Use process.env.PORT for Render compatibility
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

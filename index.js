const express = require('express');
const cors = require('cors');
const { createClient } = require('@libsql/client');
require('dotenv').config(); // Ensure you have a .env file or environment variables set

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Turso Client
const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// GET ALL
app.get('/api/food/all', async (req, res) => {
    try {
        const rs = await db.execute("SELECT * FROM food_items");
        res.json({ success: true, items: rs.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST (Add)
app.post('/api/food', async (req, res) => {
    const { name, category, stock } = req.body;
    try {
        await db.execute({
            sql: "INSERT INTO food_items (name, category, stock) VALUES (?, ?, ?)",
            args: [name, category, stock]
        });
        res.status(201).json({ success: true, message: "Item added." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT (Update Stock)
app.put('/api/food', async (req, res) => {
    const { id, stock } = req.body;
    try {
        await db.execute({
            sql: "UPDATE food_items SET stock = ? WHERE id = ?",
            args: [stock, id]
        });
        res.json({ success: true, message: "Stock updated." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE
app.delete('/api/food/:id', async (req, res) => {
    try {
        await db.execute({
            sql: "DELETE FROM food_items WHERE id = ?",
            args: [req.params.id]
        });
        res.json({ success: true, message: "Deleted successfully." });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

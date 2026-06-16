const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

const db = new sqlite3.Database('./food_inventory.db');

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS food_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        category TEXT,
        stock INTEGER
    )`);
});

// GET ALL
app.get('/api/food/all', (req, res) => {
    db.all("SELECT * FROM food_items", [], (err, rows) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, items: rows });
    });
});

// POST (Add)
app.post('/api/food', (req, res) => {
    const { name, category, stock } = req.body;
    db.run("INSERT INTO food_items (name, category, stock) VALUES (?, ?, ?)", 
    [name, category, stock], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.status(201).json({ success: true, message: "Item added." });
    });
});

// PUT (Update Stock)
app.put('/api/food', (req, res) => {
    const { id, stock } = req.body;
    db.run("UPDATE food_items SET stock = ? WHERE id = ?", [stock, id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Stock updated." });
    });
});

// DELETE
app.delete('/api/food/:id', (req, res) => {
    db.run("DELETE FROM food_items WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Deleted successfully." });
    });
});

app.listen(PORT, () => console.log(`Dashboard Server running on http://localhost:${PORT}`));

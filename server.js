const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;
const db = new sqlite3.Database('./mydatabase.sqlite');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Vytvoření tabulky
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS records (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, category TEXT)");
});


// Získání všech záznamů
app.get('/records', (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT * FROM records";
    let params = [];

    if (category) {
        query += " WHERE category = ?";
        params.push(category);
    }

    if (search) {
        query += category ? " AND text LIKE ?" : " WHERE text LIKE ?";
        params.push(`%${search}%`);
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});


// Přidání nového záznamu
app.post('/records', (req, res) => {
    const { text, category } = req.body;

    if (!text || !category) {
        return res.status(400).json({ error: 'Text a kategorie jsou povinné' });
    }

    db.run("INSERT INTO records (text, category) VALUES (?, ?)", [text, category], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, text, category });
    });
});


app.put('/records/:id', (req, res) => {
    const { text, category } = req.body;
    const { id } = req.params;
    
    if (!text || !category) {
        return res.status(400).json({ error: 'Text a kategorie jsou povinné' });
    }
    
    db.run("UPDATE records SET text = ?, category = ? WHERE id = ?", [text, category, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Záznam aktualizován' });
    });
});

// Smazání záznamu
app.delete('/records/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM records WHERE id = ?", id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Záznam smazán', deletedId: id });
    });
});

app.listen(port, () => {
    console.log(`Server běží na http://localhost:${port}`);
});

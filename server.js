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

// Tabulka
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS records (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            text TEXT, 
            category TEXT DEFAULT 'Neznámá',
            sub_category TEXT DEFAULT ''
        )
    `);
});

app.get('/records', (req, res) => {
    db.all("SELECT id, text, category, IFNULL(sub_category, 'Neurčeno') AS sub_category FROM records", [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Přidání nového záznamu
app.post('/records', (req, res) => {
    const { text, category, sub_category } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text je povinný' });
    }
    const categoryValue = category || 'Neznámá';
    const subCategoryValue = category === 'úkol' ? sub_category || 'Neurčeno' : ''; 

    db.run("INSERT INTO records (text, category, sub_category) VALUES (?, ?, ?)", 
        [text, categoryValue, subCategoryValue], 
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ id: this.lastID, text, category: categoryValue, sub_category: subCategoryValue });
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

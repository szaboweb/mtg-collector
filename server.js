const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath);
});

// MySQL connection setup
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '11leve19lezeS3221',
    database: process.env.DB_NAME || 'mtgCatalog',
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('MySQL connection error:', err);
        process.exit(1);
    }
    console.log('MySQL Connected...');
});

// Routes for handling card data

// Get all cards
app.get('/cards', (req, res) => {
    const sql = 'SELECT * FROM Cards';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching cards:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json(results);
    });
});

// Add new card
app.post('/cards', (req, res) => {
    const newCard = req.body;

    // Validate newCard object
    if (!newCard || Object.keys(newCard).length === 0) {
        return res.status(400).json({ error: 'Invalid card data' });
    }

    const sql = 'INSERT INTO Cards SET ?';

    db.query(sql, newCard, (err, result) => {
        if (err) {
            console.error('Error adding card:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.json({ id: result.insertId, ...newCard });
    });
});

// File upload and processing
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;

    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).send('Internal Server Error');
        }
        try {
            const cards = JSON.parse(data);
            cards.forEach(card => {
                const sql = 'INSERT INTO Cards SET ?';
                db.query(sql, card, (err) => {
                    if (err) {
                        console.error('Error inserting card:', err);
                    }
                });
            });
            res.send('File uploaded and data inserted!');
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(400).send('Invalid JSON format');
        } finally {
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }
    });
});

// Route handler for downloading filtered cards
app.get('/download', (req, res) => {
    const filter = req.query.filter;
    const filterValue = req.query.filterValue;

    const sql = `SELECT * FROM Cards WHERE ?? = ?`;
    db.query(sql, [filter, filterValue], (err, results) => {
        if (err) {
            console.error('Error fetching filtered cards:', err);
            return res.status(500).send('Internal Server Error');
        }

        const jsonData = JSON.stringify(results);
        res.setHeader('Content-disposition', 'attachment; filename=filtered_cards.json');
        res.setHeader('Content-type', 'application/json');
        res.send(jsonData);
    });
});

// Start the server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
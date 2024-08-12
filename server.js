const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Serve static files from the "public" directory
const publicPath = path.join(__dirname);
app.use(express.static(publicPath));

// Serve the index.html file when the root URL is accessed
app.get('/', (req, res) => {
    const indexPath = path.join(publicPath, 'index.html');
    res.sendFile(indexPath);
});

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '11leve19lezeS3221',
    database: 'mtgCatalog',
    port: 3306
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Routes for handling card data

// Get all cards
app.get('/cards', (req, res) => {
    let sql = 'SELECT * FROM Cards';
    db.query(sql, (err, results) => {
        if (err) throw err;
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
app.post('/upload', upload.single('file'), (req, res) => {
    const fs = require('fs');
    const filePath = req.file.path;

    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        const cards = JSON.parse(data);
        cards.forEach(card => {
            let sql = 'INSERT INTO Cards SET ?';
            db.query(sql, card, (err, result) => {
                if (err) throw err;
            });
        });
        res.send('File uploaded and data inserted!');
    });
});

// Route handler for downloading filtered cards
app.get('/download', (req, res) => {
    // Get filter criteria from query parameters
    const filter = req.query.filter;
    const filterValue = req.query.filterValue;

    // Construct SQL query based on filter criteria
    let sql = `SELECT * FROM Cards WHERE ${filter} = ?`;
    db.query(sql, [filterValue], (err, results) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        // Convert filtered cards to JSON
        const jsonData = JSON.stringify(results);

        // Set response headers to specify file type and filename
        res.setHeader('Content-disposition', 'attachment; filename=filtered_cards.json');
        res.setHeader('Content-type', 'application/json');

        // Send JSON data as downloadable file
        res.send(jsonData);
    });
});

// Start the server
const PORT = process.env.PORT || 3300;
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

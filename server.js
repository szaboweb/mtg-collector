const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(bodyParser.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'mtgCatalog'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

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
    let newCard = req.body;
    let sql = 'INSERT INTO Cards SET ?';
    db.query(sql, newCard, (err, result) => {
        if (err) throw err;
        res.json({ id: result.insertId, ...newCard });
    });
});

// File upload and processing
app.post('/upload', upload.single('file'), (req, res) => {
    // Parse and insert JSON file data into the database
    // Code to read and process the uploaded JSON file goes here
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});


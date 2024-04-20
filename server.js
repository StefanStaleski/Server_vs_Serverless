const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const path = require('path'); // Import the path module
const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: '/uploads' });

app.use(express.static('public'));

app.use(cors());

app.post('/calculateAPI', upload.single('file'), (req, res) => {
    console.log('Successfully received file: ', req.file.originalname);

    const filePath = req.file.path;
    const sortedFilePath = path.join(__dirname, '_sorted.txt');

    const readInterface = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        console: false
    });

    const numbers = [];
    readInterface.on('line', function (line) {
        const num = parseInt(line.trim());

        if (!isNaN(num)) {
            numbers.push(num);
        };
    });

    readInterface.on('close', function () {
        numbers.sort((a, b) => b - a);

        const sortedData = numbers.join('\n');
        fs.writeFileSync(sortedFilePath, sortedData);

        return res.status(200).json({ 
            message: 'Successful calculation!', 
            data: numbers,
            sortedFile: sortedData
         });
    });

    
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
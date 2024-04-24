const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

const upload = multer({ dest: '/uploads' });

app.use(express.static('public'));
app.use(cors());

app.post('/calculateAPI', upload.single('file'), (req, res) => {
    console.log('Successfully received file: ', req.file.originalname);

    const { file, body: { numRequests } } = req;
    const filePath = file.path;
    const sortedFilePath = path.join(__dirname, '_sorted.txt');

    const numbers = [];
    let sortedData;

    const processFile = (numRequests) => {
        const promises = [];
        for (let i = 0; i < numRequests; i++) {
            promises.push(new Promise((resolve, reject) => {
                const readInterface = readline.createInterface({
                    input: fs.createReadStream(filePath),
                    output: process.stdout,
                    console: false
                });
                const localNumbers = [];
                readInterface.on('line', function (line) {
                    const num = parseInt(line.trim());
                    if (!isNaN(num)) {
                        localNumbers.push(num);
                    }
                });
                readInterface.on('close', function () {
                    localNumbers.sort((a, b) => b - a);

                    sortedData = localNumbers.join('\n');
                    fs.writeFileSync(sortedFilePath, sortedData);

                    numbers.push(localNumbers);
                    resolve();
                });
            }));
        }
        return Promise.all(promises);
    };

    processFile(numRequests)
        .then(() => {
            return res.status(200).json({
                message: 'Successful calculation!',
                data: numbers,
                numRequests: numRequests,
                sortedFile: sortedData,
            });
        })
        .catch(err => {
            console.error('Error processing file: ', err);
            return res.status(500).json({ message: 'Error processing file' });
        });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});

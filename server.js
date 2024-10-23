const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const JSObfuscator = require('javascript-obfuscator');
const AdmZip = require('adm-zip');

const app = express();
const port = 3000;

app.use(fileUpload());
app.use(express.static('public'));

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const zipFile = req.files.file;
    const zipPath = path.join(__dirname, 'uploads', zipFile.name);
    
    zipFile.mv(zipPath, (err) => {
        if (err) return res.status(500).send(err);

        const zip = new AdmZip(zipPath);
        const tempDir = path.join(__dirname, 'temp');

        zip.extractAllTo(tempDir, true);
        const files = fs.readdirSync(tempDir);

        files.forEach(file => {
            if (file.endsWith('.js')) {
                const filePath = path.join(tempDir, file);
                const code = fs.readFileSync(filePath, 'utf8');
                const obfuscatedCode = JSObfuscator.obfuscate(code).getObfuscatedCode();
                fs.writeFileSync(filePath, obfuscatedCode);
            }
        });

        const outputZip = new AdmZip();
        files.forEach(file => {
            outputZip.addLocalFile(path.join(tempDir, file));
        });

        const outputZipPath = path.join(__dirname, 'uploads', 'obfuscated.zip');
        outputZip.writeZip(outputZipPath);

        res.download(outputZipPath, (err) => {
            if (err) {
                console.log(err);
            }
            fs.rmSync(zipPath, { force: true });
            fs.rmSync(tempDir, { recursive: true, force: true });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

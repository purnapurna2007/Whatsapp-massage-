const express = require('express');
const fileUpload = require('express-fileupload');
const AdmZip = require('adm-zip');
const JavaScriptObfuscator = require('javascript-obfuscator');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for file uploads
app.use(fileUpload());
app.use(express.static('public')); // Serve static files from the public directory

app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const zipFile = req.files.file;
    
    // Process the uploaded ZIP file
    try {
        const zip = new AdmZip(zipFile.data);
        const tempDir = './temp';
        zip.extractAllTo(tempDir, true);
        
        const files = fs.readdirSync(tempDir);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const filePath = path.join(tempDir, file);
                const code = fs.readFileSync(filePath, 'utf8');
                const obfuscatedCode = JavaScriptObfuscator.obfuscate(code).getObfuscatedCode();
                fs.writeFileSync(filePath, obfuscatedCode);
            }
        });

        // Create a new ZIP with obfuscated files
        const outputZip = new AdmZip();
        files.forEach(file => {
            outputZip.addLocalFile(path.join(tempDir, file));
        });

        const outputZipPath = path.join(__dirname, 'uploads', 'obfuscated.zip');
        outputZip.writeZip(outputZipPath);

        // Send the obfuscated ZIP file as response
        res.download(outputZipPath, 'obfuscated.zip');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the ZIP file.');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

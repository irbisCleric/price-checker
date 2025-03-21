const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Path to your service account key file
const KEYFILEPATH = path.join(__dirname, '../../credentials.json');

// Scopes for Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Authenticate with Google Drive API
const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Search for a file in a specific folder
async function findFileInFolder(folderId, fileName) {
    try {
        const response = await drive.files.list({
            q: `'${folderId}' in parents and name='${fileName}'`,
            fields: 'files(id, name)',
        });

        const files = response.data.files;
        if (files.length > 0) {
            return files[0]; // Return the first matching file
        }
        return null; // File not found
    } catch (error) {
        console.error('Error finding file in folder:', error.message);
        throw error;
    }
}

// Download a file from Google Drive
async function downloadFile(fileId, destinationPath) {
    try {
        const dest = fs.createWriteStream(destinationPath);

        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        response.data.pipe(dest);

        return new Promise((resolve, reject) => {
            dest.on('finish', () => {
                console.log(`File downloaded to ${destinationPath}`);
                resolve();
            });
            dest.on('error', (err) => {
                console.error('Error downloading file:', err.message);
                reject(err);
            });
        });
    } catch (error) {
        console.error(`Error downloading file with ID ${fileId}:`, error.message);
        throw error;
    }
}

// Upload a file to a specific folder on Google Drive
async function uploadFileToFolder(filePath, fileName, folderId) {
    try {
        const fileMetadata = {
            name: fileName, // Name of the file on Google Drive
            parents: [folderId], // Specify the folder ID
        };
        const media = {
            mimeType: 'application/json',
            body: fs.createReadStream(filePath), // Read the file from the local filesystem
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id', // Return the file ID
        });

        console.log(`File uploaded to Google Drive with ID: ${response.data.id}`);
        return response.data.id;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error.message);
        throw error;
    }
}

module.exports = { findFileInFolder, downloadFile, uploadFileToFolder };

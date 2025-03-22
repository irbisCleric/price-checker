const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Load Google Cloud credentials from an environment variable
const credentials =
    JSON.parse(process.env.GCLOUD_CREDENTIALS) ||
    require('./../settings/secrets').GCLOUD_CREDENTIALS;

// Scopes for Google Drive API
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Authenticate with Google Drive API
const auth = new google.auth.GoogleAuth({
    credentials: {
        ...credentials,
    },
    scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Search for a file in a specific folder
async function findFileInFolder(gdFolderID, fileName) {
    try {
        console.log('Searching for file:', fileName, 'in folder:', gdFolderID);
        const response = await drive.files.list({
            q: `'${gdFolderID}' in parents and name='${fileName.replace(/'/g, "\\'")}'`,
            fields: 'files(id, name)',
        });

        const files = response.data.files;
        if (files.length > 0) {
            console.log(`Found file: ${files[0].name} with ID: ${files[0].id}`);
            return files[0]; // Return the first matching file
        }
        console.log('File not found.');
        return null; // File not found
    } catch (error) {
        console.error('Error finding file in folder:', error.message);
        throw error;
    }
}

// Download a file from Google Drive
async function downloadFile(fileId, destinationPath) {
    try {
        const outputDir = path.dirname(destinationPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log(`Created output directory: ${outputDir}`);
        }

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
        console.error(
            `Error downloading file with ID ${fileId}:`,
            error.message
        );
        throw error;
    }
}

// Upload a file to a specific folder on Google Drive
async function uploadFileToFolder(filePath, fileName, gdFolderID) {
    try {
        // Check if the file already exists in the folder
        const existingFile = await findFileInFolder(gdFolderID, fileName);

        const fileMetadata = {
            name: fileName,
            parents: [gdFolderID],
        };
        const media = {
            mimeType: 'application/json',
            body: fs.createReadStream(filePath),
        };

        let response;
        if (existingFile) {
            // Update the existing file
            response = await drive.files.update({
                fileId: existingFile.id,
                media: media,
            });
            console.log(
                `File updated on Google Drive with ID: ${response.data.id}`
            );
        } else {
            // Create a new file
            response = await drive.files.create({
                resource: fileMetadata,
                media: media,
                fields: 'id',
            });
            console.log(
                `File uploaded to Google Drive with ID: ${response.data.id}`
            );
        }

        return response.data.id;
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error.message);
        throw error;
    }
}

module.exports = { findFileInFolder, downloadFile, uploadFileToFolder };

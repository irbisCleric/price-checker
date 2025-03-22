const path = require('path');
const { checkPrices } = require('./utils/helpers'); // Import fetchPrice from helpers.js
const { findFileInFolder, downloadFile } = require('./utils/googleDriveHelper'); // Import Google Drive helpers

const gFolderID =
    process.env.GOOGLE_DRIVE_FOLDER_ID ||
    require('./settings/secrets').GOOGLE_DRIVE_FOLDER_ID;

// Configuration
const { outputFileName } = require('./settings/price-checker-settings'); // Path to the settings file

// Download the prices.json file from Google Drive
async function initializePricesFile(fileName, gdFolderID) {
    // Check if the file exists in the specified folder on Google Drive
    const file = await findFileInFolder(gdFolderID, fileName);
    if (file) {
        console.log(`Found ${fileName} on Google Drive. Downloading...`);
        await downloadFile(
            file.id,
            path.join(__dirname, '../output', outputFileName)
        );
    }

    console.log('Check prices and update the file');
    await checkPrices(outputFileName, gdFolderID); // Check prices and update the file
}

// Run the script
(async () => {
    try {
        await initializePricesFile(outputFileName, gFolderID); // Ensure the prices file is downloaded
    } catch (error) {
        console.error('Error running the price checker:', error.message);
    }
})();

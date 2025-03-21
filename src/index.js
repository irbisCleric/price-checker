const { checkPrices } = require('./utils/helpers'); // Import fetchPrice from helpers.js
const { findFileInFolder, downloadFile } = require('./utils/googleDriveHelper'); // Import Google Drive helpers

// Configuration
const {outputFileName, googleDriveFolderId, outputDataFilePath} = require('./settings/price-checker-settings'); // Path to the settings file

// Download the prices.json file from Google Drive
async function initializePricesFile(fileName) {
    // Check if the file exists in the specified folder on Google Drive
    const file = await findFileInFolder(googleDriveFolderId, fileName);
    if (file) {
        console.log(`Found ${fileName} on Google Drive. Downloading...`);
        await downloadFile(file.id, outputDataFilePath);
    } else {
        console.log(`${fileName} not found on Google Drive. Starting fresh.`);
        await checkPrices(outputFileName); // Check prices and update the file
    }
}

// Run the script
(async () => {
    try {
        await initializePricesFile(outputFileName); // Ensure the prices file is downloaded
    } catch (error) {
        console.error('Error running the price checker:', error.message);
    }
})();
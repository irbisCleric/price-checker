// This file exports utility functions that can be used throughout the application.

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { uploadFileToFolder } = require('./googleDriveHelper'); // Import the uploadFileToFolder function

// Configuration
const {
    config,
    outputDataFilePath,
} = require('./../settings/price-checker-settings'); // Updated path to the settings file

// Function to fetch prices using web scraping
async function fetchPrice(url, selector) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        }); // Fetch the HTML content of the webpage
        const $ = cheerio.load(response.data); // Load the HTML into Cheerio
        const priceText = $(selector).text().trim(); // Extract the price using the CSS selector
        const price = extractPrice(priceText); // Use the extractPrice function
        if (isNaN(price)) {
            throw new Error(`Unable to parse price from selector: ${selector}`);
        }
        return price;
    } catch (error) {
        throw new Error(`Failed to fetch price from ${url}: ${error.message}`);
    }
}

// Function to extract and normalize the price
function extractPrice(priceText) {
    try {
        // Remove non-numeric characters except for dots and commas
        let normalizedText = priceText.replace(/[^\d.,]/g, '').trim();

        // If there's a comma, split the string and take only the part before the comma
        if (normalizedText.includes(',')) {
            normalizedText = normalizedText.split(',')[0];
        }

        // Parse the remaining part as an integer
        const price = parseInt(normalizedText, 10);

        // Check if the parsed price is valid
        if (isNaN(price)) {
            throw new Error(`Invalid price format: "${priceText}"`);
        }

        return price;
    } catch (error) {
        throw new Error(`Failed to extract price: ${error.message}`);
    }
}

// Helper function to check if an object with the same date and price exists
function doesPriceEntryExist(filePath, productName, date, price) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        if (!data[productName]) {
            return false; // Product does not exist in the file
        }

        const entries = data[productName];
        return entries.some(
            (entry) => entry.date === date && entry.price === price
        );
    } catch (error) {
        console.error('Error reading or parsing prices.json:', error.message);
        throw error;
    }
}

// Main function to check prices
async function checkPrices(fileName, gdFolderID) {
    let previousData = {};
    if (fs.existsSync(outputDataFilePath)) {
        previousData = JSON.parse(fs.readFileSync(outputDataFilePath, 'utf-8'));
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const newData = { ...previousData }; // Start with the existing data

    for (const [product, stores] of Object.entries(config.products)) {
        for (const { store, url, selector } of stores) {
            try {
                const price = await fetchPrice(url, selector);
                const key = `${store} - ${product}`; // Unique key for each store-product combination

                // If the product already exists, append the new price to its history
                if (!newData[key]) {
                    newData[key] = [];
                }

                // Prevent duplicate entries for the same date and price
                if (
                    !doesPriceEntryExist(
                        outputDataFilePath,
                        key,
                        currentDate,
                        price
                    )
                ) {
                    newData[key].push({ date: currentDate, price });
                } else {
                    console.log(
                        `Price for ${key} on ${currentDate} already exists: ${price}`
                    );
                }

                console.log(`Fetched price for ${key}: ${price}`);
            } catch (error) {
                console.error(
                    `Failed to fetch price for ${store} - ${product}:`,
                    error.message
                );
            }
        }
    }

    // Ensure the output folder exists
    const outputDir = path.dirname(outputDataFilePath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the updated data back to the file
    fs.writeFileSync(outputDataFilePath, JSON.stringify(newData, null, 2));
    console.log('Prices updated successfully.');

    // Upload the updated file to Google Drive
    console.log(`Uploading ${fileName} to Google Drive...`);
    await uploadFileToFolder(outputDataFilePath, fileName, gdFolderID);
}

module.exports = {
    fetchPrice,
    extractPrice,
    checkPrices,
    doesPriceEntryExist,
};

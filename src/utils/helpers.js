// This file exports utility functions that can be used throughout the application.

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { fetchPrice } = require('./helpers'); // Import fetchPrice from helpers.js

// Configuration
const config = require('./settings/price-checker-settings'); // Updated path to the settings file
const dataFilePath = path.join(__dirname, '../output/prices.json'); // Updated to use the output folder

// Function to fetch prices using web scraping
async function fetchPrice(url, selector) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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

// Main function
async function checkPrices() {
    let previousData = {};
    if (fs.existsSync(dataFilePath)) {
        previousData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
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

                newData[key].push({ date: currentDate, price });

                console.log(`Fetched price for ${key}: ${price}`);
            } catch (error) {
                console.error(`Failed to fetch price for ${store} - ${product}:`, error.message);
            }
        }
    }

    // Ensure the output folder exists
    const outputDir = path.dirname(dataFilePath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the updated data back to the file
    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
    console.log('Prices updated successfully.');
}

// Run the script
checkPrices().catch((error) => {
    console.error('Error running the price checker:', error.message);
});

module.exports = {
    fetchPrice,
    extractPrice,
};

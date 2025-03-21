const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

// Configuration
const config = require('./settings/price-checker-settings'); // Updated path to the settings file
const dataFilePath = path.join(__dirname, '../output/prices.json'); // Updated to use the output folder

// Helper to fetch prices using web scraping
async function fetchPrice(url, selector) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        }); // Fetch the HTML content of the webpage
        const $ = cheerio.load(response.data); // Load the HTML into Cheerio
        const priceText = $(selector).text().trim(); // Extract the price using the CSS selector
        const price = extractPrice(priceText); // Use the new extractPrice function
        if (isNaN(price)) {
            throw new Error(`Unable to parse price from selector: ${selector}`);
        }
        return price;
    } catch (error) {
        throw new Error(`Failed to fetch price from ${url}: ${error.message}`);
    }
}

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
    const newData = {};

    for (const [product, stores] of Object.entries(config.products)) {
        for (const { store, url, selector } of stores) {
            try {
                const price = await fetchPrice(url, selector);
                const key = `${store} - ${product}`; // Unique key for each store-product combination
                newData[key] = { date: currentDate, price };

                if (previousData[key] && previousData[key].price !== price) {
                    console.log(
                        `Price changed for ${key}: ${previousData[key].price} -> ${price}`
                    );
                    // Commented out SMS and email notifications for now
                    // await sendNotifications(key, previousData[key].price, price);
                } else if (!previousData[key]) {
                    console.log(`First run for ${key}, price: ${price}`);
                }
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

    fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
    console.log('Prices updated successfully.');
}

// Run the script
checkPrices().catch((error) => {
    console.error('Error running the price checker:', error.message);
});

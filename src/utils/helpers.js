// This file exports utility functions that can be used throughout the application.

const axios = require('axios');
const cheerio = require('cheerio');

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

module.exports = {
    fetchPrice,
    extractPrice,
};

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuration
const config = require('./config/price-checker-config'); // Links and other settings
const dataFilePath = path.join(__dirname, '../output/prices.json'); // Updated to use the output folder

// Helper to fetch prices (mock implementation)
async function fetchPrice(url) {
    // Replace this with actual logic to scrape or fetch the price
    const response = await axios.get(url);
    return parseFloat(response.data.price); // Assuming the API returns a price field
}

// Main function
async function checkPrices() {
    let previousData = {};
    if (fs.existsSync(dataFilePath)) {
        previousData = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    }

    const currentDate = new Date().toISOString().split('T')[0];
    const newData = {};

    for (const { store, url } of config.links) {
        try {
            const price = await fetchPrice(url);
            newData[store] = { date: currentDate, price };

            if (previousData[store] && previousData[store].price !== price) {
                console.log(
                    `Price changed for ${store}: ${previousData[store].price} -> ${price}`
                );
                // Commented out SMS and email notifications for now
                // await sendNotifications(store, previousData[store].price, price);
            } else if (!previousData[store]) {
                console.log(`First run for ${store}, price: ${price}`);
            }
        } catch (error) {
            console.error(`Failed to fetch price for ${store}:`, error.message);
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

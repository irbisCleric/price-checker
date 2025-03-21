const fs = require('fs');
const path = require('path');
const { fetchPrice } = require('./utils/helpers'); // Import fetchPrice from helpers.js

// Configuration
const config = require('./settings/price-checker-settings'); // Updated path to the settings file
const dataFilePath = path.join(__dirname, '../output/prices.json'); // Updated to use the output folder

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

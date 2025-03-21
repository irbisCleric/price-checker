# Price Checker

## Overview

Price Checker is a Node.js application designed to monitor product prices from specified web pages. It collects price history for dedicated products and stores the data in a JSON file. The application can notify users via SMS and email when a price change is detected.

## Project Structure

```
price-checker
├── src
│   ├── index.js                # Entry point of the application
│   └── config
│       └── price-checker-config.js  # Configuration for links and settings
├── output
│   └── prices.json             # Stores price history (auto-generated)
├── package.json                # npm configuration file
├── .gitignore                  # Files and directories to ignore by Git
└── README.md                   # Project documentation
```

## Installation

1. Clone the repository:
    ```
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```
    cd price-checker
    ```
3. Install the dependencies:
    ```
    npm install
    ```

## Configuration

1. Update the configuration file located at `src/config/price-checker-config.js`:
    - Add the URLs of the product pages you want to monitor.
    - Specify the CSS selectors for extracting the price from each page.
    - Configure email and SMS notification settings.

Example configuration:

```javascript
const config = {
    links: [
        {
            store: 'Store1',
            url: 'https://example.com/product1',
            selector: '.price-class',
        },
        {
            store: 'Store2',
            url: 'https://example.com/product2',
            selector: '#price-id',
        },
    ],
    twilio: {
        accountSid: 'your_account_sid',
        authToken: 'your_auth_token',
        from: '+1234567890',
        to: '+0987654321',
    },
    email: {
        user: 'your_email@gmail.com',
        pass: 'your_email_password',
        to: 'recipient_email@gmail.com',
    },
};

module.exports = config;
```

## Usage

To run the application, use the following command:

```
npm start
```

The application will:

1. Fetch prices from the configured URLs.
2. Compare the current prices with the previous ones stored in `output/prices.json`.
3. Notify users via SMS and email if a price change is detected (notifications are currently commented out for testing purposes).

## Output

The price history is stored in the `output/prices.json` file in the following format:

```json
{
    "Store1": {
        "date": "2025-03-21",
        "price": 99.99
    },
    "Store2": {
        "date": "2025-03-21",
        "price": 49.99
    }
}
```

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.

## License

This project is licensed under the MIT License.

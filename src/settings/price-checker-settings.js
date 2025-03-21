const config = {
    links: [
        {
            store: 'Store1',
            url: 'https://example.com/product1',
            selector: '.price-class', // Replace with the actual CSS selector for the price
        },
        {
            store: 'Store2',
            url: 'https://example.com/product2',
            selector: '#price-id', // Replace with the actual CSS selector for the price
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

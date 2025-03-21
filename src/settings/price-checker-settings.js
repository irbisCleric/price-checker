const config = {
    products: {
        'Synology DS423+': [
            {
                store: 'CoolBlue',
                url: 'https://www.coolblue.nl/product/925392/synology-ds423.html',
                selector: '.product-order .js-sales-price-current',
            },
            {
                store: 'AmazonNL',
                url: 'https://www.amazon.nl/-/en/Synology-DS423-bay-NAS-Device/dp/B0BXH389D1/',
                selector: '.a-price-whole',
            },
            {
                store: 'Bol.com',
                url: 'https://www.bol.com/nl/nl/p/synology-diskstation-ds423-nas-rack-intel-celeron-j4125-zwart/9300000143643524/',
                selector: '.js_buy_block_prices .promo-price',
            }
        ],
        // 'Seagate IronWolf 4TB': [
        //     {
        //         store: 'CoolBlue',
        //         url: 'https://www.coolblue.nl/product/123456/seagate-ironwolf-4tb.html',
        //         selector: '.js-sales-price-current',
        //     },
        //     {
        //         store: 'AmazonNL',
        //         url: 'https://example.com/product3',
        //         selector: '#price-id', // Replace with the actual CSS selector for the price
        //     },
        // ],
    },
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

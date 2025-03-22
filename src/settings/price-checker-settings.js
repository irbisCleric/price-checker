const path = require('path');
const outputFileName = 'prices.json';
const outputDataFilePath = path.join(__dirname, '../../output', outputFileName);

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
            // TODO: Debug the Bol.com selector
            // {
            //     store: 'Bol.com',
            //     url: 'https://www.bol.com/nl/nl/p/synology-diskstation-ds423-nas-rack-intel-celeron-j4125-zwart/9300000143643524/',
            //     selector: '.main',
            // }
        ],
        'Seagate IronWolf 4TB': [
            {
                store: 'CoolBlue',
                url: 'https://www.coolblue.nl/product/905240/seagate-ironwolf-4tb.html',
                selector: '.product-order .js-sales-price-current',
            },
            {
                store: 'AmazonNL',
                url: 'https://www.amazon.nl/-/en/Seagate-IronWolf-Internal-Services-ST4000VNZ06/dp/B09NHV3CK9/',
                selector: '.a-price-whole',
            },
        ],
    },
};

module.exports = {
    config,
    outputFileName,
    googleDriveFolderId,
    outputDataFilePath,
};

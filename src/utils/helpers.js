// This file exports utility functions that can be used throughout the application.

function formatDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

module.exports = {
    formatDate,
    generateId,
};

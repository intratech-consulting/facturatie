const crypto = require('crypto');
require("dotenv").config();

class Encryption {
    constructor(hashKey) {
        this.hashKey = process.env.HASH_KEY || hashKey;
    }

    // Function to encrypt a string using HMAC with SHA-256
    async encryptString(inputString) {
        const hmac = crypto.createHmac('sha256', this.hashKey);
        hmac.update(inputString);
        const encryptedString = hmac.digest('hex');
        return encryptedString;
    }

    // Function to verify if a string matches another string after encryption
    async verifyString(originalString, encryptedStringToMatch) {
        // Encrypt the original string
        const encryptedOriginalString = this.encryptString(originalString);
        // Compare the encrypted original string with the provided encrypted string
        return encryptedOriginalString === encryptedStringToMatch;
    }
}

module.exports = Encryption;

// // Example usage
// const hashKey = 'mySecretKey';
// const passwordManager = new PasswordManager(hashKey);

// // Encrypt a string
// const inputString = 'Hello, World!';
// const encryptedString = passwordManager.encryptString(inputString);
// console.log('Encrypted String:', encryptedString);

// // Verify a string
// const originalString = 'Hello, World!';
// const encryptedStringToMatch = '...'; // Previously encrypted string
// const isMatching = passwordManager.verifyString(originalString, encryptedStringToMatch);
// console.log('Does it match?', isMatching);

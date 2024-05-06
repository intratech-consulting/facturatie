const axios = require('axios');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

// Helper function to create a cookie file
function createCookieFile() {
    const tempDir = require('os').tmpdir(); // Get the temporary directory
    const cookieFile = path.join(tempDir, 'bbcookie.txt');
    fs.closeSync(fs.openSync(cookieFile, 'w')); // Create an empty file if it doesn't exist
    return cookieFile;
}

class BoxBillingService {

    constructor(options) {
        if (!options.api_url) {
            throw new Error('API URL is required');
        }

        this.apiUrl = options.api_url;
        this.apiRole = options.api_role || 'guest';
        this.apiToken = options.api_token || null;
        this.cookieFile = createCookieFile(); // Path to cookie file

        // Create an axios instance with basic auth and cookies
        this.httpClient = axios.create({
            baseURL: this.apiUrl,
            auth: {
                username: this.apiRole,
                password: this.apiToken || '',
            },
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true, // Allow cookie handling
        });
    }

    async callApi(module, method, data) {
        const url = `/${this.apiRole}/${module}/${method}`;

        try {
            const response = await this.httpClient.post(url, data);
            const result = response.data;

            if (response.status !== 200) {
                throw new Error(`BoxBilling API returned error: ${response.statusText}`);
            }

            if (result.error) {
                throw new Error(
                    `BoxBilling API method "${module}_${method}" returned error: ${result.error.message}`
                );
            }

            if (!result.result) {
                throw new Error('Invalid response');
            }

            return result.result;
        } catch (error) {
            console.error('API Call Error:', error.message);
            throw error;
        }
    }

    // Handle dynamic API method calls
    async callMethod(methodName, args) {
        const [module, method] = methodName.split('_', 2);
        const data = args.length > 0 ? args[0] : {};
        return await this.callApi(module, method, data);
    }
}

module.exports = BoxBillingService;

// Example usage
(async () => {
    const config = {
        api_role: 'guest',
        api_url: 'http://demo.boxbilling.com/bb-api/rest.php',
    };

    const boxBillingService = new BoxBillingService(config);

    try {
        const systemVersion = await boxBillingService.callMethod('system_version', []);
        console.log('System Version:', systemVersion);

        await boxBillingService.callMethod('cart_add_item', [{ id: 1 }]);

        // You'd need client permissions and token to execute a checkout
        const clientConfig = {
            api_role: 'client',
            api_token: 'token', // Replace with your token
            api_url: 'http://demo.boxbilling.com/api',
        };

        const clientService = new BoxBillingService(clientConfig);
        const checkoutResult = await clientService.callMethod('cart_checkout', []);
        console.log('Checkout Result:', checkoutResult);
    } catch (error) {
        console.error('Error:', error.message);
    }
})();

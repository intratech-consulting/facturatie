const axios = require('axios');
const axiosCookieJarSupport = require('axios-cookiejar-support').default;
const tough = require('tough-cookie');
const fs = require('fs');
const path = require('path');
require("dotenv").config();

function createCookieFile() {
    const tempDir = require('os').tmpdir();
    const cookieFile = path.join(tempDir, 'bbcookie.txt');
    fs.closeSync(fs.openSync(cookieFile, 'w'));
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
        this.cookieFile = createCookieFile();
        this.cookieJar = new tough.CookieJar();

        this.httpClient = axios.create({
            baseURL: this.apiUrl,
            auth: {
                username: this.apiRole,
                password: this.apiToken || '',
            },
            headers: {
                'Content-Type': 'application/json',
            },
            jar: this.cookieJar,
            withCredentials: true,
        });

        this.httpClient.defaults.jar = this.cookieJar;
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

    async callMethod(methodName, args) {
        const underscoreIndex = methodName.indexOf('_');
        const module = methodName.substring(0, underscoreIndex);
        const method = methodName.substring(underscoreIndex + 1);
        const data = args.length > 0 ? args[0] : {};
        const cookies = await this.cookieJar.getCookies(this.apiUrl);
        return await this.callApi(module, method, data);
    }
}

module.exports = BoxBillingService;
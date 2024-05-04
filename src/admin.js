const axios = require("axios");
require("dotenv").config();


class admin {
    constructor() {
        this.apiUrl = process.env.API_URL_ADMIN;
        this.key = process.env.API_KEY;
    }

    async createClient(userData) {
        // userData is a JSON object, containing user data like in draft.xml
        // Send a POST request to the Fossbilling API to create a new client
        // http://10.2.160.51:876/admin/client/create

        const clientData = {
            email: userData.email[0],
            first_name: userData.first_name[0],
            password: `Test1234`,
            status: `active`
        };

        const auth = Buffer.from(`admin:${this.key}`).toString('base64');

        try {
            const response = await axios.post(`${this.apiUrl}/client/create`, clientData, {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });

            return response.data;
        } catch (error) {
            console.error(`Error creating client: ${error}`);
            throw error;
        }
    };

    async deleteClient(clientId) {
        // Send a DELETE request to the Fossbilling API to delete a client
        // http://10.2.160.51:876/admin/client/delete/
        // uses client_id as parameter

        try {
            const response = await axios.delete(
                `${this.apiUrl}/client/delete/${clientId}`,
                {
                    headers: {
                        "API-Key": this.key,
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error(`Error deleting client: ${error}`);
            throw error;
        }
    }
}

module.exports = admin;

const axios = require("axios");
const BoxBillingService = require("./bbService");
const Encryption = require("./encryption");
require("dotenv").config();

class guest {

    constructor() {
        this.bbService = new BoxBillingService({
            api_role: 'guest',
            api_url: process.env.API_URL,
        });
        this.enc = new Encryption();
    };

    async clientLogin(clientData) {

        // Check if required parameters are provided
        if (!clientData.email) {
            throw new Error('email is required');
        }

        const password = clientData.email || "test@mail.com";

        const loginData = {
            email: clientData.email,
            password: `${await this.enc.encryptString(password)}Pass1234`
        };

        try {
            const response = await this.bbService.callMethod('client_login', [loginData]);
            return response;
        } catch (error) {
            console.error(`Error logging in client: ${error}`);
            throw error;
        };
    };

    async addItemToCart(product) {

        // Check if required parameters are provided
        if (!product.product_id[0]) {
            throw new Error(' product_id is required');
        }

        const cartData = {
            id: product.product_id[0],
            quantity: product.quantity || 1
        };

        try {
            const response = await this.bbService.callMethod('cart_add_item', [cartData]);
            return response;
        } catch (error) {
            console.error(`Error adding item to cart: ${error}`);
            throw error;
        };
    }

    async handleOrder(orderData) {
        // Check if orderData has the necessary properties
        if (!orderData || !orderData.order || !Array.isArray(orderData.order.products)) {
            throw new Error('Invalid order data');
        }

        const responses = [];

        // Iterate over the products
        for (const productGroup of orderData.order.products) {
            for (const product of productGroup.product) {
                console.log(product)
                // Add each product to the cart
                responses.push(await this.addItemToCart(product));
            }
        }

        return responses;
    };

    async getCart() {
        try {
            const response = await this.bbService.callMethod('cart_get', []);
            return response;
        } catch (error) {
            console.error(`Error getting cart: ${error}`);
            throw error;
        }
    };

    async checkout() {
        try {
            const response = await this.bbService.callMethod('cart_checkout', []);
            return response;
        } catch (error) {
            console.error(`Error checking out cart: ${error}`);
            throw error;
        }
    };
}

module.exports = guest;

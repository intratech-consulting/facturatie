/**
 * xmlHandling.js
 * 
 * This module exports a class, xmlHandling, that provides methods to convert XML data to JSON and vice versa.
 * It uses the xml2js library to perform the conversions.
 * 
 * @module xmlHandling
 */

const xml2js = require('xml2js');

/**
 * Class representing a handler for XML and JSON conversions.
 */
class xmlHandling {

    /**
     * Convert XML data to JSON.
     * 
     * @param {string} xmlData - The XML data to convert.
     * @returns {Promise<Object>} A promise that resolves with the converted JSON data.
     * @throws Will throw an error if the conversion fails.
     */
    async xmlToJson(xmlData) {
        return new Promise((resolve, reject) => {
            xml2js.parseString(xmlData, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    /**
     * Convert JSON data to XML.
     * 
     * @param {Object} jsonData - The JSON data to convert.
     * @returns {Promise<string>} A promise that resolves with the converted XML data.
     */
    async jsonToXml(jsonData) {
        return new Promise((resolve, reject) => {
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(jsonData);
            resolve(xml);
        });
    }
}

module.exports = xmlHandling; // Export the class for external use
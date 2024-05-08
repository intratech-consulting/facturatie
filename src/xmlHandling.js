const xml2js = require('xml2js');

// function to change xml data to json
class xmlHandling {

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

    // function to change json data to xml
    async jsonToXml(jsonData) {
        return new Promise((resolve, reject) => {
            const builder = new xml2js.Builder();
            const xml = builder.buildObject(jsonData);
            resolve(xml);
        });
    }
}

module.exports = xmlHandling; // Export the class for external use
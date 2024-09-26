//Adds a request to a specific collection
const logger = require('pino')()
const log = logger.child({ file: 'request.js' })
const axios = require('axios');
const constants = require("../constants.js");
const POSTMAN_API_ENDPOINT = constants.POSTMAN_API_ENDPOINT;
const POSTMAN_API_KEY = constants.POSTMAN_API_KEY;

/**
 * Add and delete requests from Postman
 */
module.exports = {
    /**
     * Add a new request to an existing collection
     * @param {*} collectionId 
     * @param {*} name 
     * @param {*} url 
     * @param {*} method 
     * @returns 
     */
    addRequestToCollection: async function(collectionId, name, url, method) {
        try {
            var response = await axios.post(POSTMAN_API_ENDPOINT + 'collections/' + collectionId + "/requests", 
                {                                 
                    name: name, url: url, method: method
                }, 
                {headers: {'X-Api-Key':POSTMAN_API_KEY}}
            );
            log.info("Request added successfully.");
            return response.data.id;
        }
        catch(error) {
            log.error(error);
        }

    },
    /**
     * Delete a specific request from an existing collection
     * @param {*} collectionId 
     * @param {*} requestId 
     */
    deleteRequestFromCollection: async function(collectionId, requestId) {
        try {
            var response = await axios.delete(POSTMAN_API_ENDPOINT + 'collections/' + collectionId + "/requests/" + requestId, 
                {headers: {'X-Api-Key':POSTMAN_API_KEY}}
            );
            log.info("Request deleted successfully.");            
        }
        catch(error) {
            log.error(error);
        }
    }
}

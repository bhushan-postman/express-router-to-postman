const logger = require('pino')()
const log = logger.child({ file: 'routes.js' })

/**
 * This function extracts each of the endpoints and adds them to an array
 * The array is then passed to collection.js file where they are created in Postman as requests
 */
module.exports = {
    stackToCollection: function analyze(stack) {        
        var items = [];
        stack.forEach (function (r) {
            if(r.route && r.route.path) {
              var url = r.route.path;              
              var method = r.route.stack[0].method.toUpperCase();
              // Use this to set the name of the request
              var request = {name: "Request to " + method + " " + url, request: {method: method, url: url}};
              items.push(request);              
            }
          });              
        log.info(items.length + " items found.");
        return items;
    },
};
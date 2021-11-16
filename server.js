const s3ReverseProxy = require("./s3ReverseProxy.js")


const server = new s3ReverseProxy(5000, {
    region: 'default',
    endpoint: 'endpoint_url'},
    function(headers) {
        // check user header for auth and return result as boolean
        return true
    })


server.serve()

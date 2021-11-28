# Streaming Amazon S3 Objects From Node.js Server

Don't use Cloundfront, use this instead. cheap solution to share Private-ACL Objects on demand with CORS support.
~~~javascript
new s3ReverseProxy(port, {...AWSClientConfig}, headers=> {//authentication function})
~~~
# requirements
Virtual environment variables:
~~~shell
export STORAGE_ACCESS=<YOUR-S3-CLIENT-STORAGE-KEY>
export STORAGE_SECRET=<YOUR-S3-CLIENT-STORAGE-SECRET>
~~~
# Example
~~~~javascript
const s3ReverseProxy = require("./s3ReverseProxy.js")
const server = new s3ReverseProxy(5000, {
    region: 'default',
    endpoint: 'endpoint_url'},
    function(headers) {
        // check user header for auth and return result as boolean
        return true
    })
server.serve()
~~~~

You can check request headers for authentication ! Notice that this function should return boolean
~~~javascript
const server = new s3ReverseProxy(5000, {
    region: 'default',
    endpoint: 'endpoint_url'},
    headers => {
        if (is_authenticated(headers)) return true
        return false
    })
~~~

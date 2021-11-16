const http = require("http");

const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
 
const { STORAGE_ACCESS, STORAGE_SECRET } = process.env;


module.exports = class S3ReverseProxy {
    constructor(port, s3ClientConfig, authFunc) {
        this.port = port || 5000
        this.s3ClientConfig = s3ClientConfig
        this.authFunc = authFunc
        this.s3 = new S3Client({
            ...s3ClientConfig,
            credentials: {
                accessKeyId: STORAGE_ACCESS,
                secretAccessKey: STORAGE_SECRET,
            },
        })
    }
    pathIsValid(url) {
        return url.split('/').length > 1
    }
    methodIsNotSafe(method) {
        return !(method === 'GET' || method === 'OPTIONS')
    }
    detectTargetObject(url) {
        const path = url.split('/');
        const bucket = path[1];
        var key = '';
        for (let i = 2; i <= path.length; i++) {
            if (i > 2 && path[i]) key += '/'
            path[i] && (key += path[i])
        }
        return ({Bucket: bucket, Key: key})
    }
    enableCORS(response) {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Request-Method', '*');
        response.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        response.setHeader('Access-Control-Allow-Headers', '*');
    }
    createServer() {
        const instance = this
        this.server = http.createServer(function (request, response) {
            instance.enableCORS(response)
            const { method, url, headers } = request

            if (instance.authFunc && !instance.authFunc(headers)) {
                response.writeHead(403);
                response.end();
                return;
            }

            if (instance.methodIsNotSafe(method)) {
                response.writeHead(403);
                response.end();
                return;
            }

            if ( method === 'OPTIONS' ) {
                response.writeHead(200);
                response.end();
                return;
            }

            if (method === 'GET') {
                if (instance.pathIsValid(url)) {
                    const param = instance.detectTargetObject(url)
                    instance.s3.send(new GetObjectCommand(param)).then(object=> object.Body.pipe(response))
                    .catch(error=> {
                        if (error?.name === 'NoSuchKey') {
                            response.writeHead(404);
                            response.end();
                            return;
                        }
                    })
                }
            }

        })
    }
    serve() {
        this.createServer()
        this.server.listen(this.port)
    }
}



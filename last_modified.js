/**
 * 协商缓存 Last-Modified/If-Modified-Since
 * 1. 第一次访问服务器的时候，服务器返回资源和缓存的标识，客户端则会把此资源缓存在本地的缓存数据库中。
 * 2. 第二次客户端需要此数据的时候，要取得缓存的标识，然后去问一下服务器我的资源是否是最新的。
 * 如果是最新的则直接使用缓存数据，如果不是最新的则服务器返回新的资源和缓存规则，客户端根据缓存规则缓存新的数据。
 * 
 */

/**
 * 最后修改时间存在问题 #
   某些服务器不能精确得到文件的最后修改时间， 这样就无法通过最后修改时间来判断文件是否更新了。
   某些文件的修改非常频繁，在秒以下的时间内进行修改. Last-Modified只能精确到秒。
   一些文件的最后修改时间改变了，但是内容并未改变。 我们不希望客户端认为这个文件修改了。
   如果同样的一个文件位于多个CDN服务器上的时候内容虽然一样，修改时间不一样。
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const mime = require('mime');
const {promisify} = require('util');

const stat = promisify(fs.stat);


http.createServer(async (req, res) => {
    let {pathname} = url.parse(req.url);
    let filePath = path.join(__dirname, pathname);
    try {
        let stats = await stat(filePath);
        let ifModifiedSince = req.headers['if-modified-since'];
        let lastModified = stats.ctime.toGMTString();
        if (ifModifiedSince === lastModified) {
            // res.setHeader('Last-Modified', stats.ctime.toGMTString());
            res.writeHead(304);
            res.end('来自缓存中');
        } else {
            return send(req, res, filePath, stats);
        }
    } catch(e) {
        res.statusCode = 404;
        res.end();
    }
    
}).listen(9090);

function send(req, res, filePath, stats) {
    res.setHeader('Content-Type', mime.getType(filePath));
    res.setHeader('Last-Modified', stats.ctime.toGMTString());
    fs.createReadStream(filePath).pipe(res);
}

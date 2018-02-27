/** 
 * 参考
 * https://www.cnblogs.com/slly/p/6732749.html
 * https://www.cnblogs.com/hustskyking/p/etag-in-node.html
*/

/**
 * 协商缓存 Etag/If-None-Match
 */
const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');
const mime = require('mime');
const crypto = require('crypto');
const {promisify} = require('util');

const stat = promisify(fs.stat);


http.createServer(async (req, res) => {
    let {pathname} = url.parse(req.url);
    let filePath = path.join(__dirname, pathname);
    try {
        let stats = await stat(filePath);
        let ifNoneMatch = req.headers['if-none-match'];
        let rs = fs.createReadStream(filePath);
        let md5 = crypto.createHash('sha1');
        rs.on('data', chunk => {
            md5.update(chunk);
        });
        rs.on('end', () => {
            let etag = md5.digest('hex');
            if (ifNoneMatch === etag) {
                res.writeHead(304);
                res.end();
            } else {
                return send(req, res, filePath, etag);
            }
        });
    } catch (e) {
        res.statusCode = 404;
        res.end(e.toString());
    }
    
}).listen(9090);

function send(req, res, filePath, etag) {
    res.setHeader('Content-Type', `${mime.getType(filePath)};charset=utf-8`);
    res.setHeader('Etag', etag);
    fs.createReadStream(filePath).pipe(res);
}
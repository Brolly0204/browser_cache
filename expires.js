/** 
 * Cache-Control(HTTP 1.1 max-age相对时间 s)/Expires(HTTP 1.0) 绝对时间
 * 手动刷新 F5 没有效果
 * 打开新窗口输入连接/前进后退  可以看到效果（Status Code:200 OK (from disk cache)） 
 * 并没有请求服务器 直接走的缓存 过期才会走服务器
*/
const http = require("http");
const path = require("path");
const fs = require("fs");
const url = require("url");
const mime = require("mime");
const { promisify } = require("util");

const stat = promisify(fs.stat);
http
  .createServer(async (req, res) => {
    let { pathname } = url.parse(req.url);
    let filePath = path.join(__dirname, pathname);
    try {
      let stats = await stat(filePath);
      res.setHeader("Content-Type", `${mime.getType(filePath)};charset=utf-8`);
      res.setHeader('Expires', new Date(Date.now() + 30 * 1000).toUTCString());
      res.setHeader('Cache-Control', 'max-age=30, public');
      fs.createReadStream(filePath).pipe(res);
      console.log('request http');
    } catch (e) {
      res.statusCode = 404;
      res.end(e.toString());
    }
  })
  .listen(9090);

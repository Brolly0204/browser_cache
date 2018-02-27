# 浏览器缓存

## 强缓存

Cache-Control与Expires
用户发送的请求，直接从客户端缓存中获取，不发送请求到服务器，不与服务器发生交互行为。

## 协商缓存

Last-Modified/ETag
用户发送的请求，发送到服务器后，由服务器判定是否从缓存中获取资源。

两者共同点：客户端获得的数据最后都是从客户端缓存中获得。

两者的区别：从名字就可以看出，强缓存不与服务器交互，而协商缓存则需要与服务器交互。

## Cache-Control与Expires

　　Cache-Control与Expires的作用一致，都是指明当前资源的有效期，控制浏览器是否直接从浏览器缓存取数据还是重新发请求到服务器取数据。只不过Cache-Control的选择更多，设置更细致，如果同时设置的话，其优先级高于Expires。

## Last-Modified/ETag与Cache-Control/Expires

　　配置Last-Modified/ETag的情况下，浏览器再次访问统一URI的资源，还是会发送请求到服务器询问文件是否已经修改，如果没有，服务器会只发送一个304回给浏览器，告诉浏览器直接从自己本地的缓存取数据；如果修改过那就整个数据重新发给浏览器；

　　Cache-Control/Expires则不同，如果检测到本地的缓存还是有效的时间范围内，浏览器直接使用本地副本，不会发送任何请求。两者一起使用时，Cache-Control/Expires的优先级要高于Last-Modified/ETag。即当本地副本根据Cache-Control/Expires发现还在有效期内时，则不会再次发送请求去服务器询问修改时间（Last-Modified）或实体标识（Etag）了。

　　一般情况下，使用Cache-Control/Expires会配合Last-Modified/ETag一起使用，因为即使服务器设置缓存时间, 当用户点击“刷新”按钮时，浏览器会忽略缓存继续向服务器发送请求，这时Last-Modified/ETag将能够很好利用304，从而减少响应开销。

## Last-Modified与ETag

你可能会觉得使用Last-Modified已经足以让浏览器知道本地的缓存副本是否足够新，为什么还需要Etag（实体标识）呢？HTTP1.1中Etag的出现主要是为了解决几个Last-Modified比较难解决的问题：

1.Last-Modified标注的最后修改只能精确到秒级，如果某些文件在1秒钟以内，被修改多次的话，它将不能准确标注文件的新鲜度

2.如果某些文件会被定期生成，当有时内容并没有任何变化，但Last-Modified却改变了，导致文件没法使用缓存

3.有可能存在服务器没有准确获取文件修改时间，或者与代理服务器时间不一致等情形

4.如果同样的一个文件位于多个CDN服务器上的时候内容虽然一样，修改时间不一样。

## Cache-Control有很多的参数可以选择，对于缓存的控制非常重要，参数包括：

- public：响应会被缓存，并且可以在多用户间共享。

- private：响应只能够作为私有的缓存，比如在一个浏览器中，不能在用户间共享，所以设置该参数后就不能被反向代理缓存了。

- no-cache：响应不会被缓存，而是实时向服务器端请求资源，这使得HTTP认证能够禁止缓存以保证安全性。实际中这个容易让人产生误解，字面理解是响应不被缓存，而实际上no-cache情况下也是会被缓存的，只是每次客户端都要向服务器评估缓存响应的有效性。

- no-store：在任何条件下，响应都不会被缓存，并且不会写入到客户端的磁盘里，这也是基于安全考虑的某些敏感的响应才会使用这个。

- max-age=［单位：秒］：设置缓存最大的有效时间，从服务端返回的时间开始计算。

- s-maxage=［单位：秒］：类似于max-age，但是它只用于共享缓存，比如代理。

## 不能缓存的请求：

　　当然并不是所有请求都能被缓存，无法被浏览器缓存的请求如下：

　　　　1. HTTP信息头中包含Cache-Control:no-cache，pragma:no-cache（HTTP1.0），或Cache-Control:max-age=0等告诉浏览器不用缓存的请求

　　　　2. 需要根据Cookie，认证信息等决定输入内容的动态请求是不能被缓存的

　　　　3. 经过HTTPS安全加密的请求（有人也经过测试发现，ie其实在头部加入Cache-Control：max-age信息，firefox在头部加入Cache-Control:Public之后，能够对HTTPS的资源进行缓存，参考《HTTPS的七个误解》）

　　　　4. POST请求无法被缓存

　　　　5. HTTP响应头中不包含Last-Modified/Etag，也不包含Cache-Control/Expires的请求无法被缓存

## 参考

- [浏览器缓存机制](https://www.cnblogs.com/slly/p/6732749.html)
- [缓存过程](https://www.cnblogs.com/shixiaomiao1122/p/7591556.html)

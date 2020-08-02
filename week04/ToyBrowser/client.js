const parser = require('./htmlparser')

const { HTTPRequest } = require('./httpRequest')

      // "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nDate: Sun, 26 Jul 2020 04:31:19 GMT\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n\r\nd\r\n Hello World\n\r\n0\r\n\r\n"
void async function () {
  let request = new HTTPRequest({
    method: 'POST', // HTTP
    host: '127.0.0.1', // IP
    port: '8088', // TCP
    path: '/', // HTTP
    headers: { // HTTP
      ["X-Foo2"]: "customed"
    },
    body: {
      name: 'jerry'
    }
  })
  let response = await request.send()
  let dom = parser.parseHTML(response.body)
  console.log(dom)
}()
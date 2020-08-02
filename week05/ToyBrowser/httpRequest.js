const net = require('net')
const { ResponseParser } = require('./responseParser')
class HTTPRequest {
  constructor(options) {
    this.method = options.method || 'GET'
    this.host = options.host
    this.port = options.port || 80
    this.path = options.path || '/'
    this.body = options.body || {}
    this.headers = options.headers || {}

    if(!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    }
    // 请求体转换
    if(this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body)
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
    }
    // 请求头中配置请求体的长度，用于判断请求传的内容是否都传递完成
    this.headers['Content-Length'] = this.bodyText.length
  }

  send(connection) {
    return new Promise((resolve, reject) => {
      
      const parser = new ResponseParser

      // connection 存在则写入收集到的信息
      if(connection) {
        connection.write(this.toString())
      } else {
        // 不存在则先创建 connection TCP 连接, 然后再写入
        connection = net.createConnection({
          host: this.host,
          port: this.port
        }, () => {
          connection.write(this.toString())
        })
      }
      // 监听 connection 的 data
      connection.on('data', data => {
        // 进行解析
        parser.receive(data.toString())
        console.log(data.toString())
        // 解析完成
        if(parser.isFinished) {
          // 返回解析内容0
          resolve(parser.response)
          // 关闭连接
          connection.end()
        }
      })
      // 错误处理，断开连接
      connection.on('error', err => {
        reject(err)
        connection.end()
      })
    })
  }
  // 将请求头及请求体转换成 HTTP 所需要的格式
  toString() {
    return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n\r\n${this.bodyText}`
  }
}

module.exports = { HTTPRequest }
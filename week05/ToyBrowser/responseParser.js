const { ChunkedBodyParser } = require('./chunkedBodyParser')
// 逐步接收 response 的文本然后进行分析
class ResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0
    this.WAITING_STATUS_LINE_END = 1

    this.WAITING_HEADER_NAME = 2
    this.WAITING_HEADER_SPACE = 3
    this.WAITING_HEADER_VALUE = 4
    this.WAITING_HEADER_LINE_END = 5
    
    this.WAITING_HEADER_BLOCK_END = 6
    this.WAITING_BODY = 7

    // 存储解析过程中的结果
    this.current = this.WAITING_STATUS_LINE
    this.statusLine = ''
    this.headers = {}
    this.headerName = ''
    this.headerValue = ''
    this.bodyParser = null
  }
  get isFinished () {
    return this.bodyParser && this.bodyParser.isFinished
  }
  get response () {
    this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
    return {
      statusCode: RegExp.$1,
      statusText: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }
  // 接受字符串逐个进行处理
  receive(string) {
    for(let i = 0; i < string.length; i++) {
      // "HTTP/1.1 200 OK\r\nContent-Type: text/html\r\nDate: Sun, 26 Jul 2020 04:31:19 GMT\r\nConnection: keep-alive\r\nTransfer-Encoding: chunked\r\n\r\nd\r\n Hello World\n\r\n0\r\n\r\n"
      this.receiveChar(string.charAt(i))
    }
  }
  receiveChar(char) {
    // HTTP 状态
    if (this.current === this.WAITING_STATUS_LINE) {
      // 如果遇到 \r 则进入下一状态
      if (char === '\r') {
        this.current = this.WAITING_STATUS_LINE_END        
      } else {
        this.statusLine += char
      }
    //　进入到请求头
    } else if (this.current === this.WAITING_STATUS_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_HEADER_NAME
      }
    }　else if (this.current === this.WAITING_HEADER_NAME) {
      if (char === ':') {
        this.current = this.WAITING_HEADER_SPACE
      } else if (char === '\r') {
        // 如果仍然等来了一个 '\r' 则表示请求头结束了
        this.current = this.WAITING_HEADER_BLOCK_END

      } else {
        this.headerName += char
      }
    } else if (this.current === this.WAITING_HEADER_SPACE) {
      if (char === ' ') {
        this.current = this.WAITING_HEADER_VALUE
      }
    } else if (this.current === this.WAITING_HEADER_VALUE) {
      if (char === '\r') {
        this.current = this.WAITING_HEADER_LINE_END
        this.headers[this.headerName] = this.headerValue
        this.headerName = ''
        this.headerValue = ''
      } else {
        this.headerValue += char
      }
    } else if (this.current === this.WAITING_HEADER_LINE_END) {
      if (char === '\n') {
        // 如果在 WAITING_HEADER_NAME 中等来了 '\r' 则表示请求头结束
        this.current = this.WAITING_HEADER_NAME
      }
    } else if (this.current === this.WAITING_HEADER_BLOCK_END) {
      if (char === '\n') {
        this.current = this.WAITING_BODY
        // 'Transfer-Encoding' 的值有很多，node 默认 chunked
        if (this.headers['Transfer-Encoding'] === 'chunked') {
          this.bodyParser = new ChunkedBodyParser()
        }
      }
    } else if (this.current === this.WAITING_BODY) {
      this.bodyParser.receiveChar(char)
    }
  }
}

module.exports = { ResponseParser }
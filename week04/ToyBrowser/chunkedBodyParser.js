
class ChunkedBodyParser {
  constructor() {
    this.WAITING_LENGTH = 0
    this.WAITING_LENGTH_LINE_END = 1

    this.READING_TRUNK = 2
    this.WAITING_NEW_LINE = 3
    this.WAITING_NEW_LINE_END = 4
    this.length = 0
    this.content = []
    this._isFinished = false
    this.current = this.WAITING_LENGTH
  }

  get isFinished() {
    return this._isFinished;
  }
  receiveChar(char) {
    if (this.current === this.WAITING_LENGTH) {
      if (char === '\r') {
        if (this.length === 0) {
          this._isFinished = true
        }
        this.current = this.WAITING_LENGTH_LINE_END
      } else {
        // 首位是一个 16 进制的标识，body的长度
        this.length *= 16
        this.length += parseInt(char, 16)
      }
    } else if (this.current === this.WAITING_LENGTH_LINE_END) {
      // 首位文本长度获取完成
      if (char === '\n' && !this._isFinished) {
        this.current = this.READING_TRUNK
      }
    } else if (this.current === this.READING_TRUNK) {
      this.content.push(char)
      this.length--
      if (this.length === 0) {
        this.current = this.WAITING_NEW_LINE
      }
      // console.log(this.content.join('')) 
    } else if (this.current === this.WAITING_NEW_LINE) {
      if (char === '\r') {
        this.current = this.WAITING_NEW_LINE_END
      }
    } else if (this.current === this.WAITING_NEW_LINE_END) {
      if (char === '\n') {
        this.current = this.WAITING_LENGTH
      }
    }
  }
}
module.exports = { ChunkedBodyParser }
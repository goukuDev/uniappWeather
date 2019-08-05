function formatNumber (n) {
  const str = n.toString()
  return str[1] ? str : `0${str}`
}

export function formatTime (date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const t1 = [year, month, day].map(formatNumber).join('/')
  const t2 = [hour, minute, second].map(formatNumber).join(':')

  return `${t1} ${t2}`
}

export function request(url, header, data, method){
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      data: data,
      header: header,
      method: method,
      success: (res => {
        if (res.statusCode === 200) {
          //200: 服务端业务处理正常结束
          resolve(res)
        } else {
          //其它错误，提示用户错误信息
          if (this._errorHandler != null) {
          //如果有统一的异常处理，就先调用统一异常处理函数对异常进行处理
            this._errorHandler(res)
          }
          reject(res)
        }
      }),
      fail: (res => {
        if (this._errorHandler != null) {
          this._errorHandler(res)
        }
        reject(res)
      })
    })
  })
}

export default {
  formatNumber,
  formatTime,
  request
}

//logs.js
const util = require('../../utils/util.js')

Page({
    url: {},
    onLoad: function (options) {
        this.setData({url:'https://mp.weixin.qq.com/s?src=11&timestamp=1531816201&ver=1003&signature=F2Dg3WkBfCRXV1wqwro*MuZ5doUdF39uHuk*gg6TrTtHFNNYhnnvkxUGKY4tzgQMIuu1UZGCcZvws86A4OH-ZUIbPuXLZrsamhdQbcm*QUZ7SFphNcrm9L0Wkv3J4Yb9&new=1'})
    },
    onShareAppMessage(){
        return {
            title: '自定义转发标题',
            path: '/page/user?id=123'
        }
    }
})

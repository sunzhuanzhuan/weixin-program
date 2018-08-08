//app.js
App({
    onLaunch: function () {

        // wx.getExtConfig({
        //     success: function (res) {
        //         console.log(res)
        //     }
        // })

    },
    globalData: {
        userInfo: '',
        baseUrl:''
    },
    onShow: function(options) {
        wx.setStorage({
            key:"scene",
            data:options.scene
        })
    },


})
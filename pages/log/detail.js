let app = getApp().globalData;
Page({
    data:{
        iPhoneX:false
    },
    onShow:function () {
        let that = this
        wx.getSystemInfo({
            success: function (res) {
                if (res.model === 'iPhone X') {
                    that.setData({iPhoneX: true})
                } else {
                    that.setData({iPhoneX: false})
                }
            }
        })
    },
    //关闭
    handleClose() {
        wx.navigateBack({
            url:'/pages/detail/detail'
        })
    },
    handleCallHome(){
        wx.navigateTo({
            url:'/pages/index/index'
        })
    }
})

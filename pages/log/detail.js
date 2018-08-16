let app = getApp().globalData;
Page({
    data:{
        iPhoneX:false,
        name:'',
        home: '../../images/home.png',
    },
    onLoad:function (options) {
        console.log(options)
        this.setData({name:options.nick})
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
        this.setData({name:''})
    },
    handleCallHome(){
        wx.navigateTo({
            url:'/pages/index/index'
        })
        this.setData({name:''})
    }
})

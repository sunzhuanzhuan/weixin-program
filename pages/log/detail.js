let app = getApp().globalData;
Page({
    data:{
        iPhoneX:false,
        name:'',
        home: '../../images/home.png',
        bgImg:'/images/date.png',
        year:'',
        month:'',
        day:''
    },
    onShow:function(){
        let a ='';
        if(new Date().getMonth()+1<10){
            a = "0"+(new Date().getMonth()+1);
        }

        this.setData({
            year:new Date().getFullYear(),
            month:a,
            day:new Date().getDate()
        })
    },
    onLoad:function (options) {
        console.log(options)
        this.setData({name:options.nick})
        // wx.getSystemInfo({
        //     success: function (res) {
        //         let arr = res.model.split(' ').pop().join(' ');
        //         if (res.model === 'iPhone X'|| arr=='iPhone X') {
        //             that.setData({iPhoneX: true})
        //         } else {
        //             that.setData({iPhoneX: false})
        //         }
        //     }
        // })
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

//logs.js
const app = getApp()
Page({
    data: {
        nodes:[],
        isShow:false,
        start:'',
        end:'',
        shareButton :'../../images/shareAfter.png',
        isLike:false,
        isEyes:true,
        bgImg:'',
        isModal:true
    },
    onShareAppMessage: function (res) {
        console.log(res)
        if (res.from === 'button') {
            // 来自页面内转发按钮
            console.log(res.target)
        }
        return {
            title: '自定义转发标题',
            path: '/page/user?id=123'
        }
    },

    onShow(){
        let that = this;
        this.setData({
            bgImg:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532954980716&di=4d7bce6e13ac54e14ef36783d45d008a&imgtype=0&src=http%3A%2F%2Fpic.58pic.com%2F58pic%2F17%2F31%2F66%2F20J58PICuSh_1024.jpg'
        });
        wx.showLoading()
        wx.request({
            url:'https://yijoin-d.weiboyi.com/v1/wx-article/saved/d24b7ea1ce4d51b287c288c11b208442019ec949073ce4a5191e077057670f1b/index.json?format=rich-text',
            success:function (res) {
                that.setData({nodes:[res.data]})
                wx.hideLoading()
            }
        });
        //读取local
        wx.getStorage({
            key: 'scene',
            success: function(res) {
                //console.log(res.data== 1007)
                if(res.data == 1007||res.data == 1008||res.data == 1012||res.data == 1049){
                    that.setData({isEyes:false})
                }else {
                    that.setData({isEyes:true})
                }

            }
        })
    },
    //授权
    handleAuthor(){
        let that_ = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                }else{
                    wx.getUserInfo({
                        success: function (res) {
                            wx.setStorage({
                                key:"userInfo",
                                data:res.userInfo
                            })
                            that_.setData({
                                isModal:false,
                                isEyes:true,
                                bgImg:'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532954980716&di=4d7bce6e13ac54e14ef36783d45d008a&imgtype=0&src=http%3A%2F%2Fpic.58pic.com%2F58pic%2F17%2F31%2F66%2F20J58PICuSh_1024.jpg'
                            });
                        }
                    })
                }
            }
        })
    },
    touchstart(e){
        //console.log(e.changedTouches[0].clientY);
        this.setData({start:e.changedTouches[0].clientY})
    },
    touchend(e){
        //console.log();
        this.setData({end:e.changedTouches[0].clientY},()=>{
            if(this.data.start>this.data.end){
                this.setData({isShow:true})
            }else{
                this.setData({isShow:false})
            }
        })
    },
    handleLike(){
        this.setData({isLike:!this.data.isLike})
    },
    //关闭
    handleClose(){
        this.setData({isModal:true})
    }
})

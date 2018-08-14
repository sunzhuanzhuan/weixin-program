let app = getApp().globalData;
Page({
    data: {
        nodes: [],
        isShow: false,
        start: '',
        end: '',
        shareButton: '../../images/shareAfter.png',
        isLike: false,
        isEyes: true,
        bgImg: '',
        articleId:'',
        shareId:'',
        isIphoneX:false,
        article:{},
        iPhoneX:false
    },
    onShareAppMessage: function () {
        let that = this;
        wx.request({
            url: app.baseUrl + app.distroId + '/my/shares',
            method: 'POST',
            header: {
                'X-Session-Token': app.sessionToken
            },
            data:{
                article:that.data.articleId
            },
            success: function (res) {
            }
        });
        return  {
            title: '自定义转发标题',
            path: 'pages/detail/detail?ref='+this.data.shareId+'&art='+this.data.articleId
        }
    },

    onLoad(options) {
        console.log(options)
        let that = this;
        wx.getSystemInfo({
        success: function (res) {
        if(res.model === 'iPhone X'){
            that.setData({iPhoneX: true})
        }else {
            that.setData({iPhoneX: false })
        }
        console.log(res.windowHeight/res.screenHeight)
        if (res.windowHeight/res.screenHeight>0.9) {
            that.setData({isIphoneX: true})
        }else {that.setData({isIphoneX: false })}
        }})
        wx.showLoading({title:'加载中'})

        //读取local
        wx.getStorage({
            key: 'scene',
            success: function (res) {
                //console.log(res.data== 1007)
                if (res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049) {
                    wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.setData({
                            isEyes: true
                        });
                    },
                    fail:function (res) {
                        that.setData({isEyes: false})
                    }
                })

                    wx.request({
                        url: app.baseUrl + app.distroId + '/article/' + options.art + '/richText?mapSrc=data&ref='+options.ref,
                        method: 'GET',
                        header: {
                            'X-Session-Token': app.sessionToken
                        },
                        success: function (res) {
                            that.setData({nodes: [res.data.data]});
                            wx.hideLoading()
                        }
                    });
                } else {
                    that.setData({isEyes: true,articleId:options.id })
                    // options.id
                    wx.request({
                        url: app.baseUrl + app.distroId + '/article/'+options.id+'/richText?mapSrc=data',
                        method: 'GET',
                        header: {
                            'X-Session-Token': app.sessionToken
                        },
                        success: function (res) {
                            that.setData({nodes: [res.data.data],shareId:res.data.data.refId,article:res.data.data.article});
                            console.log(res.data.data.refId)
                            wx.hideLoading()
                        }
                    });
                }

            }
        })
    },
    //授权
    handleAuthor() {
        let that_ = this;
        wx.getSetting({
            success(res) {
                if (!res.authSetting['scope.userInfo']) {
                } else {
                    wx.getUserInfo({
                        withCredentials: true,
                        success: function (res) {
                            wx.setStorage({
                                key: "userInfo",
                                data: res.userInfo
                            })
                            that_.setData({isEyes: true},()=>{
                                wx.navigateTo({
                                    url:'/pages/log/detail'
                                })
                            });
                        }
                    })
                }
            }
        })
    },
    touchstart(e) {
        //console.log(e.changedTouches[0].clientY);
        this.setData({start: e.changedTouches[0].clientY})
    },
    touchend(e) {
        this.setData({end: e.changedTouches[0].clientY}, () => {
            if (this.data.start >= this.data.end) {
                this.setData({isShow: true})
            } else {
                this.setData({isShow: false})
            }
        })
    },
    handleLike() {
        let that = this;
        this.setData({isLike: !this.data.isLike},()=>{
            if(this.data.isLike){
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/likes',
                    method: 'POST',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    data:{
                        article:that.data.articleId
                    },
                    success: function (res) {
                    }
                });
            }else {
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/likes?action=del',
                    method: 'POST',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    data:{
                        article:that.data.articleId
                    },
                    success: function (res) {
                    }
                });
            }
        });

    },

    //回到首页
    handleCallBack:function () {
            wx.navigateTo({
                url: '/pages/index/index'
            })
    }
})

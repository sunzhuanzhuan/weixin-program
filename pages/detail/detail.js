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
        isModal: true,
        articleId:'',
        shareId:''
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
        let that = this;
        wx.showLoading()
        //读取local
        wx.getStorage({
            key: 'scene',
            success: function (res) {
                //console.log(res.data== 1007)
                if (res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049) {
                    that.setData({isEyes: false})
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
                    wx.request({
                        url: app.baseUrl + app.distroId + '/article/' + options.id + '/richText?mapSrc=data',
                        method: 'GET',
                        header: {
                            'X-Session-Token': app.sessionToken
                        },
                        success: function (res) {
                            that.setData({nodes: [res.data.data],shareId:res.data.data.refId});
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
                            console.log(res)
                            wx.setStorage({
                                key: "userInfo",
                                data: res.userInfo
                            })
                            that_.setData({
                                isModal: false,
                                isEyes: true,
                                bgImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1532954980716&di=4d7bce6e13ac54e14ef36783d45d008a&imgtype=0&src=http%3A%2F%2Fpic.58pic.com%2F58pic%2F17%2F31%2F66%2F20J58PICuSh_1024.jpg'
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
    //关闭
    handleClose() {
        this.setData({isModal: true})
    }
})

let app = getApp().globalData;


Page({
    data: {
        nodes: [],
        isShow: true,
        shareButton: '../../images/shareAfter.png',
        close: '../../images/close.png',
        home: '../../images/home.png',
        src: '',
        isLike: false,
        isEyes: true,
        bgImg: '',
        articleId: '',
        shareId: '',
        isIphoneX: false,
        article: {},
        iPhoneX: false,
        art: '',
        type: '',
        type1: '',
        num: 0,
        isShare:false,
        // --- For view tracking ---

        viewId: '',
        suspendedFor: 0,
        lastSuspendedAt: undefined,
        enteredAt: undefined,

        reportScrollTimeoutHandler: undefined,
        scrollStartedAt: undefined,
        scrollStartPos: undefined,
        viewPercentage: 0,
        nickName:'',
        shareName:''
    },
    onShareAppMessage: function () {
        let that = this;
        wx.request({
            url: app.baseUrl + app.distroId + '/my/shares',
            method: 'POST',
            header: {
                'X-Session-Token': app.sessionToken
            },
            data: {
                article: that.data.articleId,
                pos: that.data.viewPercentage,
                view: that.data.viewId,
                tPlus: Date.now() - (that.data.enteredAt || 0) - that.data.suspendedFor
            },
            success: function (res) {
            }
        });
        return {
            title: this.data.article.title || '默认转发标题',
            path: 'pages/detail/detail?ref=' + this.data.shareId + '&art=' + this.data.articleId+'&nickName='+this.data.nickName
        }
    },
    getData: function (url, method, data) {
        return new Promise(function (resolve, reject) {
            wx.request({
                url: app.baseUrl + app.distroId + url,
                method: method,
                data: data,
                header: { 'X-Session-Token': app.sessionToken },
                fail: reject,
                success: resolve
            })
        })
    },
    onShow: function () {
        
        const now = Date.now();
        const lastSuspendAt = this.data.lastSuspendAt;
        if (lastSuspendAt) {
            const dt = now - lastSuspendAt;
            this.data.suspendedFor = (this.data.suspendedFor || 0) + dt;
            this.data.lastSuspendAt = null;
            // this.setData({ suspendedFor: (this.data.suspendedFor || 0) + dt, lastSuspendAt: null  });
        } else {
            this.data.lastSuspendAt = null;
            // this.setData({ lastSuspendAt: null });
        }
    },
    onLoad(options) {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success: function (res) {
                that.setData({
                    type: "",
                    type1: 'share',
                    nickName:res.data.nickName
                });
            },
            fail: function (res) {
                that.setData({
                    type: 'getUserInfo',
                    type1: 'getUserInfo'
                });
            }
        })
        wx.getSystemInfo({
            success: function (res) {
                let model = res.model;
                let arr = model.split(' ');
                arr.pop()
                let c = arr.join(' ');

                console.log(arr)
                console.log(options)
                if (model == 'iPhone X' || c == 'iPhone X') {

                    that.setData({ iPhoneX: true })
                } else {
                    that.setData({ iPhoneX: false })
                }
                if (model == 'iPhone X' || c == 'iPhone X') {
                    that.setData({ isIphoneX: true })
                } else { that.setData({ isIphoneX: false }) }
            }
        })
        wx.showLoading({ title: '加载中' })
        this.setData({

        }, () => {
            //读取local
            //
            wx.getStorage({
                key: 'scene',
                success: function (res) {
                const scene = res.data;
                console.log(scene)
                    if ((res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049) && options.art != undefined) {
                        app.tokenPromise.then(function (sessionToken) {
                            that.setData({ art: options.art, src: that.data.home,articleId:options.art,isShare:true ,shareName:options.nickName })
                            wx.getStorage({
                                key: 'userInfo',
                                success: function (res) {
                                    that.setData({
                                        isEyes: true,
                                    });
                                },
                                fail: function (res) {
                                    that.setData({ isEyes: false })
                                }
                            })
                            wx.showNavigationBarLoading();
                            that.getData('/article/' + options.art + '/richText?scene=' + scene + '&mapSrc=data&overrideStyle=false&fixWxMagicSize=true&ref=' + options.ref, 'GET').then((res) => {

                                const r = res.data.data;
                                if (r.article) {
                                    const currentTitle = r.article.title;
                                    wx.setNavigationBarTitle({
                                        title: currentTitle,
                                    });
                                }

                                that.setData({ nodes: [r], shareId: r.refId, article: r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });
                                wx.hideLoading()
                                wx.hideNavigationBarLoading();
                            })

                        })

                    } else {
                        that.setData({ isEyes: true, articleId: options.id, src: that.data.close,isShare:false , })
                        // options.id
                        wx.showNavigationBarLoading();
                      that.getData('/article/' + options.id + '/richText?scene=' + scene + '&mapSrc=data&overrideStyle=false&fixWxMagicSize=true', 'GET').then((res) => {
                            const r = res.data.data;
                            if (r.article) {
                                const currentTitle = r.article.title;
                                wx.setNavigationBarTitle({
                                    title: currentTitle,
                                });
                            }
                            that.setData({ nodes: [r], shareId: r.refId, article: r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });
                            wx.hideLoading();
                            wx.hideNavigationBarLoading();
                        })
                    }

                }
            })
        })


    },
    //授权
    handleAuthor(e) {
        let that_ = this;
        console.log()
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
                           
                            that_.setData({ type: '', type1: 'share' ,nickName:res.userInfo.nickName},()=>{
                                console.log(res.userInfo)
                                if(e.currentTarget.dataset.item === 'like'){
                                    that_.setData({ isLike: !that_.data.isLike });
                                    wx.request({
                                        url: app.baseUrl + app.distroId + '/my/likes',
                                        method: 'POST',
                                        header: {
                                            'X-Session-Token': app.sessionToken
                                        },
                                        data: {
                                            article: that_.data.articleId
                                        },
                                        success: function (res) {
                                        }
                                    });
                                }else if(e.currentTarget.dataset.item  === 'share'){
                                    
                                }
                            })
                            wx.request({
                                method: 'POST',
                                url: app.baseUrl + app.distroId + '/my/profile',
                                data: {
                                    encryptedData: res.encryptedData,
                                    iv: res.iv
                                },
                                header: {
                                    'X-Session-Token': app.sessionToken
                                },
                                success: function (res) {
                                }
                            })
                            wx.getStorage({
                                key: 'scene',
                                success: function (res) {
                                    const scene = res.data;
                                    if ((res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049)){
                                        that_.setData({isEyes: true},()=>{
                                            wx.navigateTo({
                                                url:'/pages/log/detail?nick='+that_.data.shareName
                                            })
                                        });
                                    }
                                }
                            })


                        }
                    })
                }
            }
        })
    },

    handleLike() {
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success: function (res) {
                that.setData({ isLike: !that.data.isLike }, () => {
                    if (that.data.isLike) {
                        wx.request({
                            url: app.baseUrl + app.distroId + '/my/likes',
                            method: 'POST',
                            header: {
                                'X-Session-Token': app.sessionToken
                            },
                            data: {
                                article: that.data.articleId
                            },
                            success: function (res) {
                            }
                        });
                    } else {
                        wx.request({
                            url: app.baseUrl + app.distroId + '/my/likes?action=del',
                            method: 'POST',
                            header: {
                                'X-Session-Token': app.sessionToken
                            },
                            data: {
                                article: that.data.articleId
                            },
                            success: function (res) {
                            }
                        });
                    }
                });

            },
            fail: function (res) {
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
                                }
                            })
                        }
                    }
                })
            }
        })

    },

    //回到首页
    handleCallBack: function () {
        if (this.data.art != '') {
            wx.navigateTo({
                url: '/pages/index/index'
            })
        } else {
            wx.navigateBack({
                url: '/pages/index/index'
            })
        }
    },

    onPageScroll: function (ev) {
        // console.log(ev);
    },

    logIt: function (ev) {
        // console.log(ev);
    },
    onHide: function () {
        this.setData({ lastSuspendAt: Date.now() });
    },
    onUnload: function () {
        if(!this.data.isLike){
            app.articleId=this.data.articleId
        }
        if (this.data.viewId && this.data.articleId) {
            wx.request({
                url: app.baseUrl + app.distroId + '/my/lefts',
                method: 'POST',
                header: {
                    'X-Session-Token': app.sessionToken
                },
                data: {
                    article: this.data.articleId,
                    view: this.data.viewId,
                    duration: Date.now() - this.data.enteredAt - this.data.suspendedFor
                },
                success: function (res) {
                }
            });
        }
    },
    recordUserscroll: function (event) {
        let num1 = event.detail.scrollTop;
        let that = this;
        if (num1 > this.data.num) {
            this.setData({ isShow: false})
            wx.getStorage({
                key: 'scene',
                success: function (res) {
                    if (res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049) {
                        that.setData({isShare: false})
                    }
                }
            })

        } else {
            this.setData({ isShow: true });
            wx.getStorage({
                key: 'scene',
                success: function (res) {
                    if (res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049) {
                        if(that.data.nickName){
                            that.setData({isShare: false,isEyes:true})
                        }else {
                            that.setData({isShare: true,isEyes:false})
                        }

                    }
                }
            })

        }
        this.data.num = num1
        if (!(event && event.type === 'scroll')) {
            return;
        }
        if (this.data.reportScrollTimeoutHandler) {
            clearTimeout(this.data.reportScrollTimeoutHandler);
        }
        if (!this.data.scrollStartedAt) {
            this.data.scrollStartedAt = Date.now();
            this.data.scrollStartPos = event.detail.scrollTop + event.detail.deltaY;
        }
        this.data.reportScrollTimeoutHandler = setTimeout(function () {
            this.data.viewPercentage = (event.detail.scrollTop / event.detail.scrollHeight) * 100;
            if (this.data.viewId && this.data.articleId) {
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/scrolls',
                    method: 'POST',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    data: {
                        article: this.data.articleId,
                        view: this.data.viewId,
                        tPlus: this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
                        duration: Date.now() - this.data.scrollStartedAt,
                        startPos: (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
                        endPos: this.data.viewPercentage
                    },
                    success: function (res) {
                    }
                });
            }
            this.data.scrollStartedAt = undefined;

        }.bind(this), 500);
    },
    handleBack:function(e){
        wx.reLaunch({
            url:'/pages/index/index'
        })
    },
})

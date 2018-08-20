let app = getApp().globalData;
let golbal = getApp()


Page({
    data: {
        nodes: [],
        isShow: false,
        start: '',
        end: '',
        shareButton: '../../images/shareAfter.png',
        close:'../../images/close.png',
        home: '../../images/home.png',
        src:'',
        isLike: false,
        isEyes: true,
        bgImg: '',
        articleId:'',
        shareId:'',
        isIphoneX:false,
        article:{},
        iPhoneX:false,
        art:'',
        type:'',
        type1:'',
        
        // --- For view tracking ---

        viewId: '',
        suspendedFor: 0,
        lastSuspendedAt: undefined,
        enteredAt: undefined,

        reportScrollTimeoutHandler: undefined,
        scrollStartedAt: undefined,
        scrollStartPos: undefined,
        viewPercentage: 0

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
                article:that.data.articleId,
                pos: that.data.viewPercentage,
                view: that.data.viewId,
                tPlus: Date.now() - (that.data.enteredAt || 0) - that.data.suspendedFor
            },
            success: function (res) {
            }
        });
        return  {
            title: this.data.article.title || '默认转发标题',
            path: 'pages/detail/detail?ref='+this.data.shareId+'&art='+this.data.articleId
        }
    },
    getData:function(url,method,data){
        return new Promise(function(resolve,reject){
            wx.request({
                url: app.baseUrl + app.distroId +url,
                method:method,
                data: data,
                header:{'X-Session-Token':app.sessionToken},
                fail:reject,
                success: resolve
            })
        })
    },
    onShow:function(){
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
                    type1:'share'
                });
            },
            fail: function (res) {
                that.setData({
                    type: 'getUserInfo',
                    type1:'getUserInfo'
                });
            }
        })
        wx.getSystemInfo({
        success: function (res) {
        if(res.model === 'iPhone X'){
            that.setData({iPhoneX: true})
        }else {
            that.setData({iPhoneX: false })
        }
        if (res.model === 'iPhone X') {
            that.setData({isIphoneX: true})
        }else {that.setData({isIphoneX: false })}
        }})
        wx.showLoading({title:'加载中'})
        this.setData({

        },()=>{
            //读取local
        //
        wx.getStorage({
            key: 'scene',
            success: function (res) {
                if ((res.data == 1007 || res.data == 1008 || res.data == 1012 || res.data == 1049 ) && options.art !=undefined ) {
                    that.setData({art:options.art,src:that.data.home})
                    wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.setData({
                            isEyes: true,
                        });
                    },
                    fail:function (res) {
                        that.setData({isEyes: false})
                    }
                })
                    wx.showNavigationBarLoading();
                        that.getData('/article/' + options.art + '/richText?mapSrc=data&overrideStyle=false&fixWxMagicSize=true&ref='+options.ref,'GET').then((res)=>{
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

                } else {
                    that.setData({isEyes: true,articleId:options.id ,src:that.data.close})
                    // options.id
                    wx.showNavigationBarLoading();
                    that.getData('/article/' + options.id +'/richText?mapSrc=data&overrideStyle=false&fixWxMagicSize=true','GET').then((res)=>{
                        const r = res.data.data;
                            if (r.article) {
                              const currentTitle = r.article.title;
                              wx.setNavigationBarTitle({
                                title: currentTitle,
                              });
                            }
                            that.setData({nodes: [r],shareId:r.refId,article:r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });
                            wx.hideLoading();
                            wx.hideNavigationBarLoading();
                    })
                }

            }
        })
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
                            that_.setData({type:'',type1:'share'})
                            // that_.setData({isEyes: true},()=>{
                            //     wx.navigateTo({
                            //         url:'/pages/log/detail?nick='+res.userInfo.nickName
                            //     })
                            // });
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
        console.log(1212)
        let that = this;
        wx.getStorage({
            key: 'userInfo',
            success: function (res) {
                that.setData({isLike: !that.data.isLike},()=>{
                    if(that.data.isLike){
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
    handleCallBack:function () {
        if(this.data.art != ''){
            wx.navigateTo({
                url: '/pages/index/index'
            })
        }else{
            wx.navigateBack({
                url: '/pages/index/index'
            })
        }
    },

    onPageScroll: function(ev) {
      console.log(ev);
    },

  logIt: function (ev) {
    console.log(ev);
  },
  onHide: function() {
    this.setData({lastSuspendAt: Date.now()});
  },
  onUnload: function() {
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
  recordUserscroll: function(event) {
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
    this.data.reportScrollTimeoutHandler = setTimeout(function(){
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
  }
})

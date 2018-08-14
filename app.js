App({
    onShow: function (options) {
        wx.checkSession({
            success: function(){},
            fail: function(){
                // session_key 已经失效，需要重新执行登录流程
            }
        })
        wx.getSystemInfo({
            success: function(res) {
                // console.log(res.statusBarHeight)
                console.log(res.model)
                console.log(res.windowHeight)
            }
        })
        wx.setStorage({
            key:'scene',
            data:options.scene
        })
        let that = this;
        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync(): {};
        this.globalData.appToken = extConfig.appToken;
        this.globalData.distroId = extConfig.distroId;
        const tokenPromise = new Promise((resolve, reject) => {
            wx.login({
                success: function(res) {
                    wx.request({
                        method: 'POST',
                        url: that.globalData.baseUrl + that.globalData.distroId+'/login',
                        data: {
                            appToken: that.globalData.appToken,
                            code: res.code
                        },
                        success: function(res) {
                            that.globalData.sessionToken=res.header['X-Set-Session-Token'] || res.header['X-Set-Session-Token'.toLowerCase()];

                            resolve(that.globalData.sessionToken);
                        },
                        fail: function(err) {
                            reject(err);
                        }
                    });
                }
            });
        });
        this.globalData.tokenPromise = tokenPromise;
    },
    globalData: {
        baseUrl:"https://yijoin-d.weiboyi.com/v1/distribution/",
        distroId: "",
        appToken: "",
        sessionToken:''
    }

})
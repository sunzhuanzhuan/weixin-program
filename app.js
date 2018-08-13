App({
    onShow: function (options) {
        wx.checkSession({
            success: function(){},
            fail: function(){
                // session_key 已经失效，需要重新执行登录流程
            }
        })
        wx.setStorage({
            key:'scene',
            data:options.scene
        })
        let that = this;
        let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync(): {};
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
        distroId: "5b63fb56b106d81d9b74972a",
        appToken: "JIoR14MrZZlReOfpJP7ocGF3bhpPq6BY_OiROkRRmdo",
        sessionToken:''
    }

})
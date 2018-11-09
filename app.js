const GDT = require('./application-data.js');
App({
    onLaunch: function(launchParam) {
        this.globalData.applicationDataContext = new GDT(launchParam, ['wxArticle']);
    },
    onShow: function (showParam) {
        this.globalData.applicationDataContext.onAppShow(showParam);
        this.globalData.applicationDataContext.checkAndFixUserLogin();
    },
    onError: function (error) {
        this.globalData.applicationDataContext.onAppError(error);
    },
    onHide: function() {
        this.globalData.applicationDataContext.onAppHide();
    },
    globalData: {
        baseUrl:"",
        distroId: "",
        appToken: "",
        sessionToken:'',
        articleId:'',
        backgroundAudioManager: wx.getBackgroundAudioManager()

    },
    

})
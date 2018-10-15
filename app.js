const GDT = require('./application-data.js');
App({
    onLaunch: function(launchParam) {
        this.globalData.applicationDataContext = new GDT(launchParam);
        this.globalData.applicationDataContext.downloadMyAvatar().then((r1)=> {
            this.globalData.applicationDataContext.downloadWxaCode(320, 'pages/detail/detail', '666', 'auto').then((r2)=>{
                this.globalData.avatar=r1;
                this.globalData.code=r2
            })
        })
        // this.globalData.avatar='/images/tou.png';
        // this.globalData.code='/images/timg.jpeg'
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
        articleId:''

    },
    

})
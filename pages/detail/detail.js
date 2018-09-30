let app = getApp().globalData;
const gdt = app.applicationDataContext;

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
    //授权的时候发生的
    handleAuthor:function(e){
        if(e.currentTarget.dataset.item === 'like'){
            this.setData({ isLike: !this.data.isLike }, () => {
                if (this.data.isLike) {
                    gdt.likeItem(this.data.articleId);
                } else {
                    gdt.unlikeItem(this.data.articleId);
                }
            });
        }else if(e.currentTarget.dataset.item === 'share'){
                this.setData({type1: 'share'});
        }
    },
    onLoad(options) {
        let that = this;
        
        gdt.userInfo.then((x)=> {
            this.setData({
                isEyes: true,
                type: "",
                type1: 'share',
                nickName: x.userInfo.nickName
            });
        }).catch(()=> {
            this.setData({
                isEyes: false,
                type: 'getUserInfo',
                type1: 'getUserInfo'
            });
        });
        const scene = gdt.showParam.scene;
        let qPromise;
        const articleId = options.art || options.id;
        if ((scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049) && options.art != undefined) {
            this.setData({ art: articleId, src: this.data.home,isShare:true ,shareName:options.nickName})
            qPromise = gdt.fetchArticleDetail(articleId, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true',
                ref: options.ref
            });
        } else {
            this.setData({ isEyes: true, articleId: options.id, src: this.data.close })
            qPromise = gdt.fetchArticleDetail(articleId, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true'
            });
        }

        qPromise.then((r)=> {
            if (r.article) {
                const currentTitle = r.article.title;
                wx.setNavigationBarTitle({
                    title: currentTitle,
                });
            }
            this.setData({ articalName:r.article.title,nodes: [r], shareId: r.refId, article: r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });
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
        const scene = gdt.showParam.scene;
        if (num1 > this.data.num) {
            this.setData({ isShow: false});
            
            if (scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049) {
                this.setData({isShare: false});
            }

        } else {
            this.setData({ isShow: true });
            if (scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049) {
                this.setData({isShare: true});
            }

        }
        this.data.num = num1;
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
                gdt.trackScrollActionInViewing(
                    this.data.articleId, 
                    this.data.viewId,
                    this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
                    Date.now() - this.data.scrollStartedAt,
                    (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
                    this.data.viewPercentage
                );
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

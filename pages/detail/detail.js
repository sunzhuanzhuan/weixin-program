let app = getApp().globalData;
const gdt = app.applicationDataContext;

Page({
    data: {
        appName:'',
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
        shareName:'',
        isShowPoster:false,
        imgPath:'/images/tou.png',
        logo:'/images/timg.jpeg',
        articalTitle:'',
        articalDescribe:'',
        numArtical:200,
        numFriend:90
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

        if (e.detail && e.detail.userInfo) {
            gdt.emit('userInfo', e.detail);
        }

    },
    handleLikeButtonTapped: function (e) {
        gdt.userInfo.then(()=> {
            this.setData({ isLike: !this.data.isLike }, () => {
                if (this.data.isLike) {
                    gdt.likeItem(this.data.articleId);
                } else {
                    gdt.unlikeItem(this.data.articleId);
                }
            });
        }).catch(()=> {
            gdt.once('userInfo', ()=> {
                this.setData({ isLike: !this.data.isLike }, () => {
                    if (this.data.isLike) {
                        gdt.likeItem(this.data.articleId);
                    } else {
                        gdt.unlikeItem(this.data.articleId);
                    }
                });
            });
        });
        
    },
    onLoad(options) {
        let that = this;
        this.setData({appName:options.appName})
        gdt.userInfo.then((x)=> {
            this.setData({
                type: "",
                type1: 'share',
                nickName: x.userInfo.nickName
            });
        }).catch(()=> {
            this.setData({
                type: 'getUserInfo',
                type1: 'getUserInfo'
            });
            gdt.once('userInfo', ()=> {
                this.setData({type1: 'share'});
            });
        });
        const scene = gdt.showParam.scene;
        let qPromise;
        const articleId = options.art || options.id;
        if ((scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049) && options.art != undefined) {
            this.setData({ art: articleId, src: this.data.home,isShare:true ,shareName:options.nickName,articleId:options.art });
            gdt.userInfo.then((x)=> {
                this.setData({
                    isEyes: true
                });
            }).catch(()=> {
                this.setData({
                    isEyes: false
                });
            });
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
            this.setData({ articalTitle:r.article.title,articalDescribe:r.article.bref,articalName:r.article.title,nodes: [r], shareId: r.refId, article: r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });
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
    getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
    },
    handlePoster:function () {
        this.setData({isShowPoster:true});
        wx.showLoading({
            title: '正在生成图片...',
            mask: true,
        });
        //y方向的偏移量，因为是从上往下绘制的，所以y一直向下偏移，不断增大。
        let yOffset = 50;
        //绘制标题背景
        const ctx = wx.createCanvasContext('shareCanvas');
        
       
        // 绘制接口的文章数量和分享和背景
        ctx.rect(75, 60, 236, 80)
        const grd = ctx.createLinearGradient(75, 60, 236, 80)
        grd.addColorStop(0, '#e9ecfa')
        grd.addColorStop(0.2, '#e9ecfa')
        grd.addColorStop(0.4, '#e9ecfa')
        grd.addColorStop(0.5, '#e9ecfa')
        grd.addColorStop(0.66, '#F1E8ED')
        grd.addColorStop(0.83, '#F1E8ED')
        grd.addColorStop(1, '#F1E8ED')
        ctx.setFillStyle(grd)
        ctx.fill()
        const bigTitle = '这是我在'+this.data.appName+'小程序阅读的第'
        ctx.setFontSize(12)
        ctx.setFillStyle('#101010');
        ctx.fillText(bigTitle, 90, 80);
        
        const friend = '篇已经有       个好友阅读了我的'
        ctx.setFontSize(12)
        ctx.setFillStyle('#101010');
        ctx.fillText(friend, 124, 110);
        ctx.setFontSize(12)
        ctx.setFillStyle('#101010');
        ctx.fillText('分享', 90, 130);

        //绘制头像
        const imgPath = this.data.imgPath;
        ctx.save()
        ctx.beginPath()
        ctx.arc(40, 70, 30, 0, 2*Math.PI)
        ctx.clip()
        ctx.drawImage(imgPath,10, 40,60, 60)
        ctx.restore()

        //绘制文章标题
        const goodsTitle = this.data.nickName;
        let goodsTitleArray = [];
        //为了防止标题过长，分割字符串,每行18个
        for (let i = 0; i < goodsTitle.length / 18; i++) {
            if (i > 2) {
                break;
            }
            goodsTitleArray.push(goodsTitle.substr(i * 18, 18));
        }
        
        goodsTitleArray.forEach(function (value) {
            ctx.setFontSize(14);
            ctx.setFillStyle('#000');
            ctx.fillText(value, 80,yOffset);
            yOffset += 25;
        });
        // 绘制文章的标题和描述
        yOffset = 180;
        const title= this.data.articalTitle;
        const describe = this.data.articalDescribe;
        let canvasTtile
        if(title.length<12){
            canvasTtile = title;
        }else{
            canvasTtile = title.slice(0,13)+'...'
        }
        
        ctx.setFontSize(16)
        ctx.setFillStyle('#333333');
        ctx.fillText(canvasTtile, 30, yOffset);
        ctx.setFontSize(12)
        ctx.setFillStyle('#666666');
        ctx.fillText(describe, 30, 220,220);
        
        //小程序二维码
        const code = this.data.logo;
        ctx.drawImage(code, 20, 230,96, 96)

        //绘制长按小程序
        let miniApp = '长按识别,进入小程序'
        ctx.setFontSize(14)
        ctx.setFillStyle('#333333');
        ctx.fillText(miniApp, 130, 270,220);
       
        let miniAppShare = '分享来自'
        ctx.setFontSize(14)
        ctx.setFillStyle('#333333');
        ctx.fillText(miniAppShare, 130,300,220);
        ctx.font = 'normal bold 16px sans-serif';
        let appName = '「'+this.data.appName+'」';
        
        ctx.setFillStyle('#000');
        ctx.fillText(appName, 120, 320,220);

        ctx.font = 'normal bold 18px sans-serif';
        const numArtical = this.data.numArtical;
        ctx.setFillStyle('#101010');
        ctx.fillText(numArtical, 90, 110);
        const numFriend = this.data.numFriend;
        ctx.setFillStyle('#101010');
        ctx.fillText(numFriend, 174, 110);
        ctx.draw()
       let that = this
        //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
        setTimeout(function () {
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width: 390,
                height: 800,
                destWidth: 390,
                destHeight: 800,
                canvasId: 'shareCanvas',
                success: function (res) {
                    console.log(res)
                    that.setData({
                        shareImage: res.tempFilePath,
                        showSharePic: true
                    },()=>{
                        // wx.saveImageToPhotosAlbum({
                        //     filePath:that.data.shareImage,
                        //     success:function () {
                        //         console.log('保存成功')
                        //     },
                        //     fail:function () {
                        //         console.log('保存失败')
                        //     }
                        // })
                    })
                    wx.hideLoading();
                },
                fail: function (res) {
                    console.log(res)
                    wx.hideLoading();
                }
            })
        }, 2000);
    },
    handleSavePicture:function(){
        this.setData({isShowPoster:false});
    }
})

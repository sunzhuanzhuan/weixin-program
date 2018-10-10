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
    getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
    },
    handlePoster: function (cardInfo, avaterSrc, codeSrc) {
        wx.showLoading({
          title: '生成中...',
          mask: true,
        })
        var that = this;
        const ctx = wx.createCanvasContext('myCanvas');
        var width = "";
        wx.createSelectorQuery().select('#canvas-container').boundingClientRect(function (rect) {
          var height = rect.height;
          var right = rect.right;
          width = rect.width * 0.8;
          var left = rect.left + 5;
          ctx.setFillStyle('#fff');
          ctx.fillRect(0, 0, rect.width, height);
    
          //头像
          if (avaterSrc) {
            ctx.drawImage(avaterSrc, left, 20, width, width);
            ctx.setFontSize(14);
            ctx.setFillStyle('#fff');
            ctx.setTextAlign('left');
          }
    
          if (cardInfo.TagList.length > 0) {
            ctx.fillText(cardInfo.TagList[0].TagName, left + 20, width - 4); //标签
            const metrics = ctx.measureText(cardInfo.TagList[0].TagName); //测量文本信息
            ctx.stroke();
            ctx.rect(left + 10, width - 20, metrics.width + 40, 25);
            ctx.setFillStyle('rgba(255,255,255,0.4)');
            ctx.fill();
          }
    
          if (cardInfo.CardInfo.Name) {
            ctx.setFontSize(14);
            ctx.setFillStyle('#000');
            ctx.setTextAlign('left');
            ctx.fillText(cardInfo.CardInfo.Name, left, width + 60); //姓名
          }
    
          if (cardInfo.CardInfo.Position) {
            ctx.setFontSize(12);
            ctx.setFillStyle('#666');
            ctx.setTextAlign('left');
            ctx.fillText(cardInfo.CardInfo.Position, left, width + 85); //职位
          }
    
          if (cardInfo.CardInfo.Mobile) {
            ctx.setFontSize(12);
            ctx.setFillStyle('#666');
            ctx.setTextAlign('left');
            ctx.fillText(cardInfo.CardInfo.Mobile, left, width + 105); //电话
          }
    
          if (cardInfo.CardInfo.Company) {
            // 公司名称
            const CONTENT_ROW_LENGTH = 24; // 正文 单行显示字符长度
            let [contentLeng, contentArray, contentRows] = that.textByteLength(cardInfo.CardInfo.Company, CONTENT_ROW_LENGTH);
            ctx.setTextAlign('left');
            ctx.setFillStyle('#000');
            ctx.setFontSize(10);
            let contentHh = 22 * 1;
            for (let m = 0; m < contentArray.length; m++) {
              ctx.fillText(contentArray[m], left, width + 150 + contentHh * m);
            }
          }
    
          //  绘制二维码cardInfo.CardInfo.QrCode
          if (codeSrc) {
            ctx.drawImage(codeSrc, left + 150, width + 40, width / 3, width / 3)
            ctx.setFontSize(10);
            ctx.setFillStyle('#000');
            ctx.setTextAlign('right');
            ctx.fillText("微信扫码或长按识别", left + 235, width + 150);
          }
    
        }).exec()
    
        setTimeout(function () {
          ctx.draw();   //这里有个需要注意就是，这个方法是在绘制完成之后在调用，不然容易其它被覆盖。
          wx.hideLoading();
        }, 1000)
    
      },
})

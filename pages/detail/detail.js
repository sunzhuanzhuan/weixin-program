let app = getApp().globalData;
const gdt = app.applicationDataContext;

Page({
    data: {
        appName: '',
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
        isShare: false,
        // --- For view tracking ---

        viewId: '',
        suspendedFor: 0,
        lastSuspendedAt: undefined,
        enteredAt: undefined,

        reportScrollTimeoutHandler: undefined,
        scrollStartedAt: undefined,
        scrollStartPos: undefined,
        viewPercentage: 0,
        nickName: '',
        shareName: '',
        isShowPoster: false,
        imgPath: '',
        logo: '',
        articalTitle: '',
        articalDescribe: '',
        numArtical: 200,
        numFriend: 90,
        ratio: 0,
        yinHao: '/images/yinHao.png'
    },
    onShareAppMessage: function () {
        if (this.data.articleId) {
            gdt.trackShareItem(this.data.articleId, {
                pos: this.data.viewPercentage,
                view: this.data.viewId,
                tPlus: Date.now() - (this.data.enteredAt || 0) - this.data.suspendedFor
            });
            gdt.track('share-item', { itemId: this.data.articleId, title: this.data.article.title, refId: this.data.shareId, viewId: this.data.viewId });

        }
        return {
            title: this.data.article.title || '默认转发标题',
            path: 'pages/detail/detail?ref=' + this.data.shareId + '&id=' + this.data.articleId + '&nickName=' + this.data.nickName
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
        gdt.track('show-detail', { itemId: this.data.articleId, refId: this.data.shareId, viewId: this.data.viewId });
    },
    //授权的时候发生的
    handleAuthor: function (e) {

        if (e.detail && e.detail.userInfo) {
            gdt.emit('userInfo', e.detail);
        }

    },
    handleLikeButtonTapped: function (e) {
        gdt.userInfo.then(() => {
            this.setData({ isLike: !this.data.isLike }, () => {
                if (this.data.isLike) {
                    gdt.likeItem(this.data.articleId);
                    gdt.track('like-item', { itemId: this.data.articleId, viewId: this.data.viewId });
                } else {
                    gdt.unlikeItem(this.data.articleId);
                    gdt.track('unlike-item', { itemId: this.data.articleId, viewId: this.data.viewId });
                }
            });
        }).catch(() => {
            gdt.once('userInfo', () => {
                this.setData({ isLike: !this.data.isLike }, () => {
                    if (this.data.isLike) {
                        gdt.track('like-item', { itemId: this.data.articleId, viewId: this.data.viewId });
                        gdt.likeItem(this.data.articleId);
                    } else {
                        gdt.unlikeItem(this.data.articleId);
                        gdt.track('unlike-item', { itemId: this.data.articleId, viewId: this.data.viewId });
                    }
                });
            });
        });

    },
    onLoad(options) {

        console.log(1111111111111111111)

        console.log(gdt.showParam)
        console.log(options)

        console.log(22222222222222222222)
        gdt.systemInfo.then((x) => {
            this.setData({
                ratio: x.windowWidth * 2 / 750,
            });
            let modelmes = x.model;
            if (modelmes.search('iPhone X') != -1) {
                this.setData({
                    isIphoneX: true,
                });
            }
        });
        let that = this;
        this.setData({ appName: options.appName })
        gdt.userInfo.then((x) => {
            this.setData({
                type: "",
                type1: 'share',
                nickName: x.userInfo.nickName
            });
        }).catch(() => {
            this.setData({
                type: 'getUserInfo',
                type1: 'getUserInfo'
            });
            gdt.once('userInfo', () => {
                this.setData({ type1: 'share' });
            });
        });
        const scene = gdt.showParam.scene;
        let qPromise;
        const articleId = options.art || options.id;
        if ((scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049) && options.art != undefined) {
            this.setData({ art: articleId, src: this.data.home, isShare: true, shareName: options.nickName, articleId: options.art });
            gdt.userInfo.then((x) => {
                this.setData({
                    isEyes: true
                });
            }).catch(() => {
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
        } else if (scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073) {
            this.setData({ isEyes: true, articleId: options.id, src: this.data.close, isShare: true });
            // fetchArticleDetailByReferenceId(referenceId, {...options})
            qPromise = gdt.fetchArticleDetail(articleId, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true'
            });
        } else if (scene == 1048) {
            const referencers = (options.scene)
            this.setData({ isEyes: true, articleId: options.id, src: this.data.close, isShare: true });
            qPromise = gdt.fetchArticleDetailByReferenceId(referencers, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true'
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

        qPromise.then((r) => {
            if (r.article) {
                const currentTitle = r.article.title;
                wx.setNavigationBarTitle({
                    title: currentTitle,
                });
            }
            this.setData({ articalTitle: r.article.title, articalDescribe: r.article.bref || '哎呀！这篇文章没摘要，扫码查看文章详情吧～', articalName: r.article.title, nodes: [r], shareId: r.refId, article: r.article, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });

            gdt.track('detail-load', { itemId: r.article._id, title: r.article.title, refId: r.refId, viewId: r.viewId });
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
        if (!this.data.isLike) {
            app.articleId = this.data.articleId
        }
        if (this.data.viewId && this.data.articleId) {
            gdt.trackLeftViewing(this.data.articleId, this.data.viewId, Date.now() - this.data.enteredAt - this.data.suspendedFor);
            gdt.track('detail-close', {
                itemId: this.data.articleId,
                viewId: this.data.viewId,
                duration: Date.now() - this.data.enteredAt - this.data.suspendedFor
            });
        }
    },
    recordUserscroll: function (event) {
        let num1 = event.detail.scrollTop;
        const scene = gdt.showParam.scene;
        if (num1 > this.data.num) {
            this.setData({ isShow: false });

            if (scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049 || scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073) {
                this.setData({ isShare: false });
            }

        } else {
            this.setData({ isShow: true });
            if (scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049 || scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073) {
                this.setData({ isShare: true });
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
                // gdt.trackScrollActionInViewing(
                //     this.data.articleId, 
                //     this.data.viewId,
                //     this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
                //     Date.now() - this.data.scrollStartedAt,
                //     (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
                //     this.data.viewPercentage
                // );
                gdt.track('detail-scroll', {
                    itemId: this.data.articleId,
                    viewId: this.data.viewId,
                    tPlus: this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
                    duration: Date.now() - this.data.scrollStartedAt,
                    startPos: (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
                    endPos: this.data.viewPercentage
                });
            }
            this.data.scrollStartedAt = undefined;

        }.bind(this), 500);

    },
    handleBack: function (e) {
        wx.reLaunch({
            url: '/pages/index/index'
        })
    },
    getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
    },
   
    handleDrowPicture: function () {
        this.setData({ isShowPoster: true })
        let ratio = this.data.ratio;
        let that = this;
        wx.showLoading({
            title: '正在生成图片...',
            mask: true,
        });
        let artical = gdt.fetchArticleMeta(this.data.articleId);
        let downAvatar = gdt.downloadMyAvatar();
        let downCode = gdt.downloadWxaCode(320, 'pages/detail/detail', this.data.shareId, 'auto')
        Promise.all([artical, downAvatar, downCode]).then((res) => {
            let yOffset = 30 * ratio;
            //绘制标题背景
            const ctx = wx.createCanvasContext('shareCanvas');
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(8, 8, 304 * ratio, 434 * ratio);
            
            // 绘制通话的框
            ctx.moveTo(68 * ratio, 62 * ratio)
            ctx.lineTo(75 * ratio, 52 * ratio);
            ctx.lineTo(75 * ratio, 72 * ratio);
            ctx.closePath()
            // ctx.setFillStyle('#e9ecfa');
            ctx.setStrokeStyle('#ffffff')
            ctx.stroke()
            // 绘制接口的文章数量和分享和背景
            ctx.rect(75 * ratio, 46 * ratio, 236 * ratio, 80 * ratio)
            const grd = ctx.createLinearGradient(75 * ratio, 60 * ratio, 236 * ratio, 80 * ratio)
            grd.addColorStop(0, '#e9ecfa')
            grd.addColorStop(0.2, '#e9ecfa')
            grd.addColorStop(0.4, '#e9ecfa')
            grd.addColorStop(0.5, '#e9ecfa')
            grd.addColorStop(0.66, '#F1E8ED')
            grd.addColorStop(0.83, '#F1E8ED')
            grd.addColorStop(1, '#F1E8ED')
            ctx.setFillStyle(grd)
            ctx.fill();
            // 绘制数字
            ctx.font = 'normal bold 18px sans-serif';


            const numArtical = res[0].readingMeta.nthRead + '';
            ctx.setFillStyle('#101010');
            ctx.fillText(numArtical, 100 * ratio, 96 * ratio);
            const bigTitle = ('这是我在' + this.data.appName + '小程序阅读的第')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');
            ctx.fillText(bigTitle, 100 * ratio, 74 * ratio);

            const friend = ('篇已经有')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');

            const my = (' 个好友阅读了我的')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');

            const numFriend = res[0].readingMeta.referencers + '';

            if (numFriend.length === 1) {
                ctx.fillText(my, 194 * ratio, 96 * ratio);
            } else if (numFriend.length === 2) {
                ctx.fillText(my, 200 * ratio, 96 * ratio);
            } else if (numFriend.length === 3) {
                ctx.fillText(my, 210 * ratio, 96 * ratio);
            }

            ctx.save();
            ctx.font = 'normal bold 18px sans-serif';
            if (numFriend.length === 1) {

                ctx.fillText(numFriend, 184 * ratio, 96 * ratio);
            } else if (numFriend.length === 2) {

                ctx.fillText(numFriend, 180 * ratio, 96 * ratio);
            } else if (numFriend.length === 3) {

                ctx.fillText(numFriend, 184 * ratio, 96 * ratio);
            }
            ctx.restore()

            if (numArtical.length === 1) {
                ctx.fillText(friend, 114 * ratio, 96 * ratio);
            } else if (numArtical.length === 2) {
                ctx.fillText(friend, 124 * ratio, 96 * ratio);;
            } else if (numArtical.length === 3) {
                ctx.fillText(friend, 134 * ratio, 96 * ratio);
            } else if (numArtical.length === 4) {
                ctx.fillText(friend, 144 * ratio, 96 * ratio);
            } else if (numArtical.length === 5) {
                ctx.fillText(friend, 154 * ratio, 96 * ratio);
            }

            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');
            ctx.fillText('分享', 100 * ratio, 116 * ratio);
            // 绘制双引号
            let yinHao = this.data.yinHao;
            ctx.drawImage(yinHao, 80 * ratio, 56 * ratio, 14 * ratio, 14 * ratio)

            // 绘制头像
            const imgPath = res[1];
            ctx.save()
            ctx.beginPath()
            ctx.arc(40 * ratio, 47 * ratio, 23 * ratio, 0, 2 * Math.PI)
            ctx.clip()
            ctx.drawImage(imgPath, 17 * ratio, 24 * ratio, 46 * ratio, 46 * ratio)
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
            yOffset = 40 * ratio;
            goodsTitleArray.forEach(function (value) {
                ctx.setFontSize(14 * ratio);
                ctx.setFillStyle('#666666');
                ctx.fillText(value, 80 * ratio, yOffset);
                yOffset += 25 * ratio;
            });
            // 绘制文章的标题和描述
            const describe = this.data.articalDescribe;
            let canvasDescribe

            //z绘制描述
            ctx.save();
            ctx.setFontSize(14 * ratio)
            ctx.setFillStyle('#666666');
            if (describe.length < parseInt(21 / ratio)) {
                canvasDescribe = describe;

                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);
            } else if (describe.length < parseInt(42 / ratio) && describe.length > parseInt(21 / ratio)) {
                canvasDescribe = describe.slice(0, parseInt(23 / ratio));
                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

                let canvasDescribe1 = describe.slice(parseInt(21 / ratio), describe.length);
                ctx.fillText(canvasDescribe1, 30 * ratio, 230 * ratio, 260 * ratio);

            } else {
                canvasDescribe = describe.slice(0, parseInt(21 / ratio));
                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

                let canvasDescribe2 = describe.slice(parseInt(21 / ratio), parseInt(42 / ratio)) + '...';
                ctx.fillText(canvasDescribe2, 30 * ratio, 230 * ratio, 260 * ratio);

            }
            ctx.restore()

            ctx.moveTo(30 * ratio, 260 * ratio)
            ctx.setStrokeStyle('#F0F0F0');
            ctx.lineTo(300 * ratio, 260 * ratio)
            ctx.stroke()
            //小程序二维码
            const code = res[2];
            ctx.drawImage(code, 20 * ratio, 270 * ratio, 96 * ratio, 96 * ratio)

            //绘制长按小程序
            let miniApp = '长按识别,进入小程序'
            ctx.setFontSize(14 * ratio)
            ctx.setFillStyle('#333333');
            ctx.fillText(miniApp, 130 * ratio, 300 * ratio, 220 * ratio);

            let miniAppShare = '分享来自'
            ctx.setFontSize(14 * ratio)
            ctx.setFillStyle('#333333');
            ctx.fillText(miniAppShare, 130 * ratio, 326 * ratio, 220 * ratio);
            ctx.font = 'normal bold 14px sans-serif';
            let appName = '「' + this.data.appName + '」';

            ctx.setFillStyle('#000');
            ctx.fillText(appName, 124 * ratio, 346 * ratio, 220 * ratio);


            const title = this.data.articalTitle;
            let canvasTtile
            if (title.length < parseInt(14 / ratio)) {
                canvasTtile = title;
            } else {
                canvasTtile = title.slice(0, parseInt(14 / ratio)) + '...'
            }
            ctx.font = 'normal bold sans-serif';
            ctx.setFontSize(18 * ratio)
            ctx.setFillStyle('#333333');

            ctx.fillText(canvasTtile, 30 * ratio, 180 * ratio, 260 * ratio);
            ctx.draw();

            //绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
            setTimeout(function () {
                wx.canvasToTempFilePath({
                    x: 0,
                    y: 0,
                    width: 320,
                    height: 370,
                    destWidth: 1280,
                    destHeight: 1480,
                    fileType: 'jpg',
                    quality: 1,
                    canvasId: 'shareCanvas',
                    success: function (res) {
                        that.setData({
                            shareImage: res.tempFilePath,
                            showSharePic: true
                        }, () => {
                            wx.saveImageToPhotosAlbum({
                                filePath: that.data.shareImage,
                                success: function () {
                                    console.log('保存成功')
                                },
                                fail: function () {
                                    console.log('保存失败')
                                }
                            })
                        })
                        wx.hideLoading();
                    },
                    fail: function (res) {
                        console.log(res)
                        wx.hideLoading();
                    }
                })
            }, 2000);
        })
    },

    handlePoster: function () {
        gdt.userInfo.then(() => {
            this.handleDrowPicture()
        }).catch(() => {
            gdt.once('userInfo', () => {
                this.handleDrowPicture()
            });
        })
    }, 
    handleSavePicture: function () {
        this.setData({ isShowPoster: false });
    }
})

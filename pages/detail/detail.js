let app = getApp().globalData;
const gdt = app.applicationDataContext;
import {formatSeconds} from '../../utils/util'
const innerAudioContext = app.backgroundAudioManager
Page({
    data: {
        appName: '',
        nodes: [],
        isShow: true,
        shareButton: '../../images/share.png',

        isRoot: false,

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
        yinHao: '/images/yinHao.png',

        entityId: undefined,
        entity: {},
        fullPicture: {},
        //推荐视频
        recommendations:[],
        videoSource:[],
        videoId:undefined,
        selectedCricle:0,
        isMuted:true,
         //音频的播放和暂停的开关
         isPlay:false,
         isChangeBig:false,
         currentTime:0,
         totalTime:0,
         currentProgress:0,
         totalProgress:0,
         clickIndex:0
    },

    //文章里面的视频是否静音
    handleIsMutedFromArtical:function(){
        this.setData({
            isMuted:!this.data.isMuted
        })
    },
    //点击切换文章里面的视频
    handleVideoTapFromArtical:function(e){
        let index = e.currentTarget.dataset.videoid;
        this.setData({
            videoId:this.data.videoSource[index],
            selectedCricle:index
        })
       
    },
    

    // 点击切换视频
    handleVideo:function(e){
        console.log(1111111)
        // this.setData({videoId:e.currentTarget.dataset.videoid,videoTitle:e.currentTarget.dataset.videotitle});
        let qPromise;
        const scene = gdt.showParam.scene;
        qPromise = gdt.fetchEntityDetail(e.currentTarget.dataset.id, {
            scene: scene,
            keepH5Links: true,
            mapSrc: 'data',
            overrideStyle: 'false',
            fixWxMagicSize: 'true'
        });
        qPromise.then((r) => {
            if (r.entity) {
                const currentTitle = r.entity.title;
                wx.setNavigationBarTitle({
                    title: currentTitle,
                });
            };
           
            this.setData({recommendations:r.recommendations, fullPicture: r, entityId: r.entity.id, entity: r.entity, nodes: [r.node], shareId: r.refId, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });

            gdt.track('detail-load', { itemId: r.entity._id, title: r.entity.title, refId: r.refId, viewId: r.viewId, type: r.entity.type});
        })
        
    },
    onShareAppMessage: function () {
        if (this.data.entityId) {
            gdt.trackShareItem(this.data.entityId, {
                pos: this.data.viewPercentage,
                view: this.data.viewId,
                tPlus: Date.now() - (this.data.enteredAt || 0) - this.data.suspendedFor
            });
            gdt.track('share-item', { itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });

        }
        return {
            title: this.data.entity.title || '默认转发标题',
            path: 'pages/detail/detail?ref=' + this.data.shareId + '&id=' + this.data.entityId + '&nickName=' + this.data.nickName + '&appName=' + this.data.appName
        }
    },

    onShow: function () {
        gdt.userInfo.then(() => {
            if (this.data.isEyes === false) {
                this.setData({ isEyes: true })
            }
        })
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
        gdt.track('show-detail', { itemId: this.data.entityId, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });
    },
    //授权的时候发生的
    handleAuthor: function (e) {

        if (e.detail && e.detail.userInfo) {
            gdt.emit('userInfo', e.detail);
        }

    },
    handleJump: function () {
        gdt.userInfo.then(() => {
            wx.navigateTo({
                url: '/pages/log/detail?nick=' + this.data.shareName
            })
            gdt.track('let-friend-know-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
        }).catch(() => {
            gdt.once('userInfo', () => {
                wx.navigateTo({
                    url: '/pages/log/detail?nick=' + this.data.shareName
                })
            });
            gdt.track('let-friend-know-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
        });

    },
    handleLikeButtonTapped: function (e) {
        gdt.userInfo.then(() => {
            this.setData({ isLike: !this.data.isLike }, () => {
                if (this.data.isLike) {
                    gdt.likeItem(this.data.entityId);
                    gdt.track('like-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
                } else {
                    gdt.unlikeItem(this.data.entityId);
                    gdt.track('unlike-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
                }
            });
        }).catch(() => {
            gdt.once('userInfo', () => {
                this.setData({ isLike: !this.data.isLike }, () => {
                    if (this.data.isLike) {
                        gdt.track('like-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
                        gdt.likeItem(this.data.entityId);
                    } else {
                        gdt.unlikeItem(this.data.entityId);
                        gdt.track('unlike-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
                    }
                });
            });
        });

    },
    onLoad(options) {
        if(options.listening == 'false'){
            this.setData({isPlay:false})
        }else{
            this.setData({isPlay:true})
        }
       this.setData({clickIndex:options.index})
       
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
        if (getCurrentPages()[0] === this) {
            this.setData({ isRoot: true });
        }
        let qPromise;
        let { id, nickName, ref, appName, refee } = options;
        const entityId = id;
        this.setData({ art: entityId, shareName: nickName, entityId: entityId, appName: appName });
        if (getCurrentPages()[0] === this) {
            this.setData({ isRoot: true });
        }
        gdt.userInfo.then((x) => {
            this.setData({
                isEyes: true
            });
        }).catch(() => {
            this.setData({
                isEyes: false
            });
        });
        if (id) {
            qPromise = gdt.fetchEntityDetail(entityId, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true',
                ref: ref,
                refee: refee
            });
        } else if (options.scene) {
            let referencers = (options.scene);
            qPromise = gdt.fetchEntityDetailByReferenceId(referencers, {
                scene: scene,
                keepH5Links: true,
                mapSrc: 'data',
                overrideStyle: 'false',
                fixWxMagicSize: 'true'
            });
        } else {
            throw new Error('No idea what to load');
        }
        
        qPromise.then((r) => {
            if (r.entity) {
                const currentTitle = r.entity.title;
                wx.setNavigationBarTitle({
                    title: currentTitle,
                });
            };
           if(r.entity.type=='wxArticle'){
                this.setData({videoId:r.entity.txvVids[0],videoSource: r.entity.txvVids})
           }

            this.setData({recommendations:r.recommendations || [], fullPicture: r, entityId: r.entity.id, entity: r.entity, nodes: [r.node], shareId: r.refId, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });

            gdt.track('detail-load', { itemId: r.entity._id, title: r.entity.title, refId: r.refId, viewId: r.viewId, type: r.entity.type});
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
        if (this.data.viewId && this.data.entityId) {
            gdt.trackLeftViewing(this.data.entityId, this.data.viewId, Date.now() - this.data.enteredAt - this.data.suspendedFor);
            gdt.track('detail-close', {
                itemId: this.data.entityId,
                type: this.data.entity.type,
                viewId: this.data.viewId,
                duration: Date.now() - this.data.enteredAt - this.data.suspendedFor
            });
        }
        var pages = getCurrentPages();
        var currPage = pages[pages.length - 1];  //当前选择好友页面
        var prevPage = pages[pages.length - 2]; //上一个编辑款项页面
        //直接调用上一个页面的setData()方法，把数据存到上一个页面即编辑款项页面中去  
        let that = this;
        prevPage.setData({  
            listenIndexCurrent: that.data.clickIndex ,
            listening:that.data.isPlay
        });
    },
    recordUserscroll: function (event) {
        if (event.detail.scrollTop < 0) {
            return
        }
        let num1 = event.detail.scrollTop;
        const scene = gdt.showParam.scene;
        if (num1 > this.data.num) {
            this.setData({ isShow: false });
            if (getCurrentPages()[0].route === 'pages/detail/detail') {
                this.setData({ isShare: false });
            }
            // if (scene == 1048 || scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049 || scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073) {
            //     this.setData({ isShare: false });
            // }

        } else {
            this.setData({ isShow: true });
            if (getCurrentPages()[0].route === 'pages/detail/detail') {
                this.setData({ isShare: true });
            }
            // if (scene == 1048 ||scene == 1007 || scene == 1008 || scene == 1012 || scene == 1049 || scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073) {
            //     this.setData({ isShare: true });
            // }

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
            if (this.data.viewId && this.data.entityId) {
                // gdt.trackScrollActionInViewing(
                //     this.data.articleId, 
                //     this.data.viewId,
                //     this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
                //     Date.now() - this.data.scrollStartedAt,
                //     (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
                //     this.data.viewPercentage
                // );
                gdt.track('detail-scroll', {
                    type: this.data.entity.type,
                    itemId: this.data.entityId,
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
        let artical = gdt.fetchEntityMeta(this.data.entityId);
        let downAvatar = gdt.downloadMyAvatar();
        let downCode = gdt.downloadWxaCode(320, 'pages/detail/detail', this.data.shareId, 'auto')
        Promise.all([artical, downAvatar, downCode]).then((res) => {
            let yOffset = 30 * ratio;
            //绘制标题背景
            const ctx = wx.createCanvasContext('shareCanvas');
            ctx.setFillStyle('#ffffff')
            ctx.fillRect(0, 0, 320 * ratio, 450 * ratio);

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
            // const numArtical = 672+ '';
            ctx.setFillStyle('#101010');
            ctx.fillText(numArtical, 150 * ratio, 96 * ratio);
            let type =''
            if(this.data.entity.type == 'wxArticle'){
                type = '阅读的'
            }else{
                type = '观看的'
            }

            const bigTitle = ('这是我在' + this.data.appName + '小程序')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');
            ctx.fillText(bigTitle, 100 * ratio, 74 * ratio);

            const bigTitleType = (type+'第')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');
            ctx.fillText(bigTitleType, 100 * ratio, 96 * ratio);

            const friend = ('篇已经有')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');

            const my = (' 个好友阅')
            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');

            const numFriend = res[0].readingMeta.referencers + '';
            // const numFriend = 280+ '';
            if (numArtical.length === 1) {
                ctx.fillText(friend, 164 * ratio, 96 * ratio);
                ctx.fillText(my, 238 * ratio, 96 * ratio);
                ctx.save();
                ctx.font = 'normal bold 18px sans-serif';
                if (numFriend.length === 1) {

                    ctx.fillText(numFriend, 225 * ratio, 96 * ratio);
                } else if (numFriend.length === 2 ) {

                    ctx.fillText(numFriend, 232 * ratio, 96 * ratio);
                } else if (numFriend.length === 3) {

                    ctx.fillText(numFriend, 233 * ratio, 96 * ratio);
                }
                ctx.restore()
            } else if (numArtical.length === 2) {
                ctx.fillText(friend, 174 * ratio, 96 * ratio);
                ctx.fillText(my, 248 * ratio, 96 * ratio);
                ctx.save();
                ctx.font = 'normal bold 18px sans-serif';
                if (numFriend.length === 1) {

                    ctx.fillText(numFriend, 225 * ratio, 96 * ratio);
                } else if (numFriend.length === 2 ) {

                    ctx.fillText(numFriend, 230 * ratio, 96 * ratio);
                } else if (numFriend.length === 3) {

                    ctx.fillText(numFriend, 245 * ratio, 96 * ratio);
                }
                ctx.restore()
            } else if (numArtical.length === 3) {
                ctx.fillText(friend, 184 * ratio, 96 * ratio);
                ctx.fillText(my, 255 * ratio, 96 * ratio);
                ctx.save();
                ctx.font = 'normal bold 18px sans-serif';
                if (numFriend.length === 1) {

                    ctx.fillText(numFriend, 235 * ratio, 96 * ratio);
                } else if (numFriend.length === 2 ) {

                    ctx.fillText(numFriend, 238 * ratio, 96 * ratio);
                } else if (numFriend.length === 3) {

                    ctx.fillText(numFriend, 232 * ratio, 96 * ratio);
                }
                ctx.restore()
            } else if (numArtical.length === 4) {
                ctx.fillText(friend, 194 * ratio, 96 * ratio);
                ctx.fillText(my, 268 * ratio, 96 * ratio);
                ctx.save();
                ctx.font = 'normal bold 18px sans-serif';
                if (numFriend.length === 1) {
    
                    ctx.fillText(numFriend, 250 * ratio, 96 * ratio);
                } else if (numFriend.length === 2 ) {
    
                    ctx.fillText(numFriend, 258 * ratio, 96 * ratio);
                } else if (numFriend.length === 3) {
    
                    ctx.fillText(numFriend, 265 * ratio, 96 * ratio);
                }
                ctx.restore()
            } else if (numArtical.length === 5) {
                ctx.fillText(friend, 204 * ratio, 96 * ratio);
                ctx.fillText(my, 278 * ratio, 96 * ratio);
                ctx.save();
                ctx.font = 'normal bold 18px sans-serif';
                if (numFriend.length === 1) {
    
                    ctx.fillText(numFriend, 264 * ratio, 96 * ratio);
                } else if (numFriend.length === 2 ) {
    
                    ctx.fillText(numFriend, 270* ratio, 96 * ratio);
                } else if (numFriend.length === 3) {
    
                    ctx.fillText(numFriend, 276 * ratio, 96 * ratio);
                }
                ctx.restore()
            }
            

            

            ctx.setFontSize(12 * ratio)
            ctx.setFillStyle('#101010');
            ctx.fillText('读了我的分享', 100 * ratio, 116 * ratio);
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
            const describe = this.data.entity.bref || '哎呀！这篇文章没摘要，扫码查看文章详情吧～';
            let canvasDescribe

            //z绘制描述
            ctx.save();
            ctx.setFontSize(14 * ratio)
            ctx.setFillStyle('#666666');
            if (describe.length < parseInt(19 / ratio)) {
                canvasDescribe = describe;

                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);
            } else if (describe.length < parseInt(38 / ratio) && describe.length > parseInt(19 / ratio)) {
                canvasDescribe = describe.slice(0, parseInt(19 / ratio));
                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

                let canvasDescribe1 = describe.slice(parseInt(19 / ratio), describe.length);
                ctx.fillText(canvasDescribe1, 30 * ratio, 230 * ratio, 260 * ratio);

            } else {
                canvasDescribe = describe.slice(0, parseInt(19 / ratio));
                ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

                let canvasDescribe2 = describe.slice(parseInt(19 / ratio), parseInt(38 / ratio)) + '...';
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


            const title = this.data.entity.title;
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
    },
    //播放
    play:function(){
        let that = this;
        const voiceId = (this.data.entity.wxmpVoiceIds || [])[0];
        innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid='+voiceId;
        innerAudioContext.play();
        this.setData({isPlay:true});
        gdt.track('play-article-voice-on-detail-page', {
            voiceId: voiceId,
            itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId
        });
    },
    pause:function(){
        innerAudioContext.pause();
        this.setData({isPlay:false});
        gdt.track('pause-article-voice-on-detail-page', {
            voiceId: voiceId,
            playedPercentage: (innerAudioContext.currentTime / innerAudioContext.duration) || 0,
            itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId
        });
    }
    // handlePlayVideo:function(){
    //     let that = this;
        
    //     innerAudioContext.autoplay = true;
    //     innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid='+this.data.entity.wxmpVoiceIds[0];
    //     console.log('开始播放')
       
    //     innerAudioContext.onPlay((e)=>{
           
    //     })
    //     this.setData({isPlay:true})
       
    //     innerAudioContext.play();
    //     // 时间的当前的进度;
        
    //     innerAudioContext.onTimeUpdate(()=>{
    //         that.setData({
    //             currentTime:parseInt(innerAudioContext.currentTime),
    //             totalTime:parseInt(innerAudioContext.duration),
    //             currentProgress:formatSeconds(parseInt(innerAudioContext.currentTime)),
    //             totalProgress:formatSeconds(parseInt(innerAudioContext.duration))
    //         })
    //     })
    //     //进度条的隐藏 和显示
    //     this.setData({isChangeBig:!this.data.isChangeBig})
       
    // },
    // handlePauseVideo:function(){
    //     console.log('暂停');
        
    //     innerAudioContext.pause();
    //     this.setData({isPlay:false})
    //     // this.setData({isChangeBig:!this.data.isChangeBig})
    // },
    // handleShink:function(){
    //     this.setData({isChangeBig:!this.data.isChangeBig})
    // },
    // handlePauseVideoNow:function(){
        
    //     this.setData({isPlay:false})
    //     innerAudioContext.pause();
    // },
    // handlePlayVideoNow:function(){

    //     this.setData({isPlay:true})
    //     innerAudioContext.play();
    // },
    // //拖动过程中的一些处理
    // handleChanging:function(e){
    //     let that = this;
    //     this.setData({
    //         currentTime:e.detail.value,
    //         currentProgress:formatSeconds(parseInt(e.detail.value)),
    //     })
    //     innerAudioContext.seek(e.detail.value);
    //     innerAudioContext.onTimeUpdate(()=>{
    //         that.setData({
    //             currentTime:parseInt(innerAudioContext.currentTime),
    //             totalTime:parseInt(innerAudioContext.duration),
    //             currentProgress:formatSeconds(parseInt(innerAudioContext.currentTime)),
    //             totalProgress:formatSeconds(parseInt(innerAudioContext.duration))
    //         })
    //     })
       
    // }

})

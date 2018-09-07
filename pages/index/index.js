let app = getApp().globalData;
const util = require('../../utils/util');

Page({
    data: {
        appTitle: '小鱼聚合',
        dataTab: [],
        shareList: [],
        likeList: [],
        list: [],
        heightFlag: true,
        userInfo: {},
        shareAfter: '../../images/shareAfter.png',
        shareBefore: "../../images/shareBefore.png",
        likeAfter: "../../images/likeAfter.png",
        likeBefore: "../../images/likeBefore.png",
        imgCry:'../../images/cry.png',
        flag: true,
        templateFlag: true,
        colorTitle: 0,
        shinIndex: 999999,
        //屏幕的宽度
        screenWidth: '',
        screenHeight: '',
        endWidth: '',
        startsWidth: '',
        isMore: true,
        page:1,
        allPages:'',
        pageSize:20,
        num:{},
        scrollTop:1,
        windowHeight:'',
        isLoading:false,
        // upLoad:true,
        // toView:'',
        scrollLeft:0,

    },
    //获取阅读量
    handleRead:function(){
        let that = this;
        wx.showLoading({title:'加载中'})
        this.getData('/my/readCount','GET').then((res)=>{
            if(res.data.code == 200){
                if(Object.keys(res.data.data).length>0){
                    that.setData({num:res.data.data},()=>{
                        wx.hideLoading();
                    })
                }
            }
        })
    },
    //获取分享的数量
    handleShare:function(page,pageSize){
        let that = this;
        wx.showLoading({title:'加载中'})
        this.getData('/my/shares?page='+page+'&pageSize='+pageSize,'GET').then((res)=>{
            if(res.data.code == 200){
                if(res.data.data.length == 0){
                    that.handleSuccessMore(res);
                    wx.hideLoading();
                }else {
                    let arr = res.data.data.map((item) => {
                        item.sourceWxNickname = item.sourceWxNickname || '-'
                        item.readTimes = item.readTimes || '0'
                        item.time = util.moment(item.publishedAt).fromNow()
                        return item
                    })
                    let hash = {};
                    let repeatArr =  that.data.shareList.concat(arr)
                    let newArr = repeatArr.reduce(function(item, next) {
                        hash[next.articleId] ? '' : hash[next.articleId] = true && item.push(next);
                        return item
                    }, [])
                    that.setData({shareList:newArr},()=>{
                        if(that.data.page == 1){
                            wx.stopPullDownRefresh()
                        }
                        wx.hideLoading();
                    })
                }
            }
        })
    },
    //获取喜欢的数量
    handleLike:function(page,pageSize){
        let that = this;
        wx.showLoading({title:'加载中'})
        this.getData('/my/likes?page='+page+'&pageSize='+pageSize,'GET').then((res)=>{
            if(res.data.code == 200){
                if(res.data.data.length == 0){
                    that.handleSuccessMore(res);
                    wx.hideLoading();
                }else {
                    let arr = res.data.data.map((item) => {
                        item.article.sourceWxNickname = item.article.sourceWxNickname || '-'
                        item.readTimes = item.readTimes || '0'
                        item.time = util.moment(item.publishedAt).fromNow()
                        return item
                    })
                    let hash = {};
                    let repeatArr =  that.data.likeList.concat(arr)
                    let newArr = repeatArr.reduce(function(item, next) {
                        hash[next.articleId] ? '' : hash[next.articleId] = true && item.push(next);
                        return item
                    }, [])
                    that.setData({likeList:newArr},()=>{
                        if(that.data.page == 1){
                            wx.stopPullDownRefresh()
                        }
                        wx.hideLoading();

                    })
                }
            }
        })
    },
    //获取列表的页面
    handleList:function(id,page,pageSize){
        let that = this;
            wx.showLoading({title:'加载中'});
            this.setData({isLoading:true})
            let urlS = '/list/' + id + '/articles?page='+page+'&pageSize=' +pageSize;
            this.getData(urlS, 'GET').then((res) => {
                if (res.data.code == 200) {
                    if(res.data.data.length == 0){
                        that.setData({isMore:false,isLoading:false})
                        that.handleSuccessMore(res);
                        wx.hideLoading();
                    }else{
                        let arr =res.data.data.map((item)=>{
                            item.sourceWxNickname =item.sourceWxNickname ||'-'
                            item.time = util.moment(item.publishedAt).fromNow()
                            return item
                        })
                        let hash = {};
                        let repeatArr =  that.data.list.concat(arr)
                        let newArr = repeatArr.reduce(function(item, next) {
                            hash[next.id] ? '' : hash[next.id] = true && item.push(next);
                            return item
                        }, [])
                        that.setData({list:newArr},()=>{
                            if(that.data.page == 1){
                                // that.setData({upLoad:false});
                                wx.stopPullDownRefresh()
                            }
                            wx.hideLoading();
                            that.setData({isLoading:false});
                        })
                    }
                }
            })
    },

    onShow:function(){
        let that = this;
        wx.showShareMenu({withShareTicket: true})
        if (that.data.colorTitle == that.data.dataTab.length) {
            app.tokenPromise.then(function (sessionToken) {
                that.handleRead()
            })
        }
    },
    onLoad: function () {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
            that.setData({windowHeight:res.windowHeight});
                let model = res.model;
                let arr = model.split(' ');
                arr.pop()
                let c  =arr.join(' ');
                if(model == 'iPhone X'|| c=='iPhone X'){

                    that.setData({iPhoneX: true})
                }else {
                    that.setData({iPhoneX: false })
                }
                if (model == 'iPhone X'|| c=='iPhone X') {
                    that.setData({isIphoneX: true})
                }else {that.setData({isIphoneX: false })}
            }})
        //文章列表
        that.getData('', 'GET', ).then((res) => {
            const r = res.data.data;
            if (res.data.code == 200) {
                that.setData({ appTitle: r.title, dataTab: r.lists }, () => {
                    that.handleList(r.lists[0].id,1,20)
                })
            }
        })

        app.tokenPromise.then(function (sessionToken) {
            if (app.sessionToken !='') {
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.setData({userInfo: res.data});
                        //我的分享
                        that.handleShare(1,20)
                        //我的喜欢
                        that.handleLike(1,20)
                        //我的数量
                        that.handleRead()
                    }
                })

                //获取屏幕的宽度
                wx.getSystemInfo({
                    success: function (res) {
                        that.setData({screenWidth: res.screenWidth, screenHeight: res.screenHeight})
                    }
                });
            }
        });
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
    bindGetUserInfo: function (e) {
        wx.setStorage({
            key: "userInfo",
            data: e.detail.userInfo
        })
        this.setData({userInfo: e.detail.userInfo});
        wx.request({
            method: 'POST',
            url: app.baseUrl + app.distroId + '/my/profile',
            data: {
                encryptedData: e.detail.encryptedData,
                iv: e.detail.iv
            },
            header: {
                'X-Session-Token': app.sessionToken
            },
            success: function (res) {
            }
        })
    },
    handleTab(e) {
        let that = this;
        if (e.currentTarget.dataset.name == 'share') {
            this.setData({flag: true},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.handleShare(1,20)
                    }
                })

            })
        } else {
            this.setData({flag: false},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.handleLike(1,20);
                    }
                })

            })
        }
    },
    handleShrink(e) {
        this.setData({shinIndex: e.currentTarget.dataset.id, heightFlag: !this.data.heightFlag})
    },
    handleTitleTab(e) {
        this.setData({
            scrollTop: this.data.scrollTop = 0
        });
        let that = this;
        that.setData({isMore: true,page:1})
        if (e.currentTarget.dataset.tab == this.data.dataTab.length) {
            this.setData({templateFlag: false, colorTitle: e.currentTarget.dataset.tab},()=>{
                //我的数量
                that.handleRead()
            })
        }
        else {
            this.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab,list:[]},()=>{
                wx.showLoading({title:'加载中'})
                that.getData('/list/'+ e.currentTarget.dataset.tabid+'/articles?page=1&pageSize=20','GET').then((res)=>{
                    if(res.data.code == 200){
                        let arr =res.data.data.map((item)=>{
                            item.sourceWxNickname =item.sourceWxNickname ||'-'
                            item.readTimes =item.readTimes ||'0'
                            item.time = util.moment(item.publishedAt).fromNow()
                            return item
                        })
                        that.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab,list:arr},()=>{
                            wx.hideLoading();
                        })
                    }
                });

            })

        }
    },
    //跳转到详情
    handleDetail(e) {
        wx.navigateTo({
            url: '/pages/detail/detail?id='+e.currentTarget.dataset.id
        })
    },
    handleTouchEnd(e) {
        let that = this;
        this.setData({endWidth: e.changedTouches[0].clientX},()=>{
            if (that.data.startsWidth >= that.data.screenWidth / 2) {
                if (that.data.startsWidth - that.data.endWidth >= that.data.screenWidth / 4) {
                    that.setData({templateFlag: true, colorTitle: ++that.data.colorTitle,isMore: true,list:[]},()=>{
                        wx.showLoading({title:'加载中'})
                        that.getData('/list/'+ this.data.dataTab[that.data.colorTitle].id+'/articles?page=1&pageSize=20','GET').then((res)=>{
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.time = util.moment(item.publishedAt).fromNow()
                                return item
                            })
                            that.setData({list:arr})
                            that.setData({
                                scrollTop: that.data.scrollTop = 0,
                                scrollLeft:that.data.scrollLeft+50,
                            });
                            wx.hideLoading();
                        })
                    });

                    if (that.data.colorTitle > that.data.dataTab.length) {
                        that.setData({templateFlag: true, colorTitle: 0})
                        that.setData({
                            scrollLeft:that.data.scrollLeft=-100,
                        });
                    } else if (that.data.colorTitle == that.data.dataTab.length) {
                        that.setData({templateFlag: false, colorTitle: that.data.dataTab.length})
                        that.setData({
                            scrollLeft:that.data.scrollLeft+50,
                        });
                    }
                }
            } else {
                //console.log(this.data.startsWidth-this.data.endWidth)
                if (that.data.endWidth - that.data.startsWidth >= that.data.screenWidth / 4) {
                    that.setData({templateFlag: true, colorTitle: --that.data.colorTitle,list:[]},()=> {
                        wx.showLoading({title:'加载中'})
                        that.getData('/list/' + this.data.dataTab[this.data.colorTitle].id + '/articles?page='+that.data.page+'&pageSize='+that.data.pageSize,'GET').then((res)=>{
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.time = util.moment(item.publishedAt).fromNow()
                                return item
                            })
                            that.setData({list:arr})
                            wx.hideLoading();
                            that.setData({
                                scrollTop: that.data.scrollTop = 0,
                                scrollLeft:that.data.scrollLeft-50,
                            });
                        })
                    })
                    if (that.data.colorTitle > that.data.dataTab.length) {
                        that.setData({templateFlag: true, colorTitle: 0,scrollLeft:that.data.scrollLeft=0});
                        wx.hideLoading();
                    } else if (that.data.colorTitle < 0) {
                        that.setData({templateFlag: false, colorTitle: that.data.dataTab.length})

                        that.setData({
                            scrollLeft:that.data.scrollLeft=50*that.data.dataTab.length,
                        },()=>{
                            wx.hideLoading();
                        });
                    }
                }
            }
        })
    },
    handleTouchStart(e) {
        this.setData({startsWidth: e.changedTouches[0].clientX})
    },

    onReachBottom(){
        if (this.data.isLoading) { // 防止数据还没回来再次触发加载
            return;
        }
        let that = this;
        if(this.data.colorTitle != this.data.dataTab.length){
            if(this.data.isMore){
                this.handleList(this.data.dataTab[this.data.colorTitle].id,++that.data.page,this.data.pageSize)
            }else {
                this.setData({isMore:false})
                wx.hideLoading();
            }
        }else{
            if(this.data.flag){
                this.handleShare(++that.data.page,that.data.pageSize)
            }else{
                this.handleLike(++that.data.page,that.data.pageSize)
            }
        }

    },
    onPullDownRefresh() {
        if (this.data.colorTitle != this.data.dataTab.length  ) {
            // this.setData({upLoad:true});
            this.handleList(this.data.dataTab[this.data.colorTitle].id,1,20)
        }else {
            if(this.data.flag){
                this.handleShare(1,this.data.pageSize)
            }else{
                this.handleLike(1,this.data.pageSize)
            }
        }
    },
    handleSuccessMore(res) {
        if (res.data.data.length == 0) {
            this.setData({isMore: false})
        } else {
            this.setData({isMore: true})
        }
    }

})

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
        pageSize:10,
        num:{},
        scroll:0

    },
    onShow:function(){
        let that = this;
        app.tokenPromise.then(function (sessionToken) {
            that.getData('/my/readCount','GET').then((res)=>{
                if(res.data.code == 200){
                    if(Object.keys(res.data.data).length>0){
                        that.setData({num:res.data.data})
                    }else {

                    }
                }
            })
        })

    },
    onLoad: function () {
        console.log(util.moment.locale());
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                let model = res.model;
                let arr = model.split(' ');
                arr.pop()
                let c  =arr.join(' ');

                console.log(arr)
                if(model == 'iPhone X'|| c=='iPhone X'){

                    that.setData({iPhoneX: true})
                }else {
                    that.setData({iPhoneX: false })
                }
                if (model == 'iPhone X'|| c=='iPhone X') {
                    that.setData({isIphoneX: true})
                }else {that.setData({isIphoneX: false })}
            }})
        wx.showShareMenu({
            withShareTicket: true
        })
        
      that.getData('', 'GET', ).then((res) => {
        const r = res.data.data;
        if (res.data.code == 200) {
          that.setData({ appTitle: r.title, dataTab: r.lists }, () => {
            let urlS = '/list/' + r.lists[0].id + '/articles?page=1&pageSize=' + that.data.pageSize;
            that.getData(urlS, 'GET').then((res) => {
              if (res.data.code == 200) {
                let arr = res.data.data.map((item) => {
                  item.sourceWxNickname = item.sourceWxNickname || '-'
                  item.time = util.moment(item.publishedAt).fromNow()
                  return item
                })
                that.setData({ list: arr })
              }
            })
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
                        that.getData('/my/shares?page=1&pageSize=10','GET').then((res)=>{
                            if(res.data.code == 200){
                                let arr =res.data.data.map((item)=>{
                                    item.sourceWxNickname =item.sourceWxNickname ||'-'
                                    item.readTimes =item.readTimes ||'0'
                                    item.time = util.moment(item.publishedAt).fromNow()
                                    return item
                                })
                                that.setData({shareList: arr })
                            }
                        })
                        //我的喜欢
                        that.getData('/my/likes?page=1&pageSize=10','GET').then((res)=>{
                            if(res.data.code == 200){
                                let arr =res.data.data.map((item)=>{
                                    item.article.sourceWxNickname =item.article.sourceWxNickname ||'-'
                                    item.readTimes =item.readTimes ||'0'
                                    item.time = util.moment(item.publishedAt).fromNow()
                                    return item
                                })
                                that.setData({likeList: arr})
                            }
                        })
                        //我的数量
                        that.getData('/my/readCount','GET').then((res)=>{
                            if(res.data.code == 200){
                                if(Object.keys(res.data.data).length>0){
                                    that.setData({num:res.data.data})
                                }else {

                                }
                            }
                        })
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
                console.log(res)
            }
        })
    },
    handleTab(e) {
        let that = this;
        //我的数量
        if (e.currentTarget.dataset.name == 'share') {
            this.setData({flag: true},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.getData('/my/shares?page=1&pageSize='+that.data.pageSize,'GET').then((res)=>{
                            if(res.data.code == 200){
                                let arr =res.data.data.map((item)=>{
                                    item.sourceWxNickname =item.sourceWxNickname ||'-'
                                    item.readTimes =item.readTimes ||'0'
                                    item.time = util.moment(item.publishedAt).fromNow()
                                    return item
                                })
                                that.setData({shareList: arr },()=>{
                                    console.log(that.data.shareList)
                                })
                            }
                        });
                    }
                })

            })
        } else {
            this.setData({flag: false},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.getData('/my/likes?page=1&pageSize='+that.data.pageSize,'GET').then((res)=>{
                            if(res.data.code == 200){
                                let arr =res.data.data.map((item)=>{
                                    item.sourceWxNickname =item.sourceWxNickname ||'-'
                                    item.readTimes =item.readTimes ||'0'
                                    item.time = util.moment(item.publishedAt).fromNow()
                                    return item
                                })
                                that.setData({likeList: arr})
                            }
                        });
                    }
                })

            })
        }
    },
    handleShrink(e) {
        this.setData({shinIndex: e.currentTarget.dataset.id, heightFlag: !this.data.heightFlag})
    },
    handleTitleTab(e) {
        let that = this;
        that.setData({scroll:10})
        if (e.currentTarget.dataset.tab == this.data.dataTab.length) {
            this.setData({templateFlag: false, colorTitle: e.currentTarget.dataset.tab},()=>{
                //我的数量
                that.getData('/my/readCount','GET').then((res)=>{
                    if(res.data.code == 200){
                        if(Object.keys(res.data.data).length>0){
                            that.setData({num:res.data.data})
                        }else {

                        }
                    }
                })
            })
        }
        else {
            this.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab})
            wx.showLoading({title:'加载中'});
            that.getData('/list/'+ e.currentTarget.dataset.tabid+'/articles','GET').then((res)=>{
                if(res.data.code == 200){
                    let arr =res.data.data.map((item)=>{
                        item.sourceWxNickname =item.sourceWxNickname ||'-'
                        item.readTimes =item.readTimes ||'0'
                        item.time = util.moment(item.publishedAt).fromNow()
                        return item
                    })
                    that.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab,list:res.data.data},()=>{
                        wx.hideLoading();
                    })
                }
            });

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
        this.setData({endWidth: e.changedTouches[0].clientX})
        if (this.data.startsWidth >= this.data.screenWidth / 2) {
            if (this.data.startsWidth - this.data.endWidth >= this.data.screenWidth / 4) {
                this.setData({templateFlag: true, colorTitle: ++this.data.colorTitle},()=>{
                    that.getData('/list/'+ this.data.dataTab[this.data.colorTitle].id+'/articles','GET').then((res)=>{
                        that.setData({list:res.data.data})
                    })
                });

                if (this.data.colorTitle > this.data.dataTab.length) {
                    this.setData({templateFlag: true, colorTitle: 0})
                } else if (this.data.colorTitle == this.data.dataTab.length) {
                    this.setData({templateFlag: false, colorTitle: this.data.dataTab.length})
                }
            }
        } else {
            //console.log(this.data.startsWidth-this.data.endWidth)
            if (this.data.endWidth - this.data.startsWidth >= this.data.screenWidth / 4) {
                this.setData({templateFlag: true, colorTitle: --this.data.colorTitle},()=> {
                    that.getData('/list/' + this.data.dataTab[this.data.colorTitle].id + '/articles?page='+that.data.page+'&pageSize='+that.data.pageSize,'GET').then((res)=>{
                        that.setData({list:res.data.data})
                    })
                })
                if (this.data.colorTitle > this.data.dataTab.length) {
                    this.setData({templateFlag: true, colorTitle: 0})
                } else if (this.data.colorTitle < 0) {
                    this.setData({templateFlag: false, colorTitle: this.data.dataTab.length})
                }
            }
        }

    },
    handleTouchStart(e) {
        this.setData({startsWidth: e.changedTouches[0].clientX})
    },

    handleTouchBottom(e) {
        let that = this;
        if(this.data.colorTitle != this.data.dataTab.length){
            if(this.data.isMore){
                wx.showLoading({title:'加载中'})
                that.getData('/list/' + this.data.dataTab[this.data.colorTitle].id + '/articles?page='+(++this.data.page)+'&pageSize='+this.data.pageSize,'GET').then((res)=>{
                    if(res.data.code == 200){
                        if(res.data.data.length == 0){
                            that.handleSuccessMore(res)
                        }else{
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.time = util.moment(item.publishedAt).fromNow()
                                that.data.list.push(item)
                                return item
                            })
                            that.setData({list: that.data.list.concat(arr) },()=>{
                                wx.hideLoading();
                            })
                        }
                    }
                })
            }else {
                wx.hideLoading();
            }

        }else{
            if(this.data.flag){
                wx.showLoading({title:'加载中'})
                that.getData('/my/shares?page='+(++that.data.page)+'&pageSize='+that.data.pageSize,'GET').then((res)=>{
                    if(res.data.code == 200){
                        let arr =res.data.data.map((item)=>{
                            item.sourceWxNickname =item.sourceWxNickname ||'-'
                            item.readTimes =item.readTimes ||'0'
                            item.time = util.moment(item.publishedAt).fromNow()
                            return item
                        })
                        that.setData({shareList: that.data.shareList.concat(arr) },()=>{
                            wx.hideLoading();
                        })
                    }
                })
            }else{
                wx.showLoading({title:'加载中'})
                that.getData('/my/likes?page='+(++that.data.page)+'&pageSize='+that.data.pageSize,'GET').then((res)=>{
                    if(res.data.code == 200){
                        let arr =res.data.data.map((item)=>{
                            item.sourceWxNickname =item.sourceWxNickname ||'-'
                            item.readTimes =item.readTimes ||'0'
                            item.time = util.moment(item.publishedAt).fromNow()
                            return item
                        })
                        that.setData({likeList: that.data.likeList.concat(arr)},()=>{
                            wx.hideLoading();
                        })
                    }

                })
            }
        }

    },
    handleTouchTop:function () {
        // console.log(1111111111)
        if (this.data.colorTitle != this.data.dataTab.length  ) {
                var that = this;
                wx.showLoading({title:'加载中'})
                that.getData('/list/' + this.data.dataTab[this.data.colorTitle].id+ '/articles?page=1&pageSize='+that.data.pageSize,'GET').then((res)=>{
                    if(res.data.code == 200){
                        if(res.data.data.length == 0){
                            that.handleSuccessMore(res)
                        }else {
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time =util.moment(item.publishedAt).fromNow()
                                return item
                            })
                                that.setData({list: arr},()=>{
                                    wx.hideLoading();
                                })
                        }
                    }

                })
        }

    },
    handleScroll:function(e){
        
    },
    handleSuccessMore(res) {
        if (res.data.data.length == 0) {
            this.setData({isMore: false})
        } else {
            this.setData({isMore: true})
        }
    }

})

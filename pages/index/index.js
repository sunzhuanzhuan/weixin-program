let app = getApp().globalData;
const util = require('../../utils/util');
Page({
    data: {
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
        loadMore:false,
        topLine:false,
        num:{},
        scroll:0

    },
    onLoad: function () {
        let that = this;
        app.tokenPromise.then(function (sessionToken) {
            if (app.sessionToken !='') {
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.setData({userInfo: res.data})
                    }
                })
                wx.request({
                    url: app.baseUrl + app.distroId + '/lists',
                    method: 'GET',
                    header: {
                        'X-Session-Token': sessionToken
                    },
                    success: function (res) {
                        if(res.data.code == 200){
                            that.setData({dataTab: res.data.data},()=>{
                                wx.request({
                                    url: app.baseUrl + app.distroId + '/list/' +res.data.data[0].id+ '/articles?page='+that.data.page+'&pageSize='+that.data.pageSize,
                                    method: 'GET',
                                    header: {
                                        'X-Session-Token': sessionToken
                                    },
                                    success: function (res) {
                                        if(res.data.code == 200){
                                            let arr =res.data.data.map((item)=>{
                                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                                return item
                                            })
                                            that.setData({list: arr })
                                        }

                                    }
                                });
                            })
                        }

                    }
                });
                //我的分享
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/shares?page='+that.data.page+'&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': sessionToken
                    },
                    success:function (res) {
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({shareList: arr })
                        }

                    }
                });
                //我的喜欢
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/likes?page='+that.data.page+'&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': sessionToken
                    },
                    success:function (res) {
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({likeList: arr})
                        }

                    }
                });
                //我的数量
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/readCount',
                    method: 'GET',
                    header: {
                        'X-Session-Token': sessionToken
                    },
                    success:function (res) {
                        if(Object.keys(res.data.data).length>0){
                            that.setData({num:res.data.data})
                        }else {

                        }

                    }
                });
                //获取屏幕的宽度
                wx.getSystemInfo({
                    success: function (res) {
                        that.setData({screenWidth: res.screenWidth, screenHeight: res.screenHeight})
                    }
                });
            }
        });


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
        if (e.currentTarget.dataset.name == 'share') {
            this.setData({flag: true},()=>{
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/shares?page=1&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    success:function (res) {
                        console.log(res.data.code);
                        console.log(res.data.data)
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({shareList: arr },()=>{
                                console.log(that.data.shareList)
                            })
                        }

                    }
                });
            })
        } else {
            this.setData({flag: false},()=>{
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/likes?page=1&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    success:function (res) {
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({likeList: arr})
                        }

                    }
                });
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

            this.setData({templateFlag: false, colorTitle: e.currentTarget.dataset.tab})
        }
        else {

            this.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab})
            wx.showLoading({title:'加载中'})
            wx.request({
                url: app.baseUrl + app.distroId +'/list/'+ e.currentTarget.dataset.tabid+'/articles',
                method: 'GET',
                header: {
                    'X-Session-Token': app.sessionToken
                },
                success: function (res) {
                    that.setData({templateFlag: true, colorTitle: e.currentTarget.dataset.tab,list:res.data.data},()=>{
                        wx.hideLoading();
                    })
                }
            });

        }
    },
    //跳转到详情
    handleDetail(e) {
        // console.log()
        wx.navigateTo({
            url: '/pages/detail/detail?id='+e.currentTarget.dataset.id
        })
    },
    handleTouchEnd(e) {
        let that = this;
        this.setData({endWidth: e.changedTouches[0].clientX})
        if (this.data.startsWidth >= this.data.screenWidth / 2) {
            if (this.data.startsWidth - this.data.endWidth >= this.data.screenWidth / 2) {
                this.setData({templateFlag: true, colorTitle: ++this.data.colorTitle},()=>{
                    wx.request({
                        url: app.baseUrl + app.distroId +'/list/'+ this.data.dataTab[this.data.colorTitle].id+'/articles',
                        method: 'GET',
                        header: {
                            'X-Session-Token': app.sessionToken
                        },
                        success: function (res) {
                            that.setData({list:res.data.data})
                        }
                    });
                });

                if (this.data.colorTitle > this.data.dataTab.length) {
                    this.setData({templateFlag: true, colorTitle: 0})
                } else if (this.data.colorTitle == this.data.dataTab.length) {
                    this.setData({templateFlag: false, colorTitle: this.data.dataTab.length})
                }
            }
        } else {
            //console.log(this.data.startsWidth-this.data.endWidth)
            if (this.data.endWidth - this.data.startsWidth >= this.data.screenWidth / 2) {
                this.setData({templateFlag: true, colorTitle: --this.data.colorTitle},()=> {
                    wx.request({
                        url: app.baseUrl + app.distroId + '/list/' + this.data.dataTab[this.data.colorTitle].id + '/articles?page='+that.data.page+'&pageSize='+that.data.pageSize,
                        method: 'GET',
                        header: {
                            'X-Session-Token': app.sessionToken
                        },
                        success: function (res) {
                            that.setData({list: res.data.data})
                        }
                    });
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
            wx.showLoading({title:'加载中'})
            wx.request({
                url: app.baseUrl + app.distroId + '/list/' + this.data.dataTab[this.data.colorTitle].id + '/articles?page='+(++this.data.page)+'&pageSize='+this.data.pageSize,
                method: 'GET',
                header: {
                    'X-Session-Token': app.sessionToken
                },
                success: function (res) {
                    if(res.data.data.length ==0){
                        that.setData({hsaMore: false})

                    }else{
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                that.data.list.push(item)
                                return item
                            })
                            that.setData({list: that.data.list.concat(arr) },()=>{
                                wx.hideLoading();
                            })
                        }
                        setTimeout(function () {
                            that.setData({hsaMore: true})
                        },1000)
                        }



                }
            });
        }else{
            if(this.data.flag){
                wx.showLoading({title:'加载中'})
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/shares?page='+(++that.data.page)+'&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    success:function (res) {
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({shareList: that.data.shareList.concat(arr) },()=>{
                                wx.hideLoading();
                            })
                        }
                    }
                });
            }else{
                wx.showLoading({title:'加载中'})
                wx.request({
                    url: app.baseUrl + app.distroId + '/my/likes?page='+(++that.data.page)+'&pageSize='+that.data.pageSize,
                    method: 'GET',
                    header: {
                        'X-Session-Token': app.sessionToken
                    },
                    success:function (res) {
                        if(res.data.code == 200){
                            let arr =res.data.data.map((item)=>{
                                item.sourceWxNickname =item.sourceWxNickname ||'-'
                                item.readTimes =item.readTimes ||'0'
                                item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                                return item
                            })
                            that.setData({likeList: that.data.likeList.concat(arr)},()=>{
                                wx.hideLoading();
                            })
                        }

                    }
                });
            }
        }

    },
    handleTouchTop:function () {
        if (this.data.colorTitle != this.data.dataTab.length) {
            var that = this;
            this.setData({loadMore:true })
            wx.request({
                url: app.baseUrl + app.distroId + '/list/' + this.data.dataTab[this.data.colorTitle].id+ '/articles?page=1&pageSize='+that.data.pageSize,
                method: 'GET',
                header: {
                    'X-Session-Token': app.sessionToken
                },
                success: function (res) {
                    let arr =res.data.data.map((item)=>{
                        item.sourceWxNickname =item.sourceWxNickname ||'-'
                        item.readTimes =item.readTimes ||'0'
                        item.time = util.moment(item.publicAt).format('YYYY-MM-DD')
                        return item
                    })
                    that.setData({list: arr},()=>{
                        wx.hideLoading();
                    })
                }
            });
        }

    },
    handleScroll:function(e){
        if(e.detail.scrollTop>50 && this.data.colorTitle != this.data.dataTab.length){
            this.setData({topLine:true})
        }else {
            this.setData({topLine:false})
        }
    },
    handleSuccessMore(res) {
        this.setData({isMore: false})
        if (res.data.data.length == 0) {
            this.setData({hsaMore: false})
        } else {
            this.setData({hsaMore: true})
        }
    }

})

//logs.js
const util = require('../../utils/util.js')
let app = getApp().globalData;

Page({
  data: {
      userInfo: {},
      shareAfter: '../../images/shareAfter.png',
      shareBefore: "../../images/shareBefore.png",
      likeAfter: "../../images/likeAfter1.png",
      likeBefore: "../../images/likeBefore.png",
      imgCry:'../../images/cry.png',
      shareList: [],
      likeList: [],
      num:{},
      shinIndex: 999999,
      isMore: true,
      page:1,
      pageSize:20,
      preventAgainLoad:true,
      flag:true
  },
    onShow:function(){
      console.log()
      let that = this;
        wx.getStorage({
            key: 'userInfo',
            success: function (res) {
                that.setData({userInfo: res.data});
                that.handleRead();
                that.handleLike(1,20,app.articleId)
                that.handleShare(1,20)
            }
        })
    },
    handleShrink(e) {
        this.setData({shinIndex: e.currentTarget.dataset.id, heightFlag: !this.data.heightFlag})
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
        that.setData({preventAgainLoad:false})
        wx.showLoading({title:'加载中'})
        this.getData('/my/shares?page='+page+'&pageSize='+pageSize,'GET').then((res)=>{
            if(res.data.code == 200){
                that.setData({preventAgainLoad:true})
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
    handleLike:function(page,pageSize,articleId){
        let that = this;
        that.setData({preventAgainLoad:false})
        wx.showLoading({title:'加载中'})
        this.getData('/my/likes?page='+page+'&pageSize='+pageSize,'GET').then((res)=>{
            if(res.data.code == 200){
                that.setData({preventAgainLoad:true})
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
                    //县过滤掉从喜欢点到不喜欢的
                    let arrMap = that.data.likeList.filter((item)=>{
                        return item.article.id !=articleId
                    })
                    let repeatArr =  arrMap.concat(arr)
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
    handleTab(e) {
      console.log(12121)
        let that = this;
        if (e.currentTarget.dataset.name == 'share') {
            this.setData({flag: true,page:1},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.handleShare(1,20)
                    },
                    fail:function(){
                        wx.showToast({
                            title:'还没有授权登录呢！'
                        })
                    }
                })

            })
        } else {
            this.setData({flag: false,page:1},()=>{
                wx.getStorage({
                    key: 'userInfo',
                    success: function (res) {
                        that.handleLike(1,20);
                    },
                    fail:function(){
                        wx.showToast({
                            title:'还没有授权登录呢！'
                        })
                    }
                })

            })
        }
    },
    //授权登录传递给后台
    bindGetUserInfo: function (e) {
        wx.setStorage({
            key: "userInfo",
            data: e.detail.userInfo
        })
        this.setData({userInfo: e.detail.userInfo});
        this.handleRead();
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
    //跳转到详情
    handleDetail(e) {
        wx.navigateTo({
            url: '/pages/detail/detail?id='+e.currentTarget.dataset.id
        })
    },
    handleSuccessMore(res) {
        let that = this;
        if (res.data.data.length == 0) {
            this.setData({isMore: false})
        } else {
            this.setData({isMore: true})
        }
    },
    onReachBottom:function () {
        if(this.data.preventAgainLoad){
            if(this.data.flag){
                this.handleShare(++this.data.page,this.data.pageSize)
            }else {
                this.handleLike(++this.data.page,this.data.pageSize)
            }

        }

    }
})

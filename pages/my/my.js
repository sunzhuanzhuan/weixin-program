//logs.js
const util = require('../../utils/util.js')
let app = getApp().globalData;
const gdt = app.applicationDataContext;
Page({
    data: {
        myLikes: undefined,
        myShares: undefined,

        myLikesHasMore: undefined,
        mySharesHasMore: undefined,
  
        userInfo: undefined,
        shareAfter: '../../images/shareAfter.png',
        shareBefore: "../../images/shareBefore.png",
        likeAfter: "../../images/likeAfter1.png",
        likeBefore: "../../images/likeBefore.png",
        imgCry:'../../images/cry.png',
  
        num:{},
        shinIndex: 999999,
        
        currentTab: 'myShares'
    },
      onLoad: function() {
          this.appState = gdt.localState;
          this.setData({
              num: this.appState.dashboardAnalytics,
              myShares: this.appState.myShares,
              myLikes: this.appState.myLikes,
          });
          gdt.userInfo.then((x)=> {
              this.setData({userInfo: x.userInfo});
          });
          gdt.on('userInfo', (x)=> {
              this.setData({userInfo: x.userInfo});
          });
          gdt.on('dashboardAnalytics', (x)=> {
              this.setData({num: this.appState.dashboardAnalytics});
          });
          const makeMyLikes = ()=> {
              this.appState.myLikes.forEach((x)=> {
                  const articleBref = x.article;
                  if (!articleBref) {
                      return;
                  }
                  articleBref._sourceWxDisplayName = articleBref.sourceWxNickname || '-'
                  articleBref.readTimes = articleBref.readTimes || 0;
                  articleBref._publishedFromNow = util.moment(articleBref.publishedAt).fromNow();
              });
              this.setData({ myLikes: this.appState.myLikes, myLikesHasMore: this.appState.myLikes.__hasMore !== false });
          };
          gdt.on('sharedItems', ()=> {
              this.setData({ myShares: this.appState.myShares, mySharesHasMore: this.appState.myShares.__hasMore !== false });
          });
          gdt.on('shared', ()=> {
              this.setData({ myShares: this.appState.myShares, mySharesHasMore: this.appState.myShares.__hasMore !== false });
          });
          gdt.on('likedItems', makeMyLikes);
          gdt.on('liked', makeMyLikes);
          gdt.on('unliked', makeMyLikes);
          // gdt.magicMyLikedFirstLoad();
          gdt.magicMySharedFirstLoad();
          gdt.fetchDashboardAnalytics();
      },
      onShow:function(){
        this.appState = gdt.localState;
        this.setData({
            num: this.appState.dashboardAnalytics
        });
        gdt.track('show-my-dashboard');
      },
      handleShrink: function(e) {
          this.setData({shinIndex: e.currentTarget.dataset.id, heightFlag: !this.data.heightFlag})
      },
      handleTab: function(e) {
          if (e.currentTarget.dataset.name == 'myShares') {
              gdt.magicMySharedFirstLoad().then(()=> this.setData({ myShares: this.appState.myShares }));
              gdt.track('my-dashboard-show-share');
            } else {
              gdt.magicMyLikedFirstLoad().then(()=> this.setData({ myLikes: this.appState.myLikes }));
              gdt.track('my-dashboard-show-like');
            }
          this.setData({currentTab: e.currentTarget.dataset.name});
          
      },
      //授权登录传递给后台
      bindGetUserInfo: function(e) {
          gdt.emit('userInfo', e.detail);
      },
      //跳转到详情
      handleDetail: function(e) {
          wx.navigateTo({
              url: '/pages/detail/detail?id='+e.currentTarget.dataset.id
          });
      },
      onReachBottom: function () {
          if (this.data.currentTab === 'myShares') {
              gdt.magicMySharedLoadMore();
          } else {
              gdt.magicMyLikedLoadMore();
          }
      },
      onShareAppMessage: function({from, target, webViewUrl}) {
          const clip = target.dataset.clip;
          if (!(clip && clip.article)) {
              return;
          }
  
          const articleBref = clip.article;
          gdt.trackShareItem(articleBref._id);
          gdt.track('share-item', { itemId: clip.articleId, refId: clip._id });
        
          return {
              title: articleBref.title || '默认转发标题',
              path: `pages/detail/detail?ref=${clip._id}&art=${clip.articleId}&nickName=${this.data.userInfo.nickName}`,
              imageUrl: articleBref.coverUrl
          }
      },
      getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
        // console.log( e.detail.formId)
        // this.setData({
        // formId: e.detail.formId }) 
    }
  })
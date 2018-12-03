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
        shareAfter: '../../images/fenAfter.png',
        shareBefore: "../../images/fenBefore.png",
        likeAfter: "../../images/xinBefore.png",
        likeBefore: "../../images/xinAfter.png",
        imgCry:'../../images/cry.png',
  
        num:{},
        shinIndex: 999999,
        
        currentTab: 'myShares',
        isHome:false
    },
      onLoad: function() {
        if (getCurrentPages()[0] === this) {
            this.setData({ isHome: true });
        }
        wx.setNavigationBarTitle({
            title: '我的',
        });
          gdt.userInfo.then(()=> {
            gdt.setLocalStorage('dashboardTipShouldDisplay', false);
          }, ()=> {
            gdt.once('userInfo', ()=> {
                gdt.setLocalStorage('dashboardTipShouldDisplay', false);
            });
          });
          
          this.appState = gdt.localState;
          const scene = gdt.showParam.scene;
          if(scene == 1014 || scene == 1037 || scene == 1047 || scene == 1058 || scene == 1074 || scene == 1073){
            this.setData({isHome:true})
          }
          this.setData({
              num: this.appState.dashboardAnalytics,
              myShares: this.appState.myShares,
              myLikes: this.appState.myCollect,
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
              this.appState.myCollect.forEach((x)=> {
                  const entity = x.entity;
                  if (!entity) {
                      return;
                  }
                  entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
                  entity.readTimes = entity.readTimes || 0;
                  entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
                  let read = entity.readTimes +''
                    if(read.length === 1){
                        entity.readTimes = parseInt(Math.random()*20+30)
                    }
              });
              this.setData({ myLikes: this.appState.myCollect, myLikesHasMore: this.appState.myCollect.__hasMore !== false });
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
        wx.onUserCaptureScreen(function (res) {
            gdt.track('my-capture-screen');
        })

        this.appState = gdt.localState;
        this.setData({
            num: this.appState.dashboardAnalytics
        });
        gdt.track('show-my-dashboard');
        wx.showShareMenu({ 
            withShareTicket: true,
         });

       
      },
      handleShrink: function(e) {
          this.setData({shinIndex: e.currentTarget.dataset.id, heightFlag: !this.data.heightFlag})
      },
      handleTab: function(e) {
          if (e.currentTarget.dataset.name == 'myShares') {
              gdt.magicMySharedFirstLoad().then(()=> this.setData({ myShares: this.appState.myShares }));
              gdt.track('my-dashboard-show-share');
            } else {
              gdt.magicMyLikedFirstLoad().then(()=> this.setData({ myLikes: this.appState.myCollect }));
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
        
        gdt.magicMySharedLoadMore();
        gdt.track('item-list-share-load-more')
      },
      onShareAppMessage: function({from, target, webViewUrl}) {
          const clip = target.dataset.item;
          
          if (!(clip && clip.entity)) {
              return;
          }
  
          const entity = clip.entity;
          gdt.trackShareItem(entity._id);
          gdt.track('share-item', { itemId: clip.entityId, type: entity.type, refId: clip._id });
        
          return {
              title: entity.title || '默认转发标题',
              path: `pages/detail/detail?ref=${clip._id}&id=${clip.entityId}&nickName=${this.data.userInfo.nickName}`,
              imageUrl: entity.coverUrl
          }
      },
      getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
        // console.log( e.detail.formId)
        // this.setData({
        // formId: e.detail.formId }) 
    },
    handleBack:function(e){
        wx.reLaunch({
            url:'/pages/index/index'
        })
    },
    handleDetailIntroduce:function(){
        wx.navigateTo({
            url:'/pages/introduce/intro'
        })
    },
    handleContact:function(){
        
    },
    //收藏和浏览足迹
    handleTapHistoryOrArticalOrVideo:function(e){
        console.log(e.currentTarget.dataset.name )
        wx.navigateTo({
            url:'/pages/history/history?type='+e.currentTarget.dataset.name
        })
    },
    //下拉刷新
    onPullDownRefresh: function () {
        gdt.magicMySharedLoadLatest();
        gdt.track('item-list-share-load-first')
    },
    

  })
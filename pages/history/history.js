

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
Page({
    data:{
        name:'',
        myCollectArtical:[],
        myCollectVideo:[],
        myViews:[],
        myCollect:[],
        myCollectArticalHasMore: undefined,
        myCollectVideoHasMore: undefined,

        myViewsHasMore: undefined,
        type1:'getUserInfo',
        screenHeight:''

    },
    onLoad:function(options){
       this.setData({name:options.type})
        this.appState = gdt.localState;
        gdt.systemInfo.then((x) => {
            this.setData({
                screenHeight: x.screenHeight,
            });
        });
        gdt.userInfo.then((x) => {
            this.setData({
                type1: 'share'
            });
        }).catch(() => {
            this.setData({
                type1: 'getUserInfo'
            });
            gdt.once('userInfo', () => {
                this.setData({ type1: 'share' });
            });
        });
        
        const makeMyCollectArtical = ()=> {
            this.appState.myCollectArtical.forEach((x)=> {
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
            this.setData({ myCollectArtical: this.appState.myCollectArtical , myCollectArticalHasMore: this.appState.myCollectArtical.__hasMore !== false});
            
        //     if(that.data.myCollectArtical.length>0){
        //         for (let i in that.data.myCollectArtical){
                   
        //             wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
        //                 console.log(ret.intersectionRatio)
        //                 if (ret.intersectionRatio > 0){
                         
        //                       that.data.myCollectArtical[i].isShow = true;
        //                 }
        //                 that.setData({ 
        //                     myCollectArtical: that.data.myCollectArtical
        //               });
        //             })
        //         }
        //    }
        };
        const makeMyCollectVideo = ()=> {
            this.appState.myCollectVideo.forEach((x)=> {
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
            
            this.setData({ myCollectVideo: this.appState.myCollectVideo, myCollectVideoHasMore: this.appState.myCollectVideo.__hasMore !== false});
        //     if(that.data.myCollectVideo.length>0){
        //         for (let i in that.data.myCollectVideo){
                   
        //             wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
        //                 console.log(ret.intersectionRatio)
        //                 if (ret.intersectionRatio > 0){
                         
        //                       that.data.myCollectVideo[i].isShow = true;
        //                 }
        //                 that.setData({ 
        //                     myCollectVideo: that.data.myCollectVideo
        //               });
        //             })
        //         }
        //    }
            
        };
        const makeMyViews = ()=> {
            this.appState.myViews.forEach((x)=> {
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
            
            this.setData({ myViews: this.appState.myViews, myViewsHasMore: this.appState.myViews.__hasMore !== false});
           
             //懒加载
            
               
            //  if(that.data.myViews.length>0){
            //       for (let i in that.data.myViews){
                     
            //           wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
            //               console.log(ret.intersectionRatio)
            //               if (ret.intersectionRatio > 0){
                           
            //                     that.data.myViews[i].isShow = true;
            //               }
            //               that.setData({ 
            //                 myViews: that.data.myViews
            //             });
            //           })
            //       }
            //  }
           
        };
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
            this.setData({ myCollect: this.appState.myCollect, myLikesHasMore: this.appState.myCollect.__hasMore !== false });
        };

        gdt.on('entityUpdate', (x) => {
            this.setData({ 
                myViews: this.appState.myViews, 
                myCollectArtical: this.appState.myCollectArtical,
                myCollectVideo: this.appState.myCollectVideo
            });
        });

        gdt.on('collectVideoItems',makeMyCollectVideo);
        gdt.on('collectArticalItems',makeMyCollectArtical);
        gdt.on('viewsItems',makeMyViews);
        
        gdt.fetchDashboardAnalytics();
       

        gdt.on('likedItems', makeMyLikes);
        gdt.on('liked', makeMyLikes);
        gdt.on('unliked', makeMyLikes);
        
       
        if(options.type === 'history'){
            gdt.magicMyViewsFirstLoad();
            wx.setNavigationBarTitle({
                title: '浏览历史',
            });
           
        }else if(options.type === 'artical'){
            gdt.magicMyCollectArticalFirstLoad();
            wx.setNavigationBarTitle({
                title: '收藏的文章',
            });
           
        }else{
            gdt.magicMyCollectVideoFirstLoad();
            wx.setNavigationBarTitle({
                title: '收藏的视频',
            });
            
        }
        let that = this  //
        this.setData({ 
            myViews: this.appState.myViews, 
            myCollectArtical: this.appState.myCollectArtical,
            myCollectVideo: this.appState.myCollectVideo
        })
        
        console.log(this.appState)
        
        
    },
    //进入详情
    handleDetail:function(e){
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
        })
    },
    handleLikeButtonTapped: function (e) {
        const targetEntity = e.currentTarget.dataset.item.entity;
        gdt.userInfo.then(() => {

            if (!targetEntity.liked) {
                gdt.likeItem(targetEntity._id);
                gdt.track('like-item', { itemId: targetEntity._id, type: targetEntity.type });
            } else {
                gdt.unlikeItem(targetEntity._id);
                gdt.track('unlike-item', { itemId: targetEntity._id, type: targetEntity.type });
            }


        }, () => {
            gdt.once('userInfo', () => {
                if (!targetEntity.liked) {
                    gdt.likeItem(targetEntity._id);
                    gdt.track('like-item', { itemId: targetEntity._id, type: targetEntity.type });
                } else {
                    gdt.unlikeItem(targetEntity._id);
                    gdt.track('unlike-item', { itemId: targetEntity._id, type: targetEntity.type });
                }
            })
        });

    },
    getFormID: function (e) {
        if (e.detail.formId) {
            gdt.collectTplMessageQuotaByForm(e.detail.formId);
        }
        // console.log( e.detail.formId)
        // this.setData({
        // formId: e.detail.formId }) 
    },
    onReachBottom: function () {
        console.log(11111)
        if (this.data.name == 'history') {
            gdt.magicMyViewsLoadMore()
        }else if(this.data.name == 'artical'){
            gdt.magicMyCollectArticalLoadMore()
        }else{
            gdt.magicMyCollectVideoLoadMore()
        }
       
    },
    //下拉刷新
    onPullDownRefresh: function () {
        if(this.data.name === 'history'){
            gdt.magicMyViewsLoadLatest().then(() => {
                gdt.track('item-list-view-load-first')
                setTimeout(() => {
                    wx.stopPullDownRefresh();
                }, 500);
            });

           
        }else if(this.data.name === 'artical'){
            
            gdt.magicMyCollectArticalLoadLatest().then(() => {
                gdt.track('item-list-liked-wxArticle-load-first')
                setTimeout(() => {
                    wx.stopPullDownRefresh();
                }, 500);
            });

           
        }else{
            gdt.magicMyCollectVideoLoadLatest().then(() => {
                gdt.track('item-list-liked-txvVideo-load-first')
                setTimeout(() => {
                    wx.stopPullDownRefresh();
                }, 500);
            });

            
        }
    },
    onShareAppMessage: function (event) {
        const target = event.target;
        if (target) {
            const entity = target.dataset.item;
            if (entity) {
                gdt.trackShareItem(entity._id);
                gdt.track('share-item-on-index-page', { itemId: entity._id, title: entity.title, type: entity.type });
                return {
                    title: entity.title || '默认转发标题',
                    path: `pages/detail/detail?id=${entity._id}&refee=${this.data.uid}&nickName=${this.data.nickName}&appName=${this.data.appTitle}`,
                    imageUrl: entity.coverUrl
                }
            }
        }
        return {};
    },
    handleAuthor: function (e) {

        if (e.detail && e.detail.userInfo) {
            gdt.emit('userInfo', e.detail);
        }

    },
    // onPageScroll() { 
    //     util.debounce(this.showImg())
    //   },
    
    // showImg(){  // 判断高度是否需要加载
        
    //     let that = this;
    //     wx.createSelectorQuery().selectAll('.item').boundingClientRect((ret) => {
    //         // const group = that.data.lists[that.data.currentTabIndex].items
    //         const height = that.data.screenHeight
    //         ret.forEach((item, index) => {
    //             if (item.top < height) {
                    
    //                 if(that.data.name === 'history'){
            
    //                     that.data.myViews[index].isShow = true;
                       
    //                 }else if(that.data.name === 'artical'){
                        
    //                     that.data.myCollectArtical[index].isShow = true;
                       
    //                 }else{
    //                     that.data.myCollectVideo[index].isShow = true;
    //                 }
    //             }
    //         })
    //         that.setData({ 
    //             myViews: that.data.myViews, 
    //             myCollectArtical: that.data.myCollectArtical,
    //             myCollectVideo: that.data.myCollectVideo
    //         });
    //     }).exec()
    // }
})
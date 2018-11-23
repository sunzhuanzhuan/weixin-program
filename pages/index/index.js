let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
const txvContext = requirePlugin("tencentvideo");
const innerAudioContext = app.backgroundAudioManager
Page({
    data: {
        appTitle: '',
        heightFlag: true,
        screenWidth: '',
        screenHeight: '',
        winHeight: 0,
        winWidth: 0,
        endWidth: '',
        startsWidth: '',
        num: {},
        scrollTop: 0,
        scrollLeft: 0,
        isModal: false,
        dashboardTipShouldDisplay: undefined,
        //新的标量
        lists: [],
        //哪一个tab
        currentTabIndex: 0,
        type: 'getUserInfo',
        type1: 'getUserInfo',
        isVideo: false,
        currentindex: undefined,
        
        
        //推荐的top 
        imgUrls: [],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        swiperActiveZero: ['noActive','noActiveLetter','margin30'],
        swiperActiveOne:['','activeLetter'],
        swiperActiveTwo: ['noActive','noActiveLetter','margin30'],
        //是否正在播放
        listening: false,
        listenIndexCurrent:undefined,
        listenTablistCurrent: 0,
        voiceId:undefined,
        currentSwiper:1,
        letter:false
        
    },

    //切换轮播图的时候
    handleChangeSwiper:function(e){
        console.log();
        this.setData({currentSwiper :e.detail.current})
        if(e.detail.current == 2){
            this.setData({
                swiperActiveZero: ['noActive','noActiveLetter','margin30'],
                swiperActiveOne:['noActive','noActiveLetter','margin30'],
                swiperActiveTwo: ['','activeLetter'],
            })
            
        }else if(e.detail.current == 0){
            this.setData({
                swiperActiveZero: ['','activeLetter'],
                swiperActiveOne:['noActive','noActiveLetter','margin30'],
                swiperActiveTwo: ['noActive','noActiveLetter','margin30'],
            })
        }else if(e.detail.current == 1){
            this.setData({
                swiperActiveZero: ['noActive','noActiveLetter','margin30'],
                swiperActiveOne:['','activeLetter'],
                swiperActiveTwo: ['noActive','noActiveLetter','margin30'],
            })
        }
    },
    //听力
    handleListing: function (e) {
        const entity = e.currentTarget.dataset.item;
        let voiceId = entity.wxmpVoiceIds[0];
        this.setData({ listenTablistCurrent: e.currentTarget.dataset.tablist });
        if (e.currentTarget.dataset.index == this.data.listenIndexCurrent) {
            if (this.data.listening) {
                innerAudioContext.pause();
                this.setData({
                    letter:false,
                    listening: false,
                    listenIndexCurrent: e.currentTarget.dataset.index,
                    voiceId:voiceId
                })
                gdt.track('pause-article-voice-on-index-page', {
                    voiceId: voiceId,
                    itemId: entity._id, title: entity.title,
                    playedPercentage: (innerAudioContext.currentTime / innerAudioContext.duration) || 0
                });
            } else {
                if(voiceId !=  this.data.voiceId){
                    innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid=' + voiceId;
                    innerAudioContext.title = e.currentTarget.dataset.item.title
                }
                innerAudioContext.onEnded(()=>{
                    this.setData({
                        letter:false,
                        listening: false,
                        listenIndexCurrent: e.currentTarget.dataset.index,
                        voiceId:voiceId
                    })
                })
                
                this.setData({
                    letter:true,
                    listening: true,
                    listenIndexCurrent: e.currentTarget.dataset.index,
                    voiceId:voiceId
                })
                innerAudioContext.play();
                gdt.track('play-article-voice-on-index-page', {
                    voiceId: voiceId,
                    itemId: entity._id, title: entity.title
                });
            }

        } else {
            innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid=' + voiceId;
            innerAudioContext.title = e.currentTarget.dataset.item.title
            innerAudioContext.play();
            this.setData({
                letter:true,
                listening: true,
                listenIndexCurrent: e.currentTarget.dataset.index,
                voiceId:voiceId
            })
            gdt.track('play-article-voice-on-index-page', {
                voiceId: voiceId,
                itemId: entity._id, title: entity.title
            });
        }




    },

    //变成video
    changeVideo: function (e) {
        const current = e.currentTarget.dataset.currentindex;
        this.setData({ isVideo: true, currentindex: current })
        const item = e.currentTarget.dataset.item;
        if (item && item.type === 'txvVideo' && item._id) {
            gdt.trackVideoPlay(item._id);
            gdt.track('video-play', { itemId: item._id });
        }
    },
    //授权
    //授权的时候发生的
    handleAuthor: function (e) {

        if (e.detail && e.detail.userInfo) {
            gdt.emit('userInfo', e.detail);
        }

    },
    handleLikeButtonTapped: function (e) {
        const targetEntity = e.currentTarget.dataset.item;
        gdt.userInfo.then(() => {

            if (!targetEntity.liked) {
                gdt.likeItem(targetEntity._id);
                gdt.track('like-item-on-index-page', { itemId: targetEntity._id, type: targetEntity.type });
            } else {
                gdt.unlikeItem(targetEntity._id);
                gdt.track('unlike-item-on-index-page', { itemId: targetEntity._id, type: targetEntity.type });
            }


        }, () => {
            gdt.once('userInfo', () => {
                if (!targetEntity.liked) {
                    gdt.likeItem(targetEntity._id);
                    gdt.track('like-item-on-index-page', { itemId: targetEntity._id, type: targetEntity.type });
                } else {
                    gdt.unlikeItem(targetEntity._id);
                    gdt.track('unlike-item-on-index-page', { itemId: targetEntity._id, type: targetEntity.type });
                }
            })
        });

    },
    onShow: function () {
      
       
        let that = this
        wx.showShareMenu({ 
            withShareTicket: true
         });

        gdt.track('show-index');
    },

    handleTitleTab(e) {
        // let list= this.data.lists[this.data.currentTabIndex].items;
        // console.log(list)
        // if(list.length>0){
        //     for (let i in list){
        //         let that = this  // 
        //         wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
        //             console.log(ret.intersectionRatio)
        //             if (ret.intersectionRatio > 0){
        //                 list[i].isShow =  true 
        //             }
        //             that.setData({ // 更新数据
        //                 lists:that.data.lists
        //             })
        //         })
        //     }
        // }
        this.setData({
            scrollTop: this.data.scrollTop = 0,
            currentTabIndex: e.currentTarget.dataset.tab,
            isVideo: false,
            currentindex: undefined,
            listenIndexCurrent:undefined,
            
        });
        const currentListInstance = this.data.lists[e.currentTarget.dataset.tab]
        if (currentListInstance) {
            gdt.magicListItemFirstLoad(currentListInstance._id);
            gdt.track('index-show-tab', { listId: currentListInstance._id, title: currentListInstance.title });
        }
        if (this.data.listenTablistCurrent != this.data.currentTabIndex) {
            this.setData({
                letter: false,
                listenIndexCurrent: undefined,
            });
        } else {
            if (this.data.listening) {
                this.setData({
                    letter: true

                })
            } else {

                this.setData({
                    letter: false
                })

            }
        }
    },
    //跳转到详情
    handleDetail(e) {
        let everyIndex = e.currentTarget.dataset.everyindex;
        if (everyIndex == this.data.listenIndexCurrent) {
            let that = this;
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=' + this.data.listening + '&index=' + everyIndex
            })
        } else {
            let that = this;
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=false&index=' + everyIndex
            })
        }
       
       
    },
    handleTouchEnd(e) {
        let that = this;
        // let list= this.data.lists[this.data.currentTabIndex].items;
               
        // if(list.length>0){
        //      for (let i in list){
        //          let that = this  // 
        //          wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
        //              console.log(ret.intersectionRatio)
        //              if (ret.intersectionRatio > 0){
        //                  list[i].isShow =  true 
        //              }
        //              this.setData({ // 更新数据
        //               lists:that.data.lists
        //              })
        //          })
        //      }
        // }
        this.setData({ endWidth: e.changedTouches[0].clientX, isVideo: false }, () => {
            if (that.data.startsWidth >= that.data.screenWidth / 2) {
                if (that.data.startsWidth - that.data.endWidth >= that.data.screenWidth / 4) {
                    that.setData({
                        scrollTop: that.data.scrollTop = 0,
                        scrollLeft: that.data.scrollLeft + 50,
                        templateFlag: true, currentTabIndex: ++that.data.currentTabIndex, isMore: true, list: []
                    }, () => {
                        const currentListInstance = that.data.lists[that.data.currentTabIndex];
                        if (that.data.currentTabIndex !== that.data.lists.length) {
                            gdt.magicListItemFirstLoad(currentListInstance._id);
                        }
                    });

                    if (that.data.currentTabIndex === that.data.lists.length) {
                        that.setData({ currentTabIndex: 0 })
                        that.setData({
                            scrollLeft: that.data.scrollLeft = -100,
                        });
                        wx.hideLoading();
                    }
                    if (that.data.listenTablistCurrent != that.data.currentTabIndex) {
                        that.setData({
                            letter: false,
                            listenIndexCurrent: undefined,
                        });
                    } else {
                        if (that.data.listening) {
                            that.setData({
                                letter: true
            
                            })
                        } else {
            
                            that.setData({
                                letter: false
                            })
            
                        }
                    }
                }
            } else {
                if (that.data.endWidth - that.data.startsWidth >= that.data.screenWidth / 4) {
                    if (that.data.currentTabIndex === 0) {
                        that.setData({
                            scrollLeft: that.data.scrollLeft = 50 * that.data.lists.length,
                            currentTabIndex: that.data.lists.length,
                        })
                    }
                    if (that.data.currentTabIndex === 1) {
                        that.setData({ scrollLeft: that.data.scrollLeft = 0 });
                    }

                    that.setData({ currentTabIndex: --that.data.currentTabIndex, list: [] }, () => {

                        const currentListInstance = that.data.lists[that.data.currentTabIndex];
                        if (!currentListInstance.length) {
                            gdt.magicListItemFirstLoad(currentListInstance._id);
                        }
                    })
                    if (that.data.listenTablistCurrent != that.data.currentTabIndex) {
                        that.setData({
                            letter: false,
                            listenIndexCurrent: undefined,
                        });
                    } else {
                        if (that.data.listening) {
                            that.setData({
                                letter: true
            
                            })
                        } else {
            
                            that.setData({
                                letter: false
                            })
            
                        }
                    }
                }
            }
        })
    },
    handleTouchStart(e) {
        this.setData({ startsWidth: e.changedTouches[0].clientX })
    },



    selectMy: function () {
        wx.setStorage({
            key: "isClickMy",
            data: true
        })
        wx.navigateTo({
            url: '/pages/my/my'
        });

    },
    handleClose: function () {
        this.setData({ isModal: false })
    },

    // 分割线

    onReady: function () {
        let that = this;
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
        let randomNum = parseInt(Math.random() * 60 + 30);
        gdt.userInfo.then((res) => {
            this.setData({ isModal: false })
        }).catch(() => {
            this.setData({ isModal: true })
        })
        gdt.appName.then((x) => {
            wx.setNavigationBarTitle({
                title: x,
            });
            this.data.appTitle = x;
        });
        gdt.ready.then((app) => {

            this.appState = app;
            if (app.title) {
                wx.setNavigationBarTitle({
                    title: app.title,
                });
            }
        //    app.lists.unshift({
        //     id:'123',
        //     title:'推荐',
        //     items:[1,2]
        //    })
       
        this.setData({
                appTitle: app.title,
                coverUrl: app.avatarUrl,
                dashboardTipShouldDisplay: app.localStorage.dashboardTipShouldDisplay === false ? false : true
            });

            gdt.on("storageSet", (k, v) => {
                if (k === 'dashboardTipShouldDisplay') {
                    this.setData({ dashboardTipShouldDisplay: v });
                }
            })
            gdt.on('listItems', (listId, updateRange, itemList) => {
                this.setData({ lists: app.lists });


            });

            gdt.on('entityUpdate', (x) => {
                const itemIndex = this.appState.itemIndex;

                this.setData({
                    lists: app.lists
                });
            });

            // if (app.lists.length) {
            //     gdt.magicListItemLoadMore(app.lists[0]._id);
            // }
            gdt.magicListItemLoadMore('topScoreds').then((res)=>{
                    let oldRes = JSON.parse(JSON.stringify(res));
                    let arr = res.splice(0,3);
                    if (app.lists[0] !== app.listIndex['topScoreds']) {
                        app.lists.unshift(app.listIndex['topScoreds']);
                    }
                   
                this.setData({
                    lists: app.lists,
                    imgUrls:arr
                })
                //  //懒加载
                // let list= this.data.lists[this.data.currentTabIndex].items;
               
                //    if(list.length>0){
                //         for (let i in list){
                //             let that = this  // 
                //             wx.createIntersectionObserver().relativeToViewport({bottom: 20}).observe('.item-'+ i, (ret) => {
                //                 console.log(ret.intersectionRatio)
                //                 if (ret.intersectionRatio > 0){
                //                     list[i].isShow =  true 
                //                 }
                //                 this.setData({ // 更新数据
                //                  lists:that.data.lists
                //                 })
                //             })
                //         }
                //    }
            });
            console.log(this.appState)
        });
        gdt.systemInfo.then((x) => {
            this.setData({
                winHeight: x.windowHeight,
                winWidth: x.windowWidth,
                screenWidth: x.screenWidth,
                screenHeight: x.screenHeight,
            });
        });
        gdt.currentUser.then((u)=> {
            this.data.uid = u._id;
            this.data.nickName = this.data.nickName || u.nickName;
        });
        
        
    },
    //上拉加载
    onReachBottom: function () {
        const currentListInstance = this.data.lists[this.data.currentTabIndex];
        
        if (currentListInstance) {
            if(currentListInstance._id === 'topScoreds'){
                gdt.magicListItemLoadMore(currentListInstance._id).then(() => {
                    gdt.track('item-list-load-more', { listId: currentListInstance._id, title: currentListInstance.title, acc: currentListInstance.oldRes.length });
                    });
            }else{
                gdt.magicListItemLoadMore(currentListInstance._id).then(() => {
                gdt.track('item-list-load-more', { listId: currentListInstance._id, title: currentListInstance.title, acc: currentListInstance.items.length });
                });
            }
            
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        const currentListInstance = this.data.lists[this.data.currentTabIndex]
        if (currentListInstance) {
            gdt.magicListItemLoadLatest(currentListInstance._id).then(() => {
                gdt.track('item-list-refresh', { listId: currentListInstance._id, title: currentListInstance.title });
                setTimeout(() => {
                    wx.stopPullDownRefresh();
                }, 500);
            });
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
    //                 that.data.lists[that.data.currentTabIndex].items[index].isShow = true
    //             }
    //         })
    //         that.setData({
    //             lists:that.data.lists
    //         })
    //     }).exec()
    // }

})

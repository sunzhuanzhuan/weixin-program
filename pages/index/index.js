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
        isVideo:false,
        currentindex:undefined,
        //是否正在播放
        listening:false,
        listenIndexCurrent:0,
        listenTablistCurrent:0,
        //推荐的top 
        imgUrls: [],
        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000,
        swiperActiveZero: 'noActive',
        swiperActiveOne:'',
        swiperActiveTwo: 'noActive',
    },

    //切换轮播图的时候
    handleChangeSwiper:function(e){
        console.log(e.detail.current);
        if(e.detail.current == 2){
            this.setData({
                swiperActiveZero: 'noActive',
                swiperActiveOne:'noActive',
                swiperActiveTwo: '',
            })
            
        }else if(e.detail.current == 0){
            this.setData({
                swiperActiveZero: '',
                swiperActiveOne:'noActive',
                swiperActiveTwo: 'noActive',
            })
        }else if(e.detail.current == 1){
            this.setData({
                swiperActiveZero: 'noActive',
                swiperActiveOne:'',
                swiperActiveTwo: 'noActive',
            })
        }
    },
    //听力
    handleListing:function(e){
        console.log(e.currentTarget.dataset.tablist)
        let voiceId = e.currentTarget.dataset.item.wxmpVoiceIds[0]
        this.setData({ listenTablistCurrent:e.currentTarget.dataset.tablist })
        let that = this;
        if(e.currentTarget.dataset.index == this.data.listenIndexCurrent){
            if(this.data.listening){
                innerAudioContext.pause();
                this.setData({
                    listening:false,
                    listenIndexCurrent:e.currentTarget.dataset.index
                })
            }else{
                innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid='+voiceId;
                innerAudioContext.title = e.currentTarget.dataset.item.title
                this.setData({
                    listening:true,
                    listenIndexCurrent:e.currentTarget.dataset.index
                })
                innerAudioContext.play();
            }
       
        }else{
            innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid='+voiceId;
             innerAudioContext.title = e.currentTarget.dataset.item.title
            innerAudioContext.play();
            this.setData({
                listening:true,
                listenIndexCurrent:e.currentTarget.dataset.index
            })
        }
        
        
        
        
    },
   
    //变成video
    changeVideo:function(e){
        const current = e.currentTarget.dataset.currentindex;
        this.setData({isVideo:true,currentindex:current})
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
    onShow: function () {
        console.log(this)
        let that = this
        wx.showShareMenu({ withShareTicket: true });

        gdt.track('show-index');
    },

    handleTitleTab(e) {
        this.setData({
            scrollTop: this.data.scrollTop = 0,
            currentTabIndex: e.currentTarget.dataset.tab,
            isVideo:false,
            currentindex:null
        });
        const currentListInstance = this.data.lists[e.currentTarget.dataset.tab]
        if (currentListInstance) {
            gdt.magicListItemFirstLoad(currentListInstance._id);
            gdt.track('index-show-tab', { listId: currentListInstance._id, title: currentListInstance.title });
        }
        if(this.data.listenTablistCurrent != this.data.currentTabIndex){
            this.setData({
                listening:false,
                listenIndexCurrent:0,
            })
        }else{
            if(this.data.listening){
               
                this.setData({
                    listening:false
                   
                })
            }else{
                
                this.setData({
                    listening:true
                })
               
            } 
        }
    },
    //跳转到详情
    handleDetail(e) {
        let everyIndex = e.currentTarget.dataset.everyindex;
        if(everyIndex == this.data.listenIndexCurrent){
             let that = this;
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle +'&listening='+this.data.listening+'&index='+everyIndex
            })
        }else{
            let that = this;
            wx.navigateTo({
                url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle +'&listening=false&index='+everyIndex
            })
        }
        // console.log( data-everyIndex="{{index}}");
        console.log()
       
    },
    handleTouchEnd(e) {
        let that = this;
        
        this.setData({ endWidth: e.changedTouches[0].clientX ,isVideo:false}, () => {
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
                    if(that.data.listenTablistCurrent != that.data.currentTabIndex){
                        this.setData({
                            listening:false,
                            listenIndexCurrent:0,
                        })
                    }else{
                        if(that.data.listening){
                           
                            that.setData({
                                listening:false
                               
                            })
                        }else{
                            
                            that.setData({
                                listening:true
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
                    if(that.data.listenTablistCurrent != that.data.currentTabIndex){
                        this.setData({
                            listening:false,
                            listenIndexCurrent:0,
                        })
                    }else{
                        if(that.data.listening){
                           
                            that.setData({
                                listening:false
                               
                            })
                        }else{
                            
                            that.setData({
                                listening:true
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
                //itemIndex 是老的储存，newIndex是新的
                if (itemList && itemList.length) {
                    const itemIndex = this.appState.itemIndex;
                    itemList.forEach((newIndex) => {
                        if (itemIndex[newIndex._id]) {
                            const indexedItem = itemIndex[newIndex._id];
                            indexedItem._sourceWxDisplayName = newIndex.sourceWxNickname || '-';
                            indexedItem._publishedFromNow = util.moment(newIndex.publishedAt).fromNow();

                            indexedItem._likedTimes = newIndex.likedTimes > (indexedItem._likedTimes || 10) ?
                                newIndex.likedTimes : (indexedItem.randomNum + newIndex.likedTimes);

                        } else {
                            newIndex._sourceWxDisplayName = newIndex.sourceWxNickname || '-';
                            newIndex._publishedFromNow = util.moment(newIndex.publishedAt).fromNow();

                            newIndex._likedTimes = newIndex.likedTimes > (newIndex._likedTimes || 10) ?
                                newIndex.likedTimes : (newIndex.randomNum + newIndex.likedTimes);
                        }

                    });
                }

                this.setData({ lists: app.lists });


            });

            gdt.on('entityUpdate', (x) => {
                const itemIndex = this.appState.itemIndex;

                if (itemIndex[x._id]) {
                    const indexedItem = itemIndex[x._id];
                    indexedItem._sourceWxDisplayName = x.sourceWxNickname || '-';
                    indexedItem._publishedFromNow = util.moment(x.publishedAt).fromNow();

                    indexedItem._likedTimes = x.likedTimes > (indexedItem._likedTimes || 10) ?
                        x.likedTimes : (indexedItem.randomNum + x.likedTimes);

                } else {
                    x._sourceWxDisplayName = x.sourceWxNickname || '-';
                    x._publishedFromNow = util.moment(newIndex.publishedAt).fromNow();

                    x._likedTimes = x.likedTimes > (x._likedTimes || 10) ?
                        x.likedTimes : (x.randomNum + x.likedTimes);
                }

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
                   app.lists.unshift(app.listIndex['topScoreds']);
                console.log(app.lists)
                this.setData({
                    lists: app.lists,
                    imgUrls:arr
                })
               
            });
        });
        gdt.systemInfo.then((x) => {
            this.setData({
                winHeight: x.windowHeight,
                winWidth: x.windowWidth,
                screenWidth: x.screenWidth,
                screenHeight: x.screenHeight,
            });
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
    }

})

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');

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
        isNew: true,
        //新的标量
        lists: [],
        //哪一个tab
        currentTabIndex: 0

    },
    onShow: function () {
        let that = this
        wx.showShareMenu({ withShareTicket: true });
        wx.getStorageInfo({
            success:function(res){
                if(res.keys.indexOf('isClickMy') >-1 ){
                    gdt.userInfo.then((x) => {
                        that.setData({ isNew: false })
                        
                    }).catch(() => {
                        that.setData({ isNew: true })
                    });
                }
            },
            fail:function(){
                that.setData({ isNew: true })
            }
        })
        
        gdt.track('show-index');
    },

    handleTitleTab(e) {
        this.setData({
            scrollTop: this.data.scrollTop = 0,
            currentTabIndex: e.currentTarget.dataset.tab
        });
        const currentListInstance = this.data.lists[e.currentTarget.dataset.tab]
        if (currentListInstance) {
            gdt.magicListItemFirstLoad(currentListInstance._id);
            gdt.track('index-show-tab', { listId: currentListInstance._id, title: currentListInstance.title });
        }
    },
    //跳转到详情
    handleDetail(e) {
        let that = this;
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap+'&appName='+this.data.appTitle
        })
    },
    handleTouchEnd(e) {
        let that = this;
        this.setData({ endWidth: e.changedTouches[0].clientX }, () => {
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

                }
            }
        })
    },
    handleTouchStart(e) {
        this.setData({ startsWidth: e.changedTouches[0].clientX })
    },



    selectMy: function () {
        wx.setStorage({
            key:"isClickMy",
            data:true
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
        let randomNum =parseInt(Math.random()*60+30);
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
            this.setData({ lists: app.lists ,appTitle:app.title,coverUrl:app.avatarUrl});
           
            
            
            gdt.on('listItems', (listId, updateRange, itemList) => {
                //itemIndex 是老的储存，newIndex是新的
                if (itemList && itemList.length) {
                    const itemIndex = this.appState.itemIndex;
                    itemList.forEach((newIndex) => {
                        if (itemIndex[newIndex._id]) {
                            const indexedItem = itemIndex[newIndex._id];
                            indexedItem._sourceWxDisplayName = newIndex.sourceWxNickname || '-';
                            indexedItem._publishedFromNow = util.moment(newIndex.publishedAt).fromNow();
                            
                            indexedItem._readTimes = newIndex.readTimes > (indexedItem._readTimes || 10) ? 
                            newIndex.readTimes : (indexedItem.randomNum + newIndex.readTimes);

                        } else {
                            newIndex._sourceWxDisplayName = newIndex.sourceWxNickname || '-';
                            newIndex._publishedFromNow = util.moment(newIndex.publishedAt).fromNow();
                            
                            newIndex._readTimes = newIndex.readTimes > (newIndex._readTimes || 10) ? 
                            newIndex.readTimes : (newIndex.randomNum + newIndex.readTimes);
                        }

                    });
                }
                
                this.setData({ lists: app.lists });
            });
            
            if (app.lists.length) {
                gdt.magicListItemLoadMore(app.lists[0]._id)
            }
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
        const currentListInstance = this.data.lists[this.data.currentTabIndex]
        if (currentListInstance) {
            gdt.magicListItemLoadMore(currentListInstance._id).then(() => {
                gdt.track('item-list-load-more', { listId: currentListInstance._id, title: currentListInstance.title, acc: currentListInstance.items.length });
            });
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

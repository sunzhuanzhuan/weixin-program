let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');

Page({
    data: {
        appTitle: app.appName,
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
        isClickMy: false,
        //新的标量
        lists: [],
        //哪一个tab
        currentTabIndex: 0

    },
    onShow: function () {
        wx.showShareMenu({ withShareTicket: true });
        gdt.userInfo.then((x) => {
            if (this.data.isClickMy) {
                this.setData({ isNew: false })
            } else {
                this.setData({ isNew: true })
            }
        }).catch(() => {
            this.setData({ isNew: true })
        });

    },

    handleTitleTab(e) {
        this.setData({
            scrollTop: this.data.scrollTop = 0,
            currentTabIndex: e.currentTarget.dataset.tab
        });
        const currentListInstance = this.data.lists[e.currentTarget.dataset.tab]
        if (currentListInstance) {
            gdt.magicListItemFirstLoad(currentListInstance._id);

        }
    },
    //跳转到详情
    handleDetail(e) {
        let that = this;
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&num=' + that.data.detailTap
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
        this.setData({
            isClickMy: true
        })
        wx.navigateTo({
            url: '/pages/my/my'
        })
    },
    handleClose: function () {
        this.setData({ isModal: false })
    },

    // 分割线

    onReady: function () {
        let that = this;
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
        gdt.ready.then((x) => {
            this.appState = x;
            if (x.title) {
                wx.setNavigationBarTitle({
                    title: x.title,
                });
            }
            this.setData({ lists: x.lists });
            gdt.on('listItems', (listId, updateRange, itemList) => {
                if (itemList && itemList.length) {
                    const itemIndex = this.appState.itemIndex;
                    itemList.forEach((x) => {
                        if (itemIndex[x._id]) {
                            const indexedItem = itemIndex[x._id];
                            indexedItem._sourceWxDisplayName = x.sourceWxNickname || '-';
                            indexedItem._publishedFromNow = util.moment(x.publishedAt).fromNow();
                        } else {
                            x._sourceWxDisplayName = x.sourceWxNickname || '-';
                            x._publishedFromNow = util.moment(x.publishedAt).fromNow();
                        }

                    });
                }
                this.setData({ lists: x.lists }, () => {
                    console.log(this.data.lists)
                });
            });
            if (x.lists.length) {
                gdt.magicListItemLoadMore(x.lists[0]._id);
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
            gdt.magicListItemLoadMore(currentListInstance._id).catch((err)=> {
              console.log(err.toString(), err.stack)
            });
        }
    },
    //下拉刷新
    onPullDownRefresh: function () {
        const currentListInstance = this.data.lists[this.data.currentTabIndex]
        if (currentListInstance) {
            gdt.magicListItemLoadLatest(currentListInstance._id).then(() => {
                setTimeout(() => {
                    wx.stopPullDownRefresh();
                }, 500);
            });

        }
    },

})

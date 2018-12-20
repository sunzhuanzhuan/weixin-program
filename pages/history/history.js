

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
Page({
	data: {
		name: '',
		myCollectArtical: [],
		myCollectVideo: [],
		myViews: [],
		myCollect: [],
		myCollectArticalHasMore: undefined,
		myCollectVideoHasMore: undefined,

		myViewsHasMore: undefined,
		type1: 'getUserInfo',
		screenHeight: '',
		reportSubmit: true,
		loadding:false,

	},
	onShow: function () {
		//网络状况
		wx.getNetworkType({
			success(res) {
				const networkType = res.networkType;
				if (networkType === '2g' || networkType === 'none') {
					wx.showToast({
						title: '阿哦～没有网络无法正常使用',
						icon: 'none',
						duration: 3000
					})
				}
			}
		})
		if (this.data.name == 'history') {
			//截屏事件
			wx.onUserCaptureScreen(function (res) {
				gdt.track('history-capture-screen');
			})
		} else if (this.data.name == 'artical') {
			//截屏事件
			wx.onUserCaptureScreen(function (res) {
				gdt.track('artical-capture-screen');
			})
		} else {
			//截屏事件
			wx.onUserCaptureScreen(function (res) {
				gdt.track('txvVideo-capture-screen');
			})
		}


	},

	onLoad: function (options) {
		this.setData({ name: options.type })
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

		const makeMyCollectArtical = () => {
			this.appState.myCollectArtical.forEach((x) => {
				const entity = x.entity;
				if (!entity) {
					return;
				}
				entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
				entity.readTimes = entity.readTimes || 0;
				entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
				let read = entity.readTimes + ''
				if (read.length === 1) {
					entity.readTimes = parseInt(Math.random() * 20 + 30)
				}
			});
			this.setData({myCollectArtical: this.appState.myCollectArtical, myCollectArticalHasMore: this.appState.myCollectArtical.__hasMore !== false });


		};
		const makeMyCollectVideo = () => {
			this.appState.myCollectVideo.forEach((x) => {
				const entity = x.entity;
				if (!entity) {
					return;
				}
				entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
				entity.readTimes = entity.readTimes || 0;
				entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
				let read = entity.readTimes + ''
				if (read.length === 1) {
					entity.readTimes = parseInt(Math.random() * 20 + 30)
				}
			});

			this.setData({ myCollectVideo: this.appState.myCollectVideo, myCollectVideoHasMore: this.appState.myCollectVideo.__hasMore !== false });


		};
		const makeMyViews = () => {
			this.appState.myViews.forEach((x) => {
				const entity = x.entity;
				if (!entity) {
					return;
				}
				entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
				entity.readTimes = entity.readTimes || 0;
				entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
				let read = entity.readTimes + ''
				if (read.length === 1) {
					entity.readTimes = parseInt(Math.random() * 20 + 30)
				}
			});

			this.setData({ myViews: this.appState.myViews, myViewsHasMore: this.appState.myViews.__hasMore !== false });

		};
		const makeMyLikes = () => {
			this.appState.myCollect.forEach((x) => {
				const entity = x.entity;
				if (!entity) {
					return;
				}
				entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
				entity.readTimes = entity.readTimes || 0;
				entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
				let read = entity.readTimes + ''
				if (read.length === 1) {
					entity.readTimes = parseInt(Math.random() * 20 + 30)
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

		gdt.on('collectVideoItems', makeMyCollectVideo);
		gdt.on('collectArticalItems', makeMyCollectArtical);
		gdt.on('viewsItems', makeMyViews);

		gdt.fetchDashboardAnalytics();


		gdt.on('likedItems', makeMyLikes);
		gdt.on('liked', makeMyLikes);
		gdt.on('unliked', makeMyLikes);


		if (options.type === 'history') {
			gdt.magicMyViewsFirstLoad().then(()=>{
				this.setData({loadding:true})
			});
			wx.setNavigationBarTitle({
				title: '浏览历史',
			});

		} else if (options.type === 'artical') {
			gdt.magicMyCollectArticalFirstLoad().then(()=>{
				this.setData({loadding:true})
			});
			wx.setNavigationBarTitle({
				title: '收藏的文章',
			});

		} else {
			gdt.magicMyCollectVideoFirstLoad().then(()=>{
				this.setData({loadding:true})
			});
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

		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlPlay: 'https://' + res.split('/')[2] + '/static/images/play.png',
				baseImageUrlLogo: 'https://' + res.split('/')[2] + '/static/images/logo.png',
				baseImageUrlAllStar: 'https://' + res.split('/')[2] + '/static/images/allStar.png'
			})
		})


	},
	//进入详情
	handleDetail: function (e) {
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

	},
	onReachBottom: function () {
		this.setData({loadding:false,})
		if (this.data.name == 'history') {
			gdt.magicMyViewsLoadMore().then(()=>{
				this.setData({loadding:true,})
			})
		} else if (this.data.name == 'artical') {
			gdt.magicMyCollectArticalLoadMore().then(()=>{
				this.setData({loadding:true,})
			})
		} else {
			gdt.magicMyCollectVideoLoadMore().then(()=>{
				this.setData({loadding:true,})
			})
		}

	},
	//下拉刷新
	onPullDownRefresh: function () {
		let that = this;
		this.setData({loadding:false})
		if (this.data.name === 'history') {
			gdt.magicMyViewsLoadLatest().then(() => {
				that.setData({loadding:true,})
				gdt.track('item-list-view-load-first')
				setTimeout(() => {
					wx.stopPullDownRefresh();
				}, 500);
			});


		} else if (this.data.name === 'artical') {

			gdt.magicMyCollectArticalLoadLatest().then(() => {
				that.setData({loadding:true,})
				gdt.track('item-list-liked-wxArticle-load-first')
				setTimeout(() => {
					wx.stopPullDownRefresh();
				}, 500);
			});


		} else {
			gdt.magicMyCollectVideoLoadLatest().then(() => {
				that.setData({loadding:true,})
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

})

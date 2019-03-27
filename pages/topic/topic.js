let app = getApp().globalData;
const gdt = app.applicationDataContext;

Page({
	data: {
		topic: {},
		type: "",
		type1: '',
	},
	onLoad: function (params) {
		let topic = JSON.parse(params.topicId);

		gdt.getTopic(topic._id).then((res) => {
			this.setData({ topic, topicList: res })
		});
		gdt.baseServerUri.then((res1) => {
			gdt.distroId.then((res3) => {
				this.setData({
					cover: res1 + '/' + res3 + '/simpleTopic/' + topic._id + '/cover'
				})
			})
		})
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
				this.setData({
					type1: 'share'
				});
			});
		});
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlAllStar: 'https://' + res.split('/')[2] + '/static/images/allStar.png',
			})
		})
		gdt.ready.then((app) => {
			this.appState = app;
			gdt.on('entityUpdate', (x) => {
				const itemIndex = this.appState.itemIndex;
				let this_ = this;

				// setTimeout(() => {
				// 	this_.setData({
				// 		lists: app.lists
				// 	});
				// }, 500)

			});
		})


	},

	onShareAppMessage: function (event) {
		const target = event.target;
		if (target) {
			const entity = target.dataset.item;
			if (entity) {
				gdt.trackShareItem(entity._id);
				gdt.track('share-item-on-index-page', {
					itemId: entity._id,
					title: entity.title,
					type: entity.type
				});
				return {
					title: entity.title || this.data.appTitle || '默认转发标题',
					path: `pages/detail/detail?id=${entity._id}&refee=${this.data.uid}&nickName=${this.data.nickName}&appName=${this.data.appTitle}`,
					imageUrl: entity.coverUrl
				}
			}
		}
		const currentListInstance = this.data.lists[this.data.currentTabIndex];
		return {
			title: `${this.data.appTitle} - ${currentListInstance.title || '主页'}`,
			path: `pages/index/index?refee=${this.data.uid}&listId=${currentListInstance._id}&nickName=${this.data.nickName}&appName=${this.data.appTitle}`,
		};
	},
	getFormID: function (e) {
		if (e.detail.formId) {
			gdt.collectTplMessageQuotaByForm(e.detail.formId);
		}

	},
	//授权的时候发生的
	handleAuthor: function (e) {
		if (e.detail && e.detail.userInfo) {
			gdt.emit('userInfo', e.detail);
		}

	},
	handleLikeButtonTapped: function (e) {
		console.log(e)
		const targetEntity = e.currentTarget.dataset.item;
		gdt.userInfo.then(() => {

			if (!targetEntity.liked) {
				gdt.likeItem(targetEntity._id);
				gdt.track('like-item-on-index-page', {
					itemId: targetEntity._id,
					type: targetEntity.type
				});
			} else {
				gdt.unlikeItem(targetEntity._id);
				gdt.track('unlike-item-on-index-page', {
					itemId: targetEntity._id,
					type: targetEntity.type
				});
			}


		}, () => {
			gdt.once('userInfo', () => {
				if (!targetEntity.liked) {
					gdt.likeItem(targetEntity._id);
					gdt.track('like-item-on-index-page', {
						itemId: targetEntity._id,
						type: targetEntity.type
					});
				} else {
					gdt.unlikeItem(targetEntity._id);
					gdt.track('unlike-item-on-index-page', {
						itemId: targetEntity._id,
						type: targetEntity.type
					});
				}
			})
		});
		gdt.getTopic(this.data.topic._id).then((res) => {
			this.setData({ topicList: res })
		});

	},
})

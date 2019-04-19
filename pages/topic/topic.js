let app = getApp().globalData;
const gdt = app.applicationDataContext;
const _ = require('../../utils/lodash.custom.min.js');
const util = require('../../utils/util');

const innerAudioContext = app.backgroundAudioManager

Page({
	data: {
		topic: {},
		type: "",
		type1: '',
		//是否正在播放
		listening: false,
		listenIndexCurrent: undefined,
		listenTablistCurrent: 0,
		voiceId: undefined,
		currentSwiper: 1,
		letter: false,
	},
	onLoad: function (params) {
		let topic = JSON.parse(params.topicId);
		this.setData({ topic })
		gdt.getTopic(topic._id).then((res) => {
			this.handleWeiBoTitle(res)
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



	},
	//循环嵌套解决微博的标题问题
	handleWeiBoTitle(res) {
		res.map((item) => {
			if (item.type === 'wbArticle' && !item._wbPatched) {

				item._wbDateText = util.moment(item.publishedAt).format('MM-DD HH:mm');
				const rootNode = Object.assign({}, item.nodes[0]);

				const removeVideoUrl = item.wbVideo && item.wbVideo.playUrl;

				if (removeVideoUrl) {

					const lastTextNode = _.find(Array.from(rootNode.children).reverse(), { type: 'text' });
					const lastText = lastTextNode.text;
					lastTextNode.text = lastText.replace(/\s*https?\:\/\/.*?$/, '').trimRight();
				}

				let i = 0;
				if (item.nodes && item.nodes.length) {
					const contentArray = [];

					let done = false;

					for (const node of rootNode.children) {

						if (node.type === 'text') {
							const text = node.text || '';
							const textVec = [];
							for (const char of text) {
								const charCode = char.charCodeAt(0);
								if (charCode === 94 || charCode > 127) {
									i += 2;
								} else {
									i += 1;
								}
								textVec.push(char);

								if (i >= 110) {
									done = true;
									const textCut = textVec.join('');
									if (textCut) {
										contentArray.push({ type: 'text', text: textCut });
									}
									contentArray.push({
										type: 'node', name: 'span', attrs: { class: 'wb-more' }, children: [
											{ type: 'node', name: 'span', attrs: { class: 'wb-more-dots' }, children: [{ type: 'text', text: '...' }] },
											{ type: 'node', name: 'span', attrs: { class: 'wb-more-text' }, children: [{ type: 'text', text: '全文' }] }
										]
									})
									break;
								}

							}
							if (done) {
								break;
							}
							contentArray.push(node);

						} else {
							contentArray.push(node);
							i += 2;
						}

					}

					rootNode.children = contentArray;
					item._wbNodes = [rootNode];
				}
				if (item._wbNodes && item._wbDateText) {
					item._wbPatched = true;
				}
			}
		})
		this.setData({ topicList: res })
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
	//跳转到详情
	handleDetail(e) {
		console.log(e)
		let everyIndex = e.currentTarget.dataset.everyindex;
		if (everyIndex == this.data.listenIndexCurrent) {
			let that = this;
			wx.navigateTo({
				url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&listenTablistCurrent=' + that.data.currentTabIndex + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=' + this.data.listening + '&index=' + everyIndex
			})
		} else {
			let that = this;
			wx.navigateTo({
				url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&listenTablistCurrent=' + that.data.currentTabIndex + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=false&index=' + everyIndex
			})
		}


	},
	handleCopyPermanentUrlToClipBoard(e) {
		const entity = e.currentTarget.dataset.item;
		if (!entity) {
			return;
		}

		let dataToCommit = '';
		let titleToToast = '';
		switch (entity.type) {
			// case 'wxArticle': {
			//   dataToCommit = entity.wxPermanentUrl;
			//   titleToToast = '已复制文章链接';
			//   break;
			// }

			// case 'wbArticle': {
			//   dataToCommit = entity.wbPermanentUrl;
			//   titleToToast = '已复制微博链接';
			//   break;
			// }

			default: {
				break;
			}

		}

		if (!dataToCommit) {
			return;
		}

		wx.setClipboardData({
			data: dataToCommit,
			success: () => {

				wx.showToast({
					title: titleToToast,
					duration: 2000

				});
			}
		});
	},
	/* 微博源中点击图片可以预览，可以滑动切换图片 */
	previewImg(e) {
		let index = e.currentTarget.dataset.index;            //图片在微博源的index
		let imgArr = e.currentTarget.dataset.imgurls;                         		 //此微博源的图片地址组
		wx.previewImage({
			current: imgArr[index],     //当前图片地址
			urls: imgArr,               //所有要预览的图片的地址集合 数组形式
			success: function (res) { },
			fail: function (res) { },
			complete: function (res) { },
		})
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
			this.handleWeiBoTitle(res)
		});

	},
	handleTopicList: function (topicList) {
		this.setData({
			topicList: topicList
		})
	},
	//听力
	handleListing: function (e) {
		const entity = e.currentTarget.dataset.item;
		let voiceId = entity.wxmpVoiceIds[0];
		this.setData({
			listenTablistCurrent: e.currentTarget.dataset.tablist
		});
		if (e.currentTarget.dataset.index == this.data.listenIndexCurrent) {
			if (this.data.listening) {
				innerAudioContext.pause();
				this.setData({
					letter: false,
					listening: false,
					listenIndexCurrent: e.currentTarget.dataset.index,
					voiceId: voiceId
				})
				gdt.track('pause-article-voice-on-index-page', {
					voiceId: voiceId,
					itemId: entity._id,
					title: entity.title,
					playedPercentage: (innerAudioContext.currentTime / innerAudioContext.duration) || 0
				});
			} else {
				if (voiceId != this.data.voiceId) {
					innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid=' + voiceId;
					innerAudioContext.title = e.currentTarget.dataset.item.title
				}
				innerAudioContext.onEnded(() => {
					this.setData({
						letter: false,
						listening: false,
						listenIndexCurrent: e.currentTarget.dataset.index,
						voiceId: voiceId
					})
				})

				this.setData({
					letter: true,
					listening: true,
					listenIndexCurrent: e.currentTarget.dataset.index,
					voiceId: voiceId
				})
				innerAudioContext.play();
				gdt.track('play-article-voice-on-index-page', {
					voiceId: voiceId,
					itemId: entity._id,
					title: entity.title
				});
			}

		} else {
			innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid=' + voiceId;
			innerAudioContext.title = e.currentTarget.dataset.item.title
			innerAudioContext.play();
			this.setData({
				letter: true,
				listening: true,
				listenIndexCurrent: e.currentTarget.dataset.index,
				voiceId: voiceId
			})
			gdt.track('play-article-voice-on-index-page', {
				voiceId: voiceId,
				itemId: entity._id,
				title: entity.title
			});
		}




	},
})

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const _ = require('../../utils/lodash.custom.min.js');
const util = require('../../utils/util');

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
		swiperActiveZero: ['noActive', 'noActiveLetter', 'margin30'],
		swiperActiveOne: ['', 'activeLetter'],
		swiperActiveTwo: ['noActive', 'noActiveLetter', 'margin30'],
		//是否正在播放
		listening: false,
		listenIndexCurrent: undefined,
		listenTablistCurrent: 0,
		voiceId: undefined,
		currentSwiper: 1,
		letter: false,
		// 触摸开始时间
		touchStartTime: 0,
		// 触摸结束时间
		touchEndTime: 0,
		// 最后一次单击事件点击发生时间
		lastTapTime: 0,
		// 单击事件点击后要触发的函数
		lastTapTimeoutFunc: null,
		reportSubmit: true,
		loadding: undefined,
		up: false,
		votePage: 'index',
		setting: {},
		enable: false,
		//专题
		topic: []
	},
	//进入专题详情
	handleTopic(e) {
		let itemTopic = e.currentTarget.dataset.itemtopic;
		let strTopic = JSON.stringify(itemTopic);
		wx.navigateTo({
			url: '/pages/topic/topic?topicId=' + strTopic
		})
	},
	//切换轮播图的时候
	handleChangeSwiper: function (e) {
		this.setData({
			currentSwiper: e.detail.current
		})
		if (e.detail.source == 'autoplay' || e.detail.source == 'touch') {
			if (e.detail.current == 2) {
				this.setData({
					swiperActiveZero: ['noActive', 'noActiveLetter', 'margin30'],
					swiperActiveOne: ['noActive', 'noActiveLetter', 'margin30'],
					swiperActiveTwo: ['', 'activeLetter'],
				})

			} else if (e.detail.current == 0) {
				this.setData({
					swiperActiveZero: ['', 'activeLetter'],
					swiperActiveOne: ['noActive', 'noActiveLetter', 'margin30'],
					swiperActiveTwo: ['noActive', 'noActiveLetter', 'margin30'],
				})
			} else if (e.detail.current == 1) {
				this.setData({
					swiperActiveZero: ['noActive', 'noActiveLetter', 'margin30'],
					swiperActiveOne: ['', 'activeLetter'],
					swiperActiveTwo: ['noActive', 'noActiveLetter', 'margin30'],
				})
			}
		}

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

	//变成video
	changeVideo: function (e) {
		const current = e.currentTarget.dataset.currentindex;
		this.setData({
			isVideo: true,
			currentindex: current
		})
		const item = e.currentTarget.dataset.item;
		if (item && item.type === 'txvVideo' && item._id) {
			gdt.trackVideoPlay(item._id);
			gdt.track('video-play', {
				itemId: item._id
			});
		}
	},
	//跳转到详情
	handleDetail(e) {
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
		//截屏事件
		wx.onUserCaptureScreen(function (res) {
			gdt.track('index-capture-screen');
		})

		wx.setNavigationBarTitle({
			title: this.data.appTitle,
		});

		let that = this
		wx.showShareMenu({
			withShareTicket: true
		});

		gdt.track('show-index');
	},

	handleTitleTab(e) {
		this.setData({
			loadding: false,
			first: false
		})
		// 控制点击事件在350ms内触发，加这层判断是为了防止长按时会触发点击事件
		if (this.data.touchEndTime - this.data.touchStartTime < 350) {
			// 当前点击的时间
			var currentTime = e.timeStamp
			var lastTapTime = this.data.lastTapTime
			// 更新最后一次点击时间
			this.data.lastTapTime = currentTime

			// 如果两次点击时间在300毫秒内，则认为是双击事件
			if (currentTime - lastTapTime < 300) {
				wx.pageScrollTo({
					scrollTop: 0,
					duration: 1000
				})
			}
		}
		// console.log(this.data.listenIndexCurrent);
		// console.log(this.data.listening);
		// console.log(this.data.letter);

		this.setData({
			scrollTop: this.data.scrollTop = 0,
			currentTabIndex: e.currentTarget.dataset.tab,
			isVideo: false,
			currentindex: undefined,
			listenIndexCurrent: undefined,

		});
		// console.log(this.data.listenTablistCurrent);
		// console.log(this.data.currentTabIndex);
		const currentListInstance = this.data.lists[e.currentTarget.dataset.tab]
		if (currentListInstance) {
			gdt.magicListItemFirstLoad(currentListInstance._id).then((res) => {
				this.handleShowTopic(this.data.lists, this.data.currentTabIndex)
				this.setData({
					loadding: true,
				})
			});
			gdt.track('index-show-tab', {
				listId: currentListInstance._id,
				title: currentListInstance.title
			});
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
				url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&listenTablistCurrent=' + that.data.currentTabIndex + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=' + this.data.listening + '&index=' + everyIndex
			})
		} else {
			let that = this;
			wx.navigateTo({
				url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id + '&listenTablistCurrent=' + that.data.currentTabIndex + '&num=' + that.data.detailTap + '&appName=' + this.data.appTitle + '&listening=false&index=' + everyIndex
			})
		}


	},
	handleTouchEnd(e) {
		let that = this;

		this.setData({
			endWidth: e.changedTouches[0].clientX,
			isVideo: false,
			first: false
		}, () => {
			if (that.data.startsWidth >= that.data.screenWidth / 2) {
				if (that.data.startsWidth - that.data.endWidth >= that.data.screenWidth / 4) {
					that.setData({
						loadding: false,
						scrollTop: that.data.scrollTop = 0,
						scrollLeft: that.data.scrollLeft + 50,
						templateFlag: true,
						currentTabIndex: ++that.data.currentTabIndex,
						isMore: true,
						list: []
					}, () => {
						const currentListInstance = that.data.lists[that.data.currentTabIndex];
						if (that.data.currentTabIndex !== that.data.lists.length) {
							gdt.magicListItemFirstLoad(currentListInstance._id).then((res) => {
								that.handleShowTopic(that.data.lists, that.data.currentTabIndex)
								that.setData({
									loadding: true
								})
							});
						}
					});

					if (that.data.currentTabIndex === that.data.lists.length) {
						that.setData({
							currentTabIndex: 0
						})
						that.setData({
							scrollLeft: that.data.scrollLeft = -100,
							loadding: true,
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
						that.setData({
							scrollLeft: that.data.scrollLeft = 0
						});
					}

					that.setData({
						currentTabIndex: --that.data.currentTabIndex,
						list: [],
						loadding: false,
					}, () => {

						const currentListInstance = that.data.lists[that.data.currentTabIndex];
						if (!currentListInstance.length) {
							that.handleShowTopic(that.data.lists, that.data.currentTabIndex)
							gdt.magicListItemFirstLoad(currentListInstance._id).then((res) => {
								that.setData({
									loadding: true
								})

							});
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
		this.setData({
			startsWidth: e.changedTouches[0].clientX
		})
	},
	jumpToCheck() {
		wx.navigateTo({
			url: '/pages/check/check',
			success: () => {
				gdt.track('into-check-from-index');
			}
		});
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
		this.setData({
			isModal: false
		})
	},

	// 分割线

	onLoad: function (options) {
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
				this.setData({
					type1: 'share'
				});
			});
		});
		let randomNum = parseInt(Math.random() * 60 + 30);
		gdt.userInfo.then((res) => {
			this.setData({
				isModal: false
			})
		}).catch(() => {
			this.setData({
				isModal: true
			})
		})
		gdt.appName.then((x) => {
			wx.setNavigationBarTitle({
				title: x,
			});
			this.data.appTitle = x;
		});
		gdt.ready.then((app) => {
			if (app.settings.rewardPointSubsystemEnabled) {
				this.setData({
					enable: true
				})
			}
			this.appState = app;
			if (app.title) {
				wx.setNavigationBarTitle({
					title: app.title,
					setting: app.settings
				});
			}

			this.setData({
				appTitle: app.title,
				coverUrl: app.avatarUrl,
				dashboardTipShouldDisplay: app.localStorage.dashboardTipShouldDisplay === false ? false : true
			});

			gdt.on("storageSet", (k, v) => {
				if (k === 'dashboardTipShouldDisplay') {
					this.setData({
						dashboardTipShouldDisplay: v
					});
				}
			})
			gdt.on('listItems', (listId, updateRange, itemList) => {
				const itemIndex = this.appState.itemIndex;
				for (const _item of itemList) {
					const item = itemIndex[_item._id] || {};
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
				}

				this.setData({
					lists: app.lists
				});
			});

			gdt.on('entityUpdate', (x) => {
				const itemIndex = this.appState.itemIndex;
				let this_ = this;
				setTimeout(() => {
					this_.setData({
						lists: app.lists
					});
				}, 500)

			});
			this.setData({
				loadding: true
			})
			if (options && options.listId) {
				const pickedList = _.find(app.lists, { _id: options.listId });
				const offset = app.lists.indexOf(pickedList);
				if (offset >= 0) {
					this.setData({
						currentTabIndex: offset
					});
				}
			}

			if (app.toplistEnabled !== false) {
				if (app.lists[0] !== app.listIndex['topScoreds']) {
					app.lists.unshift(app.listIndex['topScoreds']);
				}
				gdt.magicListItemFirstLoad('topScoreds').then((res) => {
					const theList = app.listIndex['topScoreds'];
					let arr = theList.items.slice(0, 3);

					this.setData({
						lists: app.lists,
						imgUrls: arr
					});
				});
			}

			if (options && options.listId) {
				const pickedList = _.find(app.lists, { _id: options.listId });
				const offset = app.lists.indexOf(pickedList);
				if (offset >= 0) {
					this.setData({
						currentTabIndex: offset
					});
				}
			}
			const t0Tab = app.lists[this.data.currentTabIndex || 0];
			if (t0Tab && t0Tab._id !== 'topScoreds') {
				gdt.magicListItemFirstLoad(t0Tab._id).then((res) => {
					this.handleShowTopic(app.lists, this.data.currentTabIndex)
					this.setData({
						lists: app.lists,
						loadding: true
					})
				});
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
		gdt.currentUser.then((u) => {
			this.data.uid = u._id;
			this.data.nickName = this.data.nickName || u.nickName;
			gdt.getDailyMissions().then((res) => {
				const missions = res.missions || [];
				missions.forEach(item => {
					if (item.type == 'showup') {
						this.setData({
							IsChecked: !item.completed
						})
					}
				})
			})
		});


		gdt.baseServerUri.then((res) => {
			this.setData({
				staticUrl: res.split('/')[2],
				baseImageUrlMy: 'https://' + res.split('/')[2] + '/static/images/my.png',
				baseImageUrlP1: 'https://' + res.split('/')[2] + '/static/images/1.png',
				baseImageUrlP2: 'https://' + res.split('/')[2] + '/static/images/2.png',
				baseImageUrlP3: 'https://' + res.split('/')[2] + '/static/images/3.png',
				baseImageUrlNew: 'https://' + res.split('/')[2] + '/static/images/new.png',
				baseImageUrlNo1: 'https://' + res.split('/')[2] + '/static/images/no1.png',
				baseImageUrlNo2: 'https://' + res.split('/')[2] + '/static/images/no2.png',
				baseImageUrlNo3: 'https://' + res.split('/')[2] + '/static/images/no3.png',
				baseImageUrlPlay: 'https://' + res.split('/')[2] + '/static/images/play.png',
				baseImageUrlAllStar: 'https://' + res.split('/')[2] + '/static/images/allStar.png'
			})
		})
		gdt.baseServerUri.then((res1) => {
			gdt.distroId.then((res3) => {
				this.setData({
					base: res1 + '/' + res3 + '/simpleTopic/'
				})
			})
		})

	},
	//显示topic
	handleShowTopic(list, currentTabIndex) {
		console.log(list);
		console.log(currentTabIndex)
		let arr = [];
		list[currentTabIndex].items.map((item) => {
			if (item.type == 'simpleTopic') {
				arr.push(item)
			}
		})
		this.setData({
			topic: arr
		})
	},

	//上拉加载
	onReachBottom: function () {
		wx.showLoading({
			title: '加载中',
			icon: 'loadding'
		})
		const currentListInstance = this.data.lists[this.data.currentTabIndex];
		if (currentListInstance) {
			gdt.magicListItemLoadMore(currentListInstance._id).then(() => {
				wx.hideLoading()
				gdt.track('item-list-load-more', {
					listId: currentListInstance._id,
					title: currentListInstance.title,
					acc: currentListInstance.items.length
				});
			});
		}
		gdt.getDailyMissions().then((res) => {
			const missions = res.missions || [];
			missions.forEach(item => {
				if (item.type == 'showup') {
					this.setData({
						IsChecked: !item.completed
					})
				}
			})
		})
	},
	//下拉刷新
	onPullDownRefresh: function () {
		const currentListInstance = this.data.lists[this.data.currentTabIndex];
		wx.showLoading({
			title: '加载中',
			icon: 'loadding'
		})
		let that = this;
		if (currentListInstance) {
			gdt.magicListItemLoadLatest(currentListInstance._id).then(() => {
				wx.hideLoading()
				gdt.track('item-list-refresh', {
					listId: currentListInstance._id,
					title: currentListInstance.title
				});
				setTimeout(() => {
					wx.stopPullDownRefresh();
				}, 500);
			});
		}
		gdt.getDailyMissions().then((res) => {
			const missions = res.missions || [];
			missions.forEach(item => {
				if (item.type == 'showup') {
					this.setData({
						IsChecked: !item.completed
					})
				}
			})
		})
	},
	getFormID: function (e) {
		if (e.detail.formId) {
			gdt.collectTplMessageQuotaByForm(e.detail.formId);
		}

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
	//支持
	handleSupport(e) {
		gdt.userInfo.then((x) => {
			this.setData({
				type: "",
				type1: 'share',
				nickName: x.userInfo.nickName
			});
			let votePage = e.currentTarget.dataset.votepage
			let num = e.currentTarget.dataset.num;
			let id = e.currentTarget.dataset.item._id
			let supportId = e.currentTarget.dataset.item.surveyOptions[num]._id;
			let obj = {}
			obj.supportId = supportId;
			obj.id = id;
			obj.num = num;
			if (votePage == 'index' && !e.currentTarget.dataset.item.voted) {
				gdt.supportOption(obj).then((res) => {
					wx.showToast({
						title: '投票成功',
						duration: 2000
					})
				}).catch(() => {
					wx.showToast({
						title: '投票失败',
						duration: 2000
					})
				})
			}
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


	}

})

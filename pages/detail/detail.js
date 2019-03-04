let app = getApp().globalData;
const gdt = app.applicationDataContext;
import { formatSeconds } from '../../utils/util'
const innerAudioContext = app.backgroundAudioManager
Page({
	data: {
		appName: '',
		nodes: [],
		rootClassMixin: '',
		isShow: true,
		shareButton: '../../images/share.png',

		isRoot: false,

		src: '',
		isLike: false,

		uid: '',

		bgImg: '',
		articleId: '',
		shareId: '',
		isIphoneX: false,
		article: {},
		iPhoneX: false,
		art: '',
		type: '',
		type1: '',
		num: 0,
		// --- For view tracking ---

		viewId: '',
		suspendedFor: 0,
		lastSuspendedAt: undefined,
		enteredAt: undefined,

		reportScrollTimeoutHandler: undefined,
		scrollStartedAt: undefined,
		scrollStartPos: undefined,
		viewPercentage: 0,
		nickName: '',
		shareName: '',
		isShowPoster: false,
		imgPath: '',
		logo: '',
		articalTitle: '',
		articalDescribe: '',
		numArtical: 200,
		numFriend: 90,
		ratio: 0,

		entityId: undefined,
		entity: {},
		fullPicture: {},
		//推荐视频
		recommendations: [],
		videoSource: [],
		videoId: undefined,
		selectedCricle: 0,
		isMuted: true,
		//音频的播放和暂停的开关
		isPlay: false,
		isChangeBig: false,
		currentTime: 0,
		totalTime: 0,
		currentProgress: 0,
		totalProgress: 0,
		clickIndex: 0,
		audioName: '',
		isShowListen: true,
		isPause: false,
		// 视频为图片
		isPlayVideo: false,
		isFirst: 0,
		videoCurrent: 0,
		// saveToCamera: 'openSetting',
		currentVideo: 0,
		btnSavePitcureLetter: '',
		reportSubmit: true,
		baseImageUrlYinHao: undefined,
		showLoadding: false,
		listenTablistCurrent: undefined,
		votePage: 'detail',
		vote: [],
	},

	handleChangeTypeVideo: function (e) {
		this.setData({
			isPlayVideo: true,
			videoCurrent: e.currentTarget.dataset.index

		})

	},

	// 点击切换视频
	handleVideo: function (e) {
		this.setData({ currentVideo: e.currentTarget.dataset.index });
		let qPromise;
		const scene = gdt.showParam.scene;
		qPromise = gdt.fetchEntityDetail(e.currentTarget.dataset.id, {
			scene: scene,
			keepH5Links: true,
			mapSrc: 'data',
			overrideStyle: 'false',
			fixWxMagicSize: 'true'
		});
		qPromise.then((r) => {
			if (r.entity) {
				const currentTitle = r.entity.title;
				wx.setNavigationBarTitle({
					title: currentTitle,
				});
			};

			this.setData({ recommendations: r.recommendations, fullPicture: r, entityId: r.entity.id, entity: r.entity, shareId: r.refId, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });

			gdt.track('detail-load', { itemId: r.entity._id, title: r.entity.title, refId: r.refId, viewId: r.viewId, type: r.entity.type });
		})

	},
	onShareAppMessage: function () {
		if (this.data.entityId) {
			gdt.trackShareItem(this.data.entityId, {
				pos: this.data.viewPercentage,
				view: this.data.viewId,
				tPlus: Date.now() - (this.data.enteredAt || 0) - this.data.suspendedFor
			});
			gdt.track('share-item', { itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });

		}
		return {
			title: this.data.entity.title || '默认转发标题',
			path: `pages/detail/detail?ref=${this.data.shareId}&refee=${this.data.uid}&id=${this.data.entityId}&nickName=${this.data.nickName}&appName=${this.data.appName}`
		}
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
			gdt.track('detail-capture-screen');
		})

		wx.getSetting({
			success: res => {
				if (!res.authSetting['scope.writePhotosAlbum']) {
					this.setData({ btnSavePitcureLetter: '保存到相册' })
				} else {
					this.setData({ btnSavePitcureLetter: '已保存到相册，记得分享哦' })
				}
			}
		})

		const now = Date.now();
		const lastSuspendAt = this.data.lastSuspendAt;
		if (lastSuspendAt) {
			const dt = now - lastSuspendAt;
			this.data.suspendedFor = (this.data.suspendedFor || 0) + dt;
			this.data.lastSuspendAt = null;

		} else {
			this.data.lastSuspendAt = null;

		}
		gdt.track('show-detail', { itemId: this.data.entityId, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });
	},
	//授权的时候发生的
	handleAuthor: function (e) {

		if (e.detail && e.detail.userInfo) {
			gdt.emit('userInfo', e.detail);
		}

	},

	handleLikeButtonTapped: function (e) {
		gdt.userInfo.then(() => {
			this.setData({ isLike: !this.data.isLike }, () => {
				if (this.data.isLike) {
					gdt.likeItem(this.data.entityId);
					gdt.track('like-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
				} else {
					gdt.unlikeItem(this.data.entityId);
					gdt.track('unlike-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
				}
			});
		}).catch(() => {
			gdt.once('userInfo', () => {
				this.setData({ isLike: !this.data.isLike }, () => {
					if (this.data.isLike) {
						gdt.track('like-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
						gdt.likeItem(this.data.entityId);
					} else {
						gdt.unlikeItem(this.data.entityId);
						gdt.track('unlike-item', { itemId: this.data.entityId, viewId: this.data.viewId, type: this.data.entity.type });
					}
				});
			});
		});

	},
	onLoad(options) {
		this.setData({ listenTablistCurrent: options.listenTablistCurrent })
		if (options.listening == 'false') {
			this.setData({ isPlay: false, isFirst: 0 })

		} else if (options.listening == 'undefined') {
			this.setData({ isPlay: false, isFirst: 0 })
		}
		else {
			this.setData({ isPlay: true, isFirst: 1 })
		}
		this.setData({ clickIndex: options.index })

		gdt.systemInfo.then((x) => {
			this.setData({
				ratio: x.windowWidth * 2 / 750,
			});
			let modelmes = x.model;
			if (modelmes.search('iPhone X') != -1) {
				this.setData({
					isIphoneX: true,
				});
			}
		});

		gdt.currentUser.then((u) => {
			this.data.uid = u._id;
		});

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
		const scene = gdt.showParam.scene;
		if (getCurrentPages()[0] === this) {
			this.setData({ isRoot: true });
		}
		let qPromise;
		let { id, nickName, ref, appName, refee } = options;
		const entityId = id;
		this.setData({ art: entityId, shareName: nickName, entityId: entityId, appName: appName });
		if (getCurrentPages()[0] === this) {
			this.setData({ isRoot: true });
		}

		if (id) {
			qPromise = gdt.fetchEntityDetail(entityId, {
				scene: scene,
				keepH5Links: true,
				mapSrc: 'data',
				overrideStyle: 'false',
				fixWxMagicSize: 'true',
				ref: ref,
				refee: refee,
				mode: 'flow'
			});
		} else if (options.scene) {
			let referencers = (options.scene);
			qPromise = gdt.fetchEntityDetailByReferenceId(referencers, {
				scene: scene,
				keepH5Links: true,
				mapSrc: 'data',
				overrideStyle: 'false',
				fixWxMagicSize: 'true',
				mode: 'flow'
			});
		} else {
			throw new Error('No idea what to load');
		}

		qPromise.then((r) => {
			if (r.entity) {
				const currentTitle = r.entity.title;
				wx.setNavigationBarTitle({
					title: currentTitle,
				});
			};
			if (r.entity.type == 'wxArticle') {
				this.setData({ videoId: r.entity.txvVids[0], videoSource: r.entity.txvVids })
			}
			if (r.entity.annotations) {
				let enti = r.entity.annotations[0]
				let one = enti.surveyOptions[0].totalSupporters;
				let two = enti.surveyOptions[1].totalSupporters;

				let total = one + two;
				if (total == 0) {
					enti.m = 0;
					enti.n = 0;
				} else {
					let a = parseInt(((one / total).toFixed(2)) * 100)
					enti.m = a;
					enti.n = 100 - a;
				};
				this.setData({ vote: r.entity.annotations[0] })
			}
			this.setData({ showLoadding: true })

			this.setData({ recommendations: r.recommendations || [], nodes: r.nodes, rootClassMixin: (r.parentClasses || []).join(' '), fullPicture: r, entityId: r.entity.id, entity: r.entity, shareId: r.refId, isLike: r.liked, viewId: r.viewId, enteredAt: Date.now() });

			gdt.track('detail-load', { itemId: r.entity._id, title: r.entity.title, refId: r.refId, viewId: r.viewId, type: r.entity.type });
			// this.setData({ clickIndex: options.index })
			if (options.listening && options.index == this.data.clickIndex) {
				innerAudioContext.title = this.data.entity.title;
				let this_ = this;
				innerAudioContext.onTimeUpdate(() => {
					this_.setData({
						currentTime: parseInt(innerAudioContext.currentTime),
						totalTime: parseInt(innerAudioContext.duration),
						currentProgress: formatSeconds(parseInt(innerAudioContext.currentTime)),
						totalProgress: formatSeconds(parseInt(innerAudioContext.duration))
					})
				})
			} else {
			}


		})
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlCircle: 'https://' + res.split('/')[2] + '/static/images/circle.png',
				baseImageUrlHome: 'https://' + res.split('/')[2] + '/static/images/goHome.png ',
				baseImagePlay: 'https://' + res.split('/')[2] + '/static/images/play.png',
				baseImageUrlAllStar: 'https://' + res.split('/')[2] + '/static/images/allStar.png',
				baseImageUrlYinHao: 'https://' + res.split('/')[2] + '/static/images/yinHao.png',
			})
		})

	},

	//回到首页
	handleCallBack: function () {
		if (this.data.art != '') {
			wx.navigateTo({
				url: '/pages/index/index'
			})
		} else {
			wx.navigateBack({
				url: '/pages/index/index'
			})
		}
	},

	onHide: function () {
		this.setData({ lastSuspendAt: Date.now() });
	},
	onUnload: function () {
		if (this.data.viewId && this.data.entityId) {
			gdt.trackLeftViewing(this.data.entityId, this.data.viewId, Date.now() - this.data.enteredAt - this.data.suspendedFor);
			gdt.track('detail-close', {
				itemId: this.data.entityId,
				type: this.data.entity.type,
				viewId: this.data.viewId,
				duration: Date.now() - this.data.enteredAt - this.data.suspendedFor
			});
		}
		var pages = getCurrentPages();
		var currPage = pages[pages.length - 1];  //当前选择好友页面
		var prevPage = pages[pages.length - 2]; //上一个编辑款项页面
		//直接调用上一个页面的setData()方法，把数据存到上一个页面即编辑款项页面中去  
		if (this.data.isFirst != 0) {
			prevPage.setData({
				listenIndexCurrent: this.data.clickIndex,
				listening: this.data.isPlay,
				letter: this.data.isPlay,
				listenTablistCurrent: this.data.listenTablistCurrent
			});

		}


	},

	//滑到底部
	bindscrolltolower: function () {
		this.setData({ isShow: true });
	},

	//滑动中
	recordUserscroll: function (event) {
		if (event.detail.scrollTop < 0) {
			return
		}
		let num1 = event.detail.scrollTop;
		const scene = gdt.showParam.scene;
		if (num1 > this.data.num) {
			this.setData({ isShow: false, isChangeBig: false, isShowListen: false });
			if (getCurrentPages()[0].route === 'pages/detail/detail') {
				this.setData({ isShare: false });
			}

		} else {
			this.setData({ isShow: true, isChangeBig: false, isShowListen: true });
			if (getCurrentPages()[0].route === 'pages/detail/detail') {
				this.setData({ isShare: true });
			}


		}
		this.data.num = num1;
		if (!(event && event.type === 'scroll')) {
			return;
		}
		if (this.data.reportScrollTimeoutHandler) {
			clearTimeout(this.data.reportScrollTimeoutHandler);
		}
		if (!this.data.scrollStartedAt) {
			this.data.scrollStartedAt = Date.now();
			this.data.scrollStartPos = event.detail.scrollTop + event.detail.deltaY;
		}
		this.data.reportScrollTimeoutHandler = setTimeout(function () {
			this.data.viewPercentage = (event.detail.scrollTop / event.detail.scrollHeight) * 100;
			if (this.data.viewId && this.data.entityId) {

				gdt.track('detail-scroll', {
					type: this.data.entity.type,
					itemId: this.data.entityId,
					viewId: this.data.viewId,
					tPlus: this.data.scrollStartedAt - this.data.enteredAt - this.data.suspendedFor,
					duration: Date.now() - this.data.scrollStartedAt,
					startPos: (this.data.scrollStartPos / event.detail.scrollHeight) * 100,
					endPos: this.data.viewPercentage
				});
			}
			this.data.scrollStartedAt = undefined;

		}.bind(this), 500);

	},
	handleBack: function (e) {
		wx.reLaunch({
			url: '/pages/index/index'
		})
	},
	getFormID: function (e) {
		if (e.detail.formId) {
			gdt.collectTplMessageQuotaByForm(e.detail.formId);
		}
	},

	handleDrowPicture: function () {
		this.setData({ isShowPoster: true })
		let ratio = this.data.ratio;
		let that = this;
		wx.showLoading({
			title: '正在生成图片...',
			mask: true,
		});
		let artical = gdt.fetchEntityMeta(this.data.entityId);
		let downAvatar = gdt.downloadMyAvatar();
		let downCode = gdt.downloadWxaCode(320, 'pages/detail/detail', this.data.shareId, 'auto')
		Promise.all([artical, downAvatar, downCode]).then((res) => {
			let yOffset = 30 * ratio;
			//绘制标题背景
			const ctx = wx.createCanvasContext('shareCanvas');
			ctx.setFillStyle('#ffffff')
			ctx.fillRect(0, 0, 320 * ratio, 450 * ratio);

			// 绘制通话的框
			ctx.moveTo(68 * ratio, 62 * ratio)
			ctx.lineTo(75 * ratio, 52 * ratio);
			ctx.lineTo(75 * ratio, 72 * ratio);
			ctx.closePath()
			// ctx.setFillStyle('#e9ecfa');
			ctx.setStrokeStyle('#ffffff')
			ctx.stroke()
			// 绘制接口的文章数量和分享和背景
			ctx.rect(75 * ratio, 46 * ratio, 226 * ratio, 80 * ratio)
			const grd = ctx.createLinearGradient(75 * ratio, 60 * ratio, 226 * ratio, 80 * ratio)
			grd.addColorStop(0, '#545454')
			grd.addColorStop(0.2, '#505050')
			grd.addColorStop(0.4, '#4a4a4a')
			grd.addColorStop(0.5, '#474747')
			grd.addColorStop(0.66, '#434343')
			grd.addColorStop(0.83, '#3c3c3c')
			grd.addColorStop(1, '#383838')
			ctx.setFillStyle(grd)
			ctx.fill();
			// 绘制数字
			ctx.font = 'normal bold 20rpx sans-serif';


			const numArtical = res[0].readingMeta.nthRead + '';
			// const numArtical = 215+ '';
			ctx.setFontSize(20 * ratio);
			ctx.setFillStyle('#fff');
			ctx.fillText(numArtical, 148 * ratio, 96 * ratio);
			let type = ''
			if (this.data.entity.type == 'wxArticle') {
				type = '阅读的'
			} else {
				type = '观看的'
			}

			const bigTitle = ('这是我在' + this.data.appName + '小程序')
			ctx.setFontSize(12 * ratio)
			ctx.setFillStyle('#fff');
			ctx.fillText(bigTitle, 100 * ratio, 74 * ratio);

			const bigTitleType = (type + '第')
			ctx.setFontSize(12 * ratio)
			ctx.setFillStyle('#fff');
			ctx.fillText(bigTitleType, 100 * ratio, 96 * ratio);

			const friend = ('篇已经有')
			ctx.setFontSize(12 * ratio)
			ctx.setFillStyle('#fff');

			const my = (' 个好友')
			ctx.setFontSize(12 * ratio)
			ctx.setFillStyle('#fff');

			const numFriend = res[0].readingMeta.referencers + '';
			// const numFriend = 8+ '';
			if (numArtical.length === 1) {
				ctx.fillText(friend, 164 * ratio, 96 * ratio);
				ctx.fillText(my, 238 * ratio, 96 * ratio);
				ctx.save();
				ctx.font = 'normal bold 36rpx sans-serif';
				if (numFriend.length === 1) {
					ctx.setFontSize(20  * ratio)
					ctx.fillText(numFriend, 216 * ratio, 96 * ratio);
				} else if (numFriend.length === 2) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 216 * ratio, 96 * ratio);
				} else if (numFriend.length === 3) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 216 * ratio, 96 * ratio);
				}
				ctx.restore()
			} else if (numArtical.length === 2) {
				ctx.fillText(friend, 174 * ratio, 96 * ratio);
				ctx.fillText(my, 248 * ratio, 96 * ratio);
				ctx.save();
				ctx.font = 'normal bold 36rpx sans-serif';
				if (numFriend.length === 1) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 228 * ratio, 96 * ratio);
				} else if (numFriend.length === 2) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 228 * ratio, 96 * ratio);
				} else if (numFriend.length === 3) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 228 * ratio, 96 * ratio);
				}
				ctx.restore()
			} else if (numArtical.length === 3) {
				ctx.fillText(friend, 188 * ratio, 96 * ratio);
				ctx.fillText(my, 255 * ratio, 96 * ratio);
				ctx.save();
				ctx.font = 'normal bold 36rpx sans-serif';
				if (numFriend.length === 1) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 239 * ratio, 96 * ratio);
				} else if (numFriend.length === 2) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 234 * ratio, 96 * ratio);
				} else if (numFriend.length === 3) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 232 * ratio, 96 * ratio);
				}
				ctx.restore()
			} else if (numArtical.length === 4) {
				ctx.fillText(friend, 199 * ratio, 96 * ratio);
				ctx.fillText(my, 268 * ratio, 96 * ratio);
				ctx.save();
				ctx.font = 'normal bold 36rpx sans-serif';
				if (numFriend.length === 1) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 245 * ratio, 96 * ratio);
				} else if (numFriend.length === 2) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 258 * ratio, 96 * ratio);
				} else if (numFriend.length === 3) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 265 * ratio, 96 * ratio);
				}
				ctx.restore()
			} else if (numArtical.length === 5) {
				ctx.fillText(friend, 209 * ratio, 96 * ratio);
				ctx.fillText(my, 278 * ratio, 96 * ratio);
				ctx.save();
				ctx.font = 'normal bold 36rpx sans-serif';
				if (numFriend.length === 1) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 260 * ratio, 96 * ratio);
				} else if (numFriend.length === 2) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 270 * ratio, 96 * ratio);
				} else if (numFriend.length === 3) {
					ctx.setFontSize(20 * ratio)
					ctx.fillText(numFriend, 276 * ratio, 96 * ratio);
				}
				ctx.restore()
			}




			ctx.setFontSize(12 * ratio)
			ctx.setFillStyle('#fff');
			ctx.fillText('阅读了我的分享', 100 * ratio, 116 * ratio);
			// 绘制双引号
			let yinHao = this.data.baseImageUrlYinHao;
			ctx.drawImage(yinHao, 80 * ratio, 56 * ratio, 14 * ratio, 14 * ratio)

			// 绘制头像
			const imgPath = res[1];
			ctx.save()
			ctx.beginPath()
			ctx.arc(40 * ratio, 47 * ratio, 23 * ratio, 0, 2 * Math.PI)
			ctx.clip()
			ctx.drawImage(imgPath, 17 * ratio, 24 * ratio, 46 * ratio, 46 * ratio)
			ctx.restore()

			//绘制文章标题
			const goodsTitle = this.data.nickName;
			let goodsTitleArray = [];
			//为了防止标题过长，分割字符串,每行18个
			for (let i = 0; i < goodsTitle.length / 18; i++) {
				if (i > 2) {
					break;
				}
				goodsTitleArray.push(goodsTitle.substr(i * 18, 18));
			}
			yOffset = 40 * ratio;
			goodsTitleArray.forEach(function (value) {
				ctx.setFontSize(14 * ratio);
				ctx.setFillStyle('#666666');
				ctx.fillText(value, 80 * ratio, yOffset);
				yOffset += 25 * ratio;
			});
			// 绘制文章的标题和描述
			const describe = this.data.entity.bref || '哎呀！这篇文章没摘要，扫码查看文章详情吧～';
			let canvasDescribe

			//z绘制描述
			ctx.save();
			ctx.font = 'normal normal 28rpx sans-serif';
			ctx.setFontSize(14 * ratio)
			ctx.setFillStyle('#666666');
			if (describe.length < parseInt(19 / ratio)) {
				canvasDescribe = describe;

				ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);
			} else if (describe.length < parseInt(38 / ratio) && describe.length > parseInt(19 / ratio)) {
				canvasDescribe = describe.slice(0, parseInt(19 / ratio));
				ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

				let canvasDescribe1 = describe.slice(parseInt(19 / ratio), describe.length);
				ctx.fillText(canvasDescribe1, 30 * ratio, 230 * ratio, 260 * ratio);

			} else {
				canvasDescribe = describe.slice(0, parseInt(19 / ratio));
				ctx.fillText(canvasDescribe, 30 * ratio, 210 * ratio, 260 * ratio);

				let canvasDescribe2 = describe.slice(parseInt(19 / ratio), parseInt(38 / ratio)) + '...';
				ctx.fillText(canvasDescribe2, 30 * ratio, 230 * ratio, 260 * ratio);

			}
			ctx.restore()

			ctx.moveTo(30 * ratio, 260 * ratio)
			ctx.setStrokeStyle('#F0F0F0');
			ctx.lineTo(300 * ratio, 260 * ratio)
			ctx.stroke()
			//小程序二维码
			const code = res[2];
			ctx.drawImage(code, 20 * ratio, 270 * ratio, 96 * ratio, 96 * ratio)

			//绘制长按小程序
			let miniApp = '长按识别,进入小程序'
			ctx.setFontSize(14 * ratio)
			ctx.setFillStyle('#333333');
			ctx.fillText(miniApp, 130 * ratio, 300 * ratio, 220 * ratio);

			let miniAppShare = '分享来自'
			ctx.setFontSize(14 * ratio)
			ctx.setFillStyle('#333333');
			ctx.fillText(miniAppShare, 130 * ratio, 326 * ratio, 220 * ratio);
			ctx.font = 'normal normal 28rpx sans-serif';
			let appName = '「' + this.data.appName + '」';
			ctx.setFontSize(18 * ratio)
			ctx.setFillStyle('#000');
			ctx.fillText(appName, 124 * ratio, 346 * ratio, 220 * ratio);


			const title = this.data.entity.title;
			let canvasTtile
			if (title.length < parseInt(14 / ratio)) {
				canvasTtile = title;
			} else {
				canvasTtile = title.slice(0, parseInt(14 / ratio)) + '...'
			}
			ctx.font = 'normal bold 28rpx sans-serif';
			ctx.setFontSize(18 * ratio)
			ctx.setFillStyle('#333333');

			ctx.fillText(canvasTtile, 30 * ratio, 180 * ratio, 260 * ratio);
			ctx.draw();

			//绘制之后加一个延时去生成图片，如果直接生成可能没有绘制完成，导出图片会有问题。
			setTimeout(function () {
				wx.canvasToTempFilePath({
					x: 0,
					y: 0,
					width: 320 * ratio,
					height: 370 * ratio,
					destWidth: 1280,
					destHeight: 1480,
					fileType: 'jpg',
					quality: 1,
					canvasId: 'shareCanvas',
					success: function (res) {
						that.setData({
							shareImage: res.tempFilePath,
							showSharePic: true
						}, () => {
							wx.saveImageToPhotosAlbum({
								filePath: that.data.shareImage,
								success: function () {
									console.log('保存成功');
									app.saveToCamera = ''

								},
								fail: function () {
									console.log('保存失败');
									app.saveToCamera = 'openSetting'
								}
							})
						})
						wx.hideLoading();
					},
					fail: function (res) {
						console.log(res)
						wx.hideLoading();
					}
				})
			}, 2000);
		})


	},


	handlePoster: function () {
		gdt.userInfo.then(() => {
			this.handleDrowPicture();
			gdt.trackShareItem(this.data.entityId, {
				pos: this.data.viewPercentage,
				view: this.data.viewId,
				tPlus: Date.now() - (this.data.enteredAt || 0) - this.data.suspendedFor
			});
			gdt.track('share-item', { itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });
		}).catch(() => {
			gdt.once('userInfo', () => {
				gdt.trackShareItem(this.data.entityId, {
					pos: this.data.viewPercentage,
					view: this.data.viewId,
					tPlus: Date.now() - (this.data.enteredAt || 0) - this.data.suspendedFor
				});
				this.handleDrowPicture();
				gdt.track('share-item', { itemId: this.data.entityId, title: this.data.entity.title, refId: this.data.shareId, viewId: this.data.viewId, type: this.data.entity.type });
			});
		})
	},
	handleSavePicture: function () {
		this.setData({ isShowPoster: false });
		if (app.saveToCamera == 'openSetting') {
			wx.openSetting({
				success(res) {
					console.log(res.authSetting);

					// res.authSetting = {
					//   "scope.userInfo": true,
					//   "scope.userLocation": true
					// }
				}
			})
		}

	},

	handleSavePictureToCamera: function () {
		var that = this;
		//获取相册授权
		wx.openSetting({
			success(res) {
				console.log(res.authSetting)
				// res.authSetting = {
				//   "scope.userInfo": true,
				//   "scope.userLocation": true
				// }
			}
		})
	},
	handleAuthorToPlay: function () {
		gdt.userInfo.then(() => {
			this.handlePlayVideo()
		}).catch(() => {
			gdt.once('userInfo', () => {
				this.handlePlayVideo()
			});
		})
	},
	handleAuthorToPause: function () {
		gdt.userInfo.then(() => {
			this.handlePauseVideo()
		}).catch(() => {
			gdt.once('userInfo', () => {
				this.handlePauseVideo()
			});
		})
	},
	handlePlayVideo: function () {
		let that = this;
		innerAudioContext.title = this.data.entity.title
		if (!this.data.isPause) {
			const voiceId = (this.data.entity.wxmpVoiceIds || [])[0];
			innerAudioContext.src = 'https://res.wx.qq.com/voice/getvoice?mediaid=' + voiceId;
		}
		this.setData({ isPlay: true })

		innerAudioContext.play();
		innerAudioContext.onEnded(() => {
			this.setData({ isPlay: false })
		})
		// 时间的当前的进度;

		innerAudioContext.onTimeUpdate(() => {
			that.setData({
				isFirst: 1,
				currentTime: parseInt(innerAudioContext.currentTime),
				totalTime: parseInt(innerAudioContext.duration),
				currentProgress: formatSeconds(parseInt(innerAudioContext.currentTime)),
				totalProgress: formatSeconds(parseInt(innerAudioContext.duration))
			})
		})


	},
	handlePauseVideo: function () {
		innerAudioContext.pause();
		this.setData({ isPlay: false, isPause: true, isFirst: 1, })
	},

	//拖动过程中的一些处理
	handleChanging: function (e) {
		let that = this;
		this.setData({
			isPlay: true, isPause: false, isFirst: 1,
			currentTime: e.detail.value,
			currentProgress: formatSeconds(parseInt(e.detail.value)),
		})
		innerAudioContext.seek(e.detail.value);
		innerAudioContext.onTimeUpdate(() => {
			that.setData({
				currentTime: parseInt(innerAudioContext.currentTime),
				totalTime: parseInt(innerAudioContext.duration),
				currentProgress: formatSeconds(parseInt(innerAudioContext.currentTime)),
				totalProgress: formatSeconds(parseInt(innerAudioContext.duration))
			})
		})

	},
	//支持
	handleSupport(e) {
		gdt.userInfo.then((x) => {
			this.setData({
				type: "",
				type1: 'share',
				nickName: x.userInfo.nickName
			});
			let votePage = e.currentTarget.dataset.votepage;
			let num = e.currentTarget.dataset.num;
			let id = e.currentTarget.dataset.item._id
			let supportId = e.currentTarget.dataset.item.surveyOptions[num]._id;
			let obj = {}
			obj.supportId = supportId;
			obj.id = id;
			obj.num = num;
			obj.params = e.currentTarget.dataset.item;
			if (votePage == 'detail'&& !obj.params.voted) {
				gdt.supportOptionDetail(obj).then((res) => {
					wx.showToast({
						title: '投票成功',
						duration: 2000
					})
					let obj = this.data.vote;
					obj.voteFor = res.surveyVoteFor;
					obj.surveyOptions[num].totalSupporters = obj.surveyOptions[num].totalSupporters + 1
					obj.voted = true;
					let one = obj.surveyOptions[0].totalSupporters;
					let two = obj.surveyOptions[1].totalSupporters;
					let total = one + two;
					if (total == 0) {
						obj.m = 0;
						obj.n = 0;
					} else {
						let a = parseInt(((one / total).toFixed(2)) * 100)
						obj.m = a;
						obj.n = 100 - a;
					};

					gdt.userInfo.then((res) => {
						obj.surveyOptions[num].supporters.push(res.userInfo)
					})
					let that = this;
					setTimeout(function () {
						that.setData({ vote: obj })
					}, 500)
					// setTimeout(() => {
					// 	console.log(12)
					// 	that.setData({ vote: obj, a: 2 })
					// }, 500)


				}).catch(() => {
					// wx.showToast({
					// 	title: '投票失败',
					// 	duration: 2000
					// })
				})
			}
		}).catch(() => {
			this.setData({
				type: 'getUserInfo',
				type1: 'getUserInfo'
			});
			gdt.once('userInfo', () => {
				this.setData({ type1: 'share' });
			});
		});

	}

})

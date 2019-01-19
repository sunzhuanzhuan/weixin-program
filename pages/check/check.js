let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util')
Page({
	data: {
		url: '',
		reportSubmit: true,
		accountBalance: "",
		missions: [],
		ruleIsShow: false,
		checked: false, //控制button的显示内容
		isChecked: false, //控制签到的color
		month: null,
		day: null,
		level: 0,
		arrDate: [],
		dateArr: [],
		changeBox: false,
		page: 1,
		pageSize: 10,
		btnSavePitcureLetter: '',
	},
	onShow: function () {
		wx.getSetting({
			success: res => {
				if (!res.authSetting['scope.writePhotosAlbum']) {
					this.setData({ btnSavePitcureLetter: '保存到相册' })
				} else {
					this.setData({ btnSavePitcureLetter: '已保存到相册，记得分享哦' })
				}
			}
		})
	},
	onLoad: function (option) {
		this.setData({
			changeBox: false,
			// code: option.code
		})
		gdt.currentUser.then(() => gdt.getDailyMissions()).then((res) => {
			gdt.getReferral(this.data.page, this.data.pageSize).then((result) => {
				this.setData({
					totalBounses: result.totalBounses,
					totalReferencers: result.totalReferencers,
					detail: result.detail
				});
			})
			const missions = res.missions || [];
			const accountBalance = res.accountBalance.toFixed(2);
			let arrDateDuration = [];
			missions.forEach(item => {
				if (item.type == 'showup') {
					const level = item.payload.level;
					this.setData({
						checked: item.completed
					})
					arrDateDuration = item.payload.brefHistory;
					let rewards = item.payload.rewards
					this.setData({
						check: item,
						level: item.payload.level
					});
					let arrCheck = [];
					let today = util.moment().format("MM-DD");
					arrDateDuration.forEach((item, index) => {
						if (today == item.date) {
							item.date = '今天'
						}
						arrCheck[index] = new Object()
						arrCheck[index]['date'] = item.date;
						arrCheck[index]['shownUp'] = item.shownUp;
						arrCheck[index]['rewards'] = rewards[index];

					})
					console.log(arrCheck)
					this.setData({
						arrCheck: arrCheck
					});
				} else if (item.type == "articleShared") {
					this.setData({
						articleShared: item
					})
				} else if (item.type == 'articleRead') {
					this.setData({
						articleRead: item
					})
				} else {
					this.setData({
						shareBeenRead: item
					})
				}
			});

			// let arrCheck = [];
			// this.data.arrDate.forEach((item, index) => {
			// 	arrCheck[index] = new Object()
			// 	arrCheck[index]['number'] = item;
			// 	arrCheck[index]['name'] = arrDateDuration[index];

			// })
			// this.setData({
			// 	arrCheck: arrCheck
			// });
			// console.log(this.data.arrCheck)
			this.setData({
				accountBalance: accountBalance,
				missions: missions.slice(1)
			});
		});

		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlEq: 'https://' + res.split('/')[2] + '/static/images/xiaoyu.jpeg',
			})
		});
		gdt.systemInfo.then((x) => {
			this.setData({
				ratio: x.windowWidth * 2 / 750,
			});
		});
		if (option.box) {
			const that = this;

			this.setData({
				changeBox: true
			}, () => {
				let ratio = that.data.ratio;
				const ctx = wx.createCanvasContext('saveCanvas');
				ctx.setFillStyle('rgba(255, 255, 255, 1)');
				ctx.fillRect(10, 10, 280 * ratio, 322 * ratio);

				const changetext = ('兑换码');
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(changetext, 122 * ratio, 26 * ratio);

				ctx.setFillStyle('rgba(250,212,85,1)');
				ctx.fillRect(71 * ratio, 34 * ratio, 146 * ratio, 30 * ratio);
				// const code = this.data.code;
				const code = '122333';
				ctx.setTextBaseline('top')
				ctx.setFontSize(14 * ratio);
				ctx.setFillStyle('#000000');
				ctx.fillText(code, 76 * ratio, 39 * ratio);

				const knowEq = ('识别二维码也可以添加客服喔');
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(knowEq, 62 * ratio, 80 * ratio);

				const addChangegift = ('添加小鱼聚合客服小姐姐兑换礼物吧');
				ctx.setFontSize(12);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(addChangegift, 44 * ratio, 97 * ratio);

				const equrl = this.data.baseImageUrlEq;
				ctx.drawImage(equrl, 80 * ratio, 115 * ratio, 120 * ratio, 120 * ratio);

				const wxtext = '微信：xiaoyujuhe123';
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('#000000');
				ctx.fillText(wxtext, 84 * ratio, 239 * ratio);

				const payattention = '注意事项：';
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('#FF0000');
				ctx.fillText(payattention, 116 * ratio, 275 * ratio);

				const pay = '请务必保存好图片以防丢失后无法领取礼物!';
				ctx.setFillStyle('#FF0000');
				ctx.fillText(pay, 24 * ratio, 292 * ratio);
				ctx.draw();
				// setTimeout(function () {
				// 	wx.canvasToTempFilePath({
				// 		x: 0,
				// 		y: 0,
				// 		width: 320 * ratio,
				// 		height: 370 * ratio,
				// 		destWidth: 1280,
				// 		destHeight: 1480,
				// 		fileType: 'jpg',
				// 		quality: 1,
				// 		canvasId: 'saveCanvas',
				// 		success: function (res) {
				// 			that.setData({
				// 				shareImage: res.tempFilePath,
				// 				showSharePic: true
				// 			}, () => {
				// 				wx.saveImageToPhotosAlbum({
				// 					filePath: that.data.shareImage,
				// 					success: function () {
				// 						console.log('保存成功');
				// 						that.setData({
				// 							saveToCamera: ''
				// 						})

				// 					},
				// 					fail: function () {
				// 						console.log('保存失败');
				// 						that.setData({
				// 							saveToCamera: 'openSetting'
				// 						})
				// 					}
				// 				})
				// 			})
				// 			wx.hideLoading();
				// 		},
				// 		fail: function (res) {
				// 			console.log(res)
				// 			wx.hideLoading();
				// 		}
				// 	})
				// }, 2000);
			})
		}

	},
	jumptogift: function (e) {
		let accountBalance = e.currentTarget.dataset.score
		wx.navigateTo({
			url: '/pages/gift/gift?accountBalance=' + accountBalance
		});
	},
	/*活动规则点击弹出*/
	handleRule: function () {
		this.setData({
			ruleIsShow: !this.data.ruleIsShow,
		})
	},
	/*兑换商品的弹窗，点击确认保存客服的二维码*/
	savePic: function () {
		let that = this;
		console.log("保存");
		// 授权，获取写入相册的权限，保存图片到本地
		wx.getSetting({
			success(res) {
				console.log("baocun")
				if (!res.authSetting['scope.writePhotosAlbum']) {
					wx.authorize({
						scope: 'scope.writePhotosAlbum',
						success() {
							console.log("123412341564123")
							wx.saveImageToPhotosAlbum({
								filePath: that.data.eqPath,
								success() {
									console.log(that.data.eqPath);
									wx.showToast({
										title: '保存成功',
										success: () => {
											that.setData({
												changeBox: false
											})
										}
									})
								},
								fail() {
									console.log("save shibai le")
									wx.showToast({
										title: '保存失败',
										success: () => {
											that.setData({
												changeBox: false
											})
										}
									})
								}
							})
						}
					})
				}
			}
		})
	},
	/** 点击领取和去完成发生的动作 **/
	goToFinish: function (e) {
		if (e.target.dataset.criteriasatisfied == false) {
			wx.reLaunch({
				url: '/pages/index/index'
			})
		} else if (e.target.dataset.completed == false) {
			if (e.target.dataset.type == 'articleRead') {
				gdt.missionComplete('articleRead').then((res) => {
					const scoreAdd = res.transaction.amount;
					wx.showToast({
						title: '领取成功，获得' + scoreAdd + '积分',
						icon: 'none',
						duration: 1000,
						mask: true,
						success: () => {
							this.onLoad();
						}
					});
				})
			} else if (e.target.dataset.type == "articleShared") {
				gdt.missionComplete('articleShared').then((res) => {
					const scoreAdd = res.transaction.amount;
					wx.showToast({
						title: '领取成功，获得' + scoreAdd + '积分',
						icon: 'none',
						duration: 1000,
						mask: true,
						success: () => {
							console.log("1")
							this.onLoad();
						}
					});
				})
			} else {
				gdt.missionComplete('shareBeenRead').then((res) => {
					const scoreAdd = res.transaction.amount;
					wx.showToast({
						title: '领取成功，获得' + scoreAdd + '积分',
						icon: 'none',
						duration: 1000,
						mask: true,
						success: () => {
							this.onLoad();
						}
					});
				})
			}
		} else { }
	},
	/**点击签到 */
	toCheck: function () {
		if (this.data.checked == false) {
			let that = this;
			gdt.missionComplete('showup').then((result) => {
				let scoreAdd = result.transaction.amount;
				wx.showToast({
					title: '领取成功，获得' + scoreAdd + '积分',
					icon: 'none',
					duration: 1000,
					mask: true,
					success: () => {
						that.onLoad();
					}
				});
			})
		} else {
			let that = this;
			wx.showToast({
				title: '您已签到，请勿重复',
				icon: 'none',
				duration: 1000,
				mask: true
			})
		}
	},
	onReachBottom: function () {
		if (this.data.totalReferencers > this.data.pageSize) {
			let page = this.data.page;
			let pageSize = this.data.pageSize + 10;
			gdt.getReferral(page, pageSize).then((result) => {
				console.log(result.detail)
				this.setData({
					detail: result.detail,
					page: page,
					pageSize: pageSize
				})
			})
		} else {

		}
	},
	loadMore: function () {
		if (this.data.totalReferencers > this.data.pageSize) {
			let page = this.data.page;
			let pageSize = this.data.pageSize + 10;
			gdt.getReferral(page, pageSize).then((result) => {
				console.log(result.detail);
				console.log(pageSize)
				this.setData({
					detail: result.detail,
					page: page,
					pageSize: pageSize
				})
			})
		} else { }
	},
	handleSavePicture: function () {
		console.log(133)
		this.setData({
			changeBox: false
		})
	}

})

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
	},
	onShow: function () {},
	onLoad: function (option) {
		this.setData({
			changeBox: false,
			code: option.code
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
			let next1 = util.moment().add(1, 'days').format("MM-DD");
			let next2 = util.moment().add(2, 'days').format("MM-DD");
			let next3 = util.moment().add(3, 'days').format("MM-DD");
			let preve1 = util.moment().subtract(1, 'days').format("MM-DD");
			let preve2 = util.moment().subtract(2, 'days').format("MM-DD");
			let preve3 = util.moment().subtract(3, 'days').format("MM-DD");
			let preve4 = util.moment().subtract(4, 'days').format("MM-DD");
			let preve5 = util.moment().subtract(5, 'days').format("MM-DD");
			let preve6 = util.moment().subtract(6, 'days').format("MM-DD");
			let next4 = util.moment().add(4, 'days').format("MM-DD");
			let next5 = util.moment().add(5, 'days').format("MM-DD");
			let next6 = util.moment().add(6, 'days').format("MM-DD")
			missions.forEach(item => {
				if (item.type == 'showup') {
					const level = item.payload.level;
					this.setData({
						checked: item.completed
					})
					// if (item.payload.level >= 3) {
					//   arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3]
					//   let preveArr = item.payload.rewards.slice(level - 3, level);
					//   let nextArr = item.payload.rewards.slice(level, level + 4);
					//   let allArr = preveArr.concat(nextArr);
					//   this.setData({
					//     arrDate: allArr,
					//   })
					// } else 
					if (level == 0) {
						arrDateDuration = ['今天', next1, next2, next3, next4, next5, next6]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 1) {
						arrDateDuration = [preve1, '今天', next1, next2, next3, next4, next5]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 2) {
						arrDateDuration = [preve2, preve1, '今天', next1, next2, next3, next4]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 3) {
						arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 4) {
						arrDateDuration = [preve4, preve3, preve2, preve1, '今天', next1, next2]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 5) {
						arrDateDuration = [preve5, preve4, preve3, preve2, preve1, '今天', next1]
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					} else if (level == 6) {
						arrDateDuration = [preve6, preve5, preve4, preve3, preve2, preve1, '今天']
						let allArr = item.payload.rewards.slice(0, 7)
						this.setData({
							arrDate: allArr
						})
					}
					this.setData({
						check: item,
						level: item.payload.level
					})
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

			let arrCheck = [];
			this.data.arrDate.forEach((item, index) => {
				arrCheck[index] = new Object()
				arrCheck[index]['number'] = item;
				arrCheck[index]['name'] = arrDateDuration[index];

			})
			this.setData({
				arrCheck: arrCheck
			});
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
		if (option.box) {
			const that = this;
			this.setData({
				changeBox: true
			}, () => {

				const ctx = wx.createCanvasContext('saveCanvas');
				ctx.setFillStyle('rgba(255, 255, 255, 1)');
				ctx.fillRect(0, 0, 280, 322);

				const changetext = ('兑换码');
				ctx.setFontSize(12);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(changetext, 122, 26);

				ctx.setFillStyle('rgba(250,212,85,1)');
				ctx.fillRect(71, 34, 146, 30);

				const code = this.data.code;
				ctx.setTextBaseline('top')
				ctx.setFontSize(14);
				ctx.setFillStyle('#000000');
				ctx.fillText(code, 76, 39);

				const knowEq = ('识别二维码也可以添加客服喔');
				ctx.setFontSize(12);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(knowEq, 62, 80);

				const addChangegift = ('添加小鱼聚合客服小姐姐兑换礼物吧');
				ctx.setFontSize(12);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(addChangegift, 44, 97);

				const equrl = this.data.baseImageUrlEq;
				ctx.drawImage(equrl, 80, 115, 120, 120);

				const wxtext = '微信：xiaoyujuhe123';
				ctx.setFontSize(12);
				ctx.setFillStyle('#000000');
				ctx.fillText(wxtext, 84, 239);

				const payattention = '注意事项：';
				ctx.setFontSize(12);
				ctx.setFillStyle('#FF0000');
				ctx.fillText(payattention, 116, 275);

				const pay = '请务必保存好图片以防丢失后无法领取礼物!';
				ctx.setFillStyle('#FF0000');
				ctx.fillText(pay, 24, 292);
				ctx.draw();

				setTimeout(function () {
					wx.canvasToTempFilePath({
						x: 0,
						y: 0,
						width: 280,
						height: 323,
						destWidth: 1280,
						destHeight: 1480,
						fileType: 'jpg',
						quality: 1,
						canvasId: 'saveCanvas',
						success: function (res) {
							that.setData({
								eqPath: res.tempFilePath,
							})
						}
					})
				}, 2000)

			})
		}
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlXiaoyu: 'https://' + res.split('/')[2] + '/static/images/xiaoyu.jpeg'
			})


		})

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
		} else {}
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
				title: '您已签到，請勿重复',
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
		} else {}
	}

})

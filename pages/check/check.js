let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
const IPX = app.isIPX;
Page({
	data: {
		uid: '',
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
		page: 1,
		pageSize: 10,
		IPX: IPX,
		More: '加载更多',
		isCheck : false
	},
	onShow: function () {

	},
	onLoad: function (option) {
		gdt.currentUser.then((u) => {
			this.data.uid = u._id;
		});
		this.setData({
			changeBox: false,
			code: option.code
		});
		if (getCurrentPages()[0] === this) {
			this.setData({
				isCheck: true
			})
		};
		gdt.track("check-isOnLoad")
		this.handleCurrentUserAndDailyMission()

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
	handleCurrentUserAndDailyMission: function () {
		gdt.currentUser.then(() => gdt.getDailyMissions()).then((res) => {
			gdt.getReferral(this.data.page, this.data.pageSize).then((result) => {
				result.detail.map((item) => {
					item.amount = item.amount.toFixed(2);
				});
				this.setData({
					totalBounses: parseFloat(result.totalBounses).toFixed(2),
					totalReferencers: result.totalReferencers,
					detail: result.detail,
				});
			})
			const missions = res.missions || [];
			const accountBalance = res.accountBalance.toFixed(2);
			this.handleData(missions)
			this.setData({
				accountBalance: accountBalance
			});
		});
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrlHome: 'https://' + res.split('/')[2] + '/static/images/goHome.png '
			})
		})
	},
	handleData: function (missions) {
		let arrDateDuration = [];
		let next1 = util.moment().add(1, 'days').format("MM-DD");
		let next2 = util.moment().add(2, 'days').format("MM-DD");
		let next3 = util.moment().add(3, 'days').format("MM-DD");
		let preve1 = util.moment().subtract(1, 'days').format("MM-DD");
		let preve2 = util.moment().subtract(2, 'days').format("MM-DD");
		let preve3 = util.moment().subtract(3, 'days').format("MM-DD");
		let next4 = util.moment().add(4, 'days').format("MM-DD");
		let next5 = util.moment().add(5, 'days').format("MM-DD");
		let next6 = util.moment().add(6, 'days').format("MM-DD");
		missions.forEach(item => {
			if (item.type == 'showup') {
				// item.payload.level = 5;
				const level = item.payload.level;
				this.setData({
					checked: item.completed
				})
				arrDateDuration = item.payload.brefHistory;
				let rewards = item.payload.rewards;
				let allArr = [];
				let showUp = []
				if (item.payload.level == 3) {
					arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3];
					allArr = item.payload.rewards.slice(0, 7);
					showUp = [true, true, true, item.completed, false, false, false];
					this.setData({
						arrDate: allArr
					})
				} else if (item.payload.level == 4) {
					arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3];
					let legnth = item.payload.rewards.length;
					let preveArr = item.payload.rewards.slice(level - 3, legnth + 1);
					let nextArr = item.payload.rewards[item.payload.rewards.length - 1];
					allArr = preveArr.concat(nextArr);
					showUp = [true, true, true, item.completed, false, false, false];
					this.setData({
						arrDate: allArr,
					})
				} else if (item.payload.level == 5) {
					arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3];
					let legnth = item.payload.rewards.length;
					let preveArr = item.payload.rewards.slice(level - 3, legnth + 1);
					let nextArr = item.payload.rewards[item.payload.rewards.length - 1];
					allArr = preveArr.concat(nextArr).concat(nextArr);
					showUp = [true, true, true, item.completed, false, false, false];
					this.setData({
						arrDate: allArr
					})
				} else if (item.payload.level == 6) {
					arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3];
					let legnth = item.payload.rewards.length;
					let preveArr = item.payload.rewards.slice(level - 3, legnth + 1);
					let nextArr = item.payload.rewards[item.payload.rewards.length - 1];
					allArr = preveArr.concat(nextArr).concat(nextArr).concat(nextArr);
					showUp = [true, true, true, item.completed, false, false,];
					this.setData({
						arrDate: allArr
					})
				} else if (level == 0) {
					arrDateDuration = ['今天', next1, next2, next3, next4, next5, next6];
					showUp = [item.completed, false, false, false, false, false, false];
					allArr = item.payload.rewards.slice(0, 7);
					this.setData({
						arrDate: allArr
					})
				} else if (level == 1) {
					arrDateDuration = [preve1, '今天', next1, next2, next3, next4, next5]
					allArr = item.payload.rewards.slice(0, 7);
					showUp = [true, item.completed, false, false, false, false, false];
					this.setData({
						arrDate: allArr
					})
				} else if (level == 2) {
					arrDateDuration = [preve1, preve2, '今天', next1, next2, next3, next4]
					allArr = item.payload.rewards.slice(0, 7);
					showUp = [true, true, item.completed, false, false, false, false];
					this.setData({
						arrDate: allArr
					})
				}
				let arrCheck = [];
				allArr.forEach((item, index) => {
					arrCheck[index] = new Object()
					arrCheck[index]['number'] = item;
					arrCheck[index]['name'] = arrDateDuration[index];
					arrCheck[index]['showUp'] = showUp[index]

				})
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
	},
	jumptogift: function () {
		wx.navigateTo({
			url: '/pages/gift/gift'
		});
	},
	/*活动规则点击弹出*/
	handleRule: function () {
		this.setData({
			ruleIsShow: !this.data.ruleIsShow,
		})
	},
	/** 点击领取和去完成发生的动作 **/
	goToFinish: function (e) {
		let that = this;
		if (e.target.dataset.completed == false) {
			if (e.target.dataset.criteriasatisfied == true) {
				if (e.target.dataset.type == 'articleRead') {
					gdt.missionComplete('articleRead').then((res) => {
						const scoreAdd = res.transaction.amount;
						wx.showToast({
							title: '领取成功，获得' + scoreAdd + '积分',
							icon: 'none',
							duration: 1000,
							mask: true,
							success: () => {
								that.handleCurrentUserAndDailyMission();
								gdt.track("got-readArticle-scores")
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
								that.handleCurrentUserAndDailyMission();
								gdt.track("got-shareArticle-scores")
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
								that.handleCurrentUserAndDailyMission();
								gdt.track("got-shareBeenRead-scores");
							}
						});
					})
				}
			} else {
				wx.reLaunch({
					url: '/pages/index/index',
					success:()=>{
						gdt.track("into-index-from-check")
					}
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
						that.handleCurrentUserAndDailyMission();
						gdt.track("got-check-score");
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
		if (this.data.totalReferencers == 0) {
			this.setData({
				More: '暂无数据哦~'
			})
		} else if (this.data.totalReferencers > this.data.page * this.data.pageSize) {
			let that = this;
			let page = this.data.page + 1;
			let pageSize = this.data.pageSize;
			that.setData({
				page: page,
				pageSize: pageSize,
				More: '加载更多'
			}, () => {
				gdt.getReferral(this.data.page, this.data.pageSize).then((result) => {
					that.setData({
						detail: that.data.detail.concat(result.detail)
					})
				})
			})
		} else {
			this.setData({
				More: '没有更多数据啦~'
			})
		}
	},
	loadMore: function () {
		if (this.data.totalReferencers > this.data.page * this.data.pageSize) {
			let that = this;
			let page = this.data.page + 1;
			let pageSize = this.data.pageSize;
			that.setData({
				page: page,
				pageSize: pageSize,
			}, () => {
				gdt.getReferral(this.data.page, this.data.pageSize).then((result) => {
					that.setData({
						detail: that.data.detail.concat(result.detail)
					})
				})
			})
		} else { }
	},

	onShareAppMessage: function () {
		return {
			title: '签到领好礼',
			path: `pages/check/check?refee=${this.data.uid}`
		}
	}

})

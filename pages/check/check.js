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
		page: 1,
		pageSize: 10,
	},
	onShow: function () {

	},
	onLoad: function () {
		gdt.currentUser.then(() => gdt.getDailyMissions()).then((res) => {
			gdt.getReferral(this.data.page, this.data.pageSize).then((result) => {
				this.setData({
					totalBounses: parseFloat(result.totalBounses).toFixed(2),
					totalReferencers: result.totalReferencers,
					detail: result.detail,
					amount: parseFloat(result.detail.amount).toFixed(2)
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
				this.setData({
					detail: result.detail,
					page: page,
					pageSize: pageSize,
					amount: parseFloat(result.detail.amount).toFixed(2)
				})
			})
		} else {}
	},


})

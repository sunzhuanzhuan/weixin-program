let app = getApp().globalData;
const gdt = app.applicationDataContext;
Page({
	data: {
		uid: '',
		accountBalance: 0,
		data: [],
		baseUrl: '',
		pre: false
	},
	onLoad: function () {
		let currentMonth = new Date().getMonth() + 1;
		let nextMonth
		if (currentMonth == 12) {
			nextMonth = 1;
		} else {
			nextMonth = new Date().getMonth() + 2;
		}
		gdt.currentUser.then((u) => {
			this.data.uid = u._id;
		});
		let that = this;
		gdt.getCommodity().then((res) => {
			console.log(res);
			let arr = [];
			let arr1 = [];
			res.commodities.map((item) => {
				if (item.status == 2) {
					arr.push(item)
				} else if (item.status == 1) {
					arr1.push(item)
				}
			})
			that.setData({
				accountBalance: res.accountBalance.toFixed(2),
				data: arr,
				data1: arr1,
			}, () => {
				if (that.data.data1.length != 0) {
					that.setData({
						pre: true
					})
				} else {
					that.setData({
						pre: false
					})
				}
			})
		})
		gdt.track("into-gift");
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrl: 'https://' + res.split('/')[2],
			})
		})

		that.setData({
			currentMonth: currentMonth,
			nextMonth: nextMonth,
		})

	},
	jumpToDetail: function (e) {
		let id = e.currentTarget.dataset.id;
		let giftId = {};
		giftId.id = id;
		console.log(id);
		wx.navigateTo({
			url: '/pages/giftdetail/giftdetail?id=' + id,
			success : ()=>{
				gdt.track("into-giftDetail-from-gift",giftId)
			}
		})
	},
	onShareAppMessage: function () {
		return {
			title: '签到领好礼',
			path: `pages/gift/gift?refee=${this.data.uid}`
		}
	},
	/* 下拉刷新*/
	onPullDownRefresh: function () {
		wx.showLoading({
			title: '加载中',
			icon: 'loadding'
		});
		let that = this;
		gdt.getCommodity().then((res) => {
			let arr = [];
			let arr1 = [];
			res.commodities.map((item) => {
				if (item.status == 2) {
					arr.push(item)
				} else if (item.status == 1) {
					arr1.push(item)
				}
			})
			that.setData({
				accountBalance: res.accountBalance.toFixed(2),
				data: arr,
				data1: arr1,
			});
			wx.hideLoading();
		});
		setTimeout(() => {
			wx.stopPullDownRefresh();
		}, 500);
	},

})

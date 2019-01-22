let app = getApp().globalData;
const gdt = app.applicationDataContext;
Page({
	data: {
		uid: '',
		accountBalance: 0,
		data: [],

		baseUrl: ''
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
			})
		})

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
		console.log(id);
		wx.navigateTo({
			url: '/pages/giftdetail/giftdetail?id=' + id 
		})
	},
	onShareAppMessage: function () {
		return {
			title: '签到领好礼',
			path: `pages/giftdetail/giftdetail?refee=${this.data.uid}`
		}
	}
})

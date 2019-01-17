Page({
	data: {
		accountBalance: 0,
		data: []
	},
	onLoad: function (option) {
		let currentMonth = new Date().getMonth() + 1;
		let nextMonth
		if (currentMonth == 12) {
			nextMonth = 1;
		} else {
			nextMonth = new Date().getMonth() + 2;
		}

		let that = this;
		wx.request({
			url: 'http://192.168.20.51:7300/mock/5b5696c70a4cc60021ebdf86/mocked/rewards/commodity',
			method: 'GET',
			success: function (res) {
				console.log(res.data.data);
				let arr = [];
				let arr1 = [];
				res.data.data.commodities.map((item) => {
					if (item.status == 2) {
						arr.push(item)
					} else if (item.status == 1) {
						arr1.push(item)
					}
				})
				that.setData({
					data: arr,
					data1: arr1,
				})
			}
		})
		that.setData({
			accountBalance: option.accountBalance,
			currentMonth: currentMonth,
			nextMonth: nextMonth

		})

	},
	jumpToDetail: function () {
		wx.navigateTo({
			url: '/pages/giftdetail/giftdetail'
		})
	}
})

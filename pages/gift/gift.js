Page({
	data: {
		accountBalance: 0,
	},
	onLoad: function (option) {
		console.log(option)
		let that = this;
		that.setData({
			accountBalance: option.accountBalance
		})
	},
	jumpToDetail: function () {
		wx.navigateTo({
			url: '/pages/giftdetail/giftdetail'
		})
	}
})

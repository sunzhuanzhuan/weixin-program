Page({

	data: {
		visible: false, //兑换弹窗
		canIchange: true, //兑换和积分不足 按钮
		notEnough: false, //赚取积分弹窗
	},
	change: function () {
		this.setData({
			visible: true,
		})
	},
	cancel: function () {
		this.setData({
			visible: false
		})
	},
	canNotChange: function () {
		this.setData({
			notEnough: true
		})
	},
	confirm: function () {
		wx.reLaunch({
			url: '/pages/check/check?box=true',
		});
	},
	onLoad: function (options) {
		let that = this;
		wx.request({
			url: 'http://192.168.20.51:7300/mock/5b5696c70a4cc60021ebdf86/mocked/rewards/commodity/adfadfadsfadsfadsfasdf',
			method: 'GET',
			success(res) {
				console.log(res.data.data);
				that.setData({ detail: res.data.data })
			}
		})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {

	},
	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function () {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function () {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage: function () {

	}
})

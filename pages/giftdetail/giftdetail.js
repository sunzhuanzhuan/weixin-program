let app = getApp().globalData;
const gdt = app.applicationDataContext;
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
		gdt.purchase(option.id, 1).then((res) => {
			this.setData({
				code: res.code
			});
			wx.reLaunch({
				url: '/pages/check/check?box=true&code=' + res.code,
			});
		})

	},
	ToEarnScore: function () {
		wx.navigateBack({
			delta: 2
		})
	},
	onLoad: function (option) {
		let id = option.id;
		let that = this;
		that.setData({
			accountBalance: option.accountBalance
		})
		gdt.getCommodityDetail(id).then((res) => {
			console.log(res);
			that.setData({
				detail: res
			})
		});
		gdt.baseServerUri.then((res) => {
			this.setData({
				baseImageUrl: 'https://' + res.split('/')[2],
			})
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

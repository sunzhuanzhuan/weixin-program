

let app = getApp().globalData;
const gdt = app.applicationDataContext;

Page({
	data: {
		url: ''
	},
	onLoad: function () {
		gdt.baseServerUri.then((res) => {

			this.setData({
				url: 'https://' + res.split('/')[2] + '/static/images/mini_show.gif',
				baseImageUrlShareIntro: 'https://' + res.split('/')[2] + '/static/images/shareIntro.jpeg',
				baseImageUrlXiaoyu: 'https://' + res.split('/')[2] + '/static/images/xiaoyu.jpeg'
			})


		})
	},
	handleContent: function () {
		wx.setClipboardData({
			data: 'xiaoyujuhe123',
			success(res) {
				wx.getClipboardData({
					success(res) {
						console.log(res.data) // data
					}
				})
			}
		})
	},
	onShow: function () {
		//网络状况
		wx.getNetworkType({
			success(res) {
				const networkType = res.networkType;
				if (networkType === '2g' || networkType === 'none') {
					wx.showToast({
						title: '阿哦～没有网络无法正常使用',
						icon: 'none',
						duration: 3000
					})
				}
			}
		})
		//截屏事件
		wx.onUserCaptureScreen(function (res) {
			gdt.track('introduce-capture-screen');
		})

	}

})

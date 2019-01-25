const GDT = require('./application-data.js');
App({

	onLaunch: function (launchParam) {
		this.globalData.applicationDataContext = new GDT(launchParam, ['wxArticle', 'simpleSurvey']);
		const gdt = this.globalData.applicationDataContext;
		gdt.userInfo.catch(() => {
			gdt.once('userInfo', (info) => {
				gdt.track('newly-authorized-user-info');
			});
		});
		this.checkIsIPX();
	},
	checkIsIPX: function () {
		const that = this;
		wx.getSystemInfo({
			success: function (res) {
				if (res.model.search('iPhone X') != -1) {
					that.globalData.isIPX = true
				}
			}
		})
	},
	onShow: function (showParam) {
		this.globalData.applicationDataContext.onAppShow(showParam);
		this.globalData.applicationDataContext.checkAndFixUserLogin();
	},
	onError: function (error) {
		this.globalData.applicationDataContext.onAppError(error);
	},
	onHide: function () {
		this.globalData.applicationDataContext.onAppHide();
	},
	globalData: {
		isIPX: " ",
		baseUrl: "",
		distroId: "",
		appToken: "",
		sessionToken: '',
		articleId: '',
		backgroundAudioManager: wx.getBackgroundAudioManager(),
		saveToCamera: 'openSetting'

	},
	onShow: function (showParam) {
		this.globalData.applicationDataContext.onAppShow(showParam);
		this.globalData.applicationDataContext.checkAndFixUserLogin();
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

	},
	onError: function (error) {
		this.globalData.applicationDataContext.onAppError(error);
	},
	onHide: function () {
		this.globalData.applicationDataContext.onAppHide();
	},
	globalData: {
		baseUrl: "",
		distroId: "",
		appToken: "",
		sessionToken: '',
		articleId: '',
		backgroundAudioManager: wx.getBackgroundAudioManager()

	},


})

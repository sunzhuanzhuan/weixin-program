let app = getApp().globalData;
const gdt = app.applicationDataContext;
const isIPX = app.isIPX;
Page({

	data: {
		uid: '',
		visible: false, //兑换弹窗
		canIchange: true, //兑换和积分不足 按钮
		notEnough: false, //赚取积分弹窗
		tooLate: false,
		url: '../../images/load.png',
		eq: '../../images/xiaoyu.jpeg',
		forSure: true,
		isIPX: isIPX,
		isGiftDetail :false
	},
	change: function () {
		this.setData({
			visible: true,
			forSure: true,
		},()=>{gdt.track("tap-change-button-from-giftDetail")})
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
	lookOther: function () {
		wx.navigateBack({
			delta: 1
		})
	},
	confirm: function () {
		this.setData({
			forSure: false,
		})
		gdt.track("confirm-change-gift");
		gdt.purchase(this.data.id, 1).then((res) => {
			wx.showLoading({
				title: '加载中',
			})
			this.setData({
				code: res.code,
				visible: false,
			});
			// wx.navigateTo({
			// 	url: '/pages/check/check?box=true&code=' + res.code,
			// });

			gdt.systemInfo.then((x) => {
				this.setData({
					ratio: x.windowWidth * 2 / 750,
				});
			});
			const that = this;
			this.setData({
				changeBox: true
			}, () => {
				let ratio = that.data.ratio;
				const ctx = wx.createCanvasContext('saveCanvas');
				ctx.setFillStyle('rgba(255, 255, 255, 1)');
				ctx.fillRect(10, 10, 280 * ratio, 322 * ratio);

				const changetext = ('兑换码');
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(changetext, 142 * ratio, 26 * ratio);

				ctx.setFillStyle('rgba(250,212,85,1)');
				ctx.fillRect(91 * ratio, 34 * ratio, 155 * ratio, 30 * ratio);
				const code = this.data.code;
				ctx.setTextBaseline('top')
				ctx.setFontSize(14 * ratio);
				ctx.setFillStyle('#000000');
				ctx.fillText(code, 96 * ratio, 39 * ratio);

				const knowEq = ('识别二维码也可以添加客服喔');
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(knowEq, 82 * ratio, 80 * ratio);

				const addChangegift = ('添加小鱼聚合客服小姐姐兑换礼物吧');
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('rgba(153,153,153,1)');
				ctx.fillText(addChangegift, 64 * ratio, 97 * ratio);

				const equrl = this.data.eq;
				ctx.drawImage(equrl, 100 * ratio, 115 * ratio, 120 * ratio, 120 * ratio);

				const wxtext = '微信：xiaoyujuhe123';
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('#000000');
				ctx.fillText(wxtext, 104 * ratio, 239 * ratio);

				const payattention = '注意事项：';
				ctx.setFontSize(12 * ratio);
				ctx.setFillStyle('#FF0000');
				ctx.fillText(payattention, 136 * ratio, 275 * ratio);

				const pay = '请务必保存好图片以防丢失后无法领取礼物!';
				ctx.setFillStyle('#FF0000');
				ctx.fillText(pay, 44 * ratio, 292 * ratio);
				ctx.draw();
				setTimeout(function () {
					wx.canvasToTempFilePath({
						x: 0,
						y: 0,
						width: 320 * ratio,
						height: 370 * ratio,
						destWidth: 1280,
						destHeight: 1480,
						fileType: 'jpg',
						quality: 1,
						canvasId: 'saveCanvas',
						success: function (res) {
							that.setData({
								shareImage: res.tempFilePath,
								showSharePic: true
							}, () => {
								wx.saveImageToPhotosAlbum({
									filePath: that.data.shareImage,
									success: function () {
										console.log('保存成功');
										app.saveToCamera = '';
										gdt.track("save-picture-to-phone-success")
									},
									fail: function () {
										console.log('保存失败');
										app.saveToCamera = 'openSetting';
										gdt.track("save-picture-to-phone-failed")
									}
								})
							})
							wx.hideLoading();
						},
						fail: function (res) {
							wx.hideLoading();
						}
					})
				}, 1000);
			})


		}).catch((err) => {
			if (err.status == '41208') {
				this.setData({
					notEnough: true,
					visible: false
				})
			} else {
				this.setData({
					tooLate: true,
					visible: false
				});
			}
		})



	},
	ToEarnScore: function () {
		wx.navigateBack({
			delta: 2
		})
	},
	handleSavePicture: function () {
		this.setData({
			changeBox: false
		});
		let that = this;
		if (app.saveToCamera == 'openSetting') {
			wx.openSetting({
				success(res) {
					that.confirm()
				}
			})
		}



	},
	onLoad: function (option) {
		let that = this;
		if(option.id){
			const id = option.id;
			that.setData({
				id: id
			})
			if (getCurrentPages()[0] === this) {
				that.setData({
					isGiftDetail: true
				})
			};
			that.handleApiGroup(id)
			gdt.baseServerUri.then((res) => {
				that.setData({
					baseImageUrlHome: 'https://' + res.split('/')[2] + '/static/images/goHome.png'
				})
			})
		}else {
			wx.reLaunch({
				url: '/pages/gift/gift'
			})
		}
	},
	handleApiGroup: function (id) {
		let that = this
		gdt.currentUser.then((u) => {
			that.data.uid = u._id;
			gdt.getCommodity().then((result) => {
				that.setData({
					accountBalance: result.accountBalance,
					id: id,
				})
			})
		});
		gdt.getCommodityDetail(id).then((res) => {
			that.setData({
				detail: res,
				status: res.status,
				price: parseFloat(res.rmbPrice).toFixed(2)
			},()=>{gdt.track("giftDetail-data-showup")});
			gdt.baseServerUri.then((res) => {
				that.setData({
					baseImageUrl: 'https://' + res.split('/')[2],
				}, () => {
					that.setData({
						url: that.data.baseImageUrl + that.data.detail.coverUrl
					});
					if (that.data.status == "1" || that.data.detail.stock == '0') {
						this.setData({
							WillOnLine: true
						})
					}
				})
			});
		});
	},
	touchmove: function () {
		return
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
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		wx.getSetting({
			success: res => {
				if (!res.authSetting['scope.writePhotosAlbum']) {
					this.setData({
						btnSavePitcureLetter: '保存图片到手机'
					})
				} else {
					this.setData({
						btnSavePitcureLetter: '保存图片到手机'
					})
				}
			}
		})
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
		return {
			title: '签到领好礼',
			path: `pages/giftdetail/giftdetail?refee=${this.data.uid}&id=${this.data.id}`
		}
	}
})

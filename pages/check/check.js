
let app = getApp().globalData;
const gdt = app.applicationDataContext;
const data = require('../../data/mock');
const util = require('../../utils/util')
Page({
	data: {
		url: '',
		reportSubmit: true,
		accountBalance: "",
		missions: [],
		ruleIsShow: false,
		checked: false,    //控制button的显示内容
		isChecked: false,       //控制签到的color
		month: null,
		day: null,
		level: 0,
		arrDate: [],
		dateArr: []
	},
	onShow: function () {
	},
	onLoad: function () {

		let res = data.data.data.missions;
		let arrDateDuration = [];
		let next1 = util.moment().add(1, 'days').format("MM-DD");
		let next2 = util.moment().add(2, 'days').format("MM-DD");
		let next3 = util.moment().add(3, 'days').format("MM-DD");
		let preve1 = util.moment().subtract(1, 'days').format("MM-DD");
		let preve2 = util.moment().subtract(2, 'days').format("MM-DD");
		let preve3 = util.moment().subtract(3, 'days').format("MM-DD");
		let next4 = util.moment().subtract(4, 'days').format("MM-DD");
		let next5 = util.moment().subtract(5, 'days').format("MM-DD");
		let next6 = util.moment().subtract(6, 'days').format("MM-DD")
		res.forEach(item => {
			if (item.type == 'showup') {
				const level = item.payload.level;
				if (item.payload.level >= 3) {
					arrDateDuration = [preve3, preve2, preve1, '今天', next1, next2, next3]
					let preveArr = item.payload.rewards.slice(level - 3, level);
					let nextArr = item.payload.rewards.slice(level, level + 4);
					let allArr = preveArr.concat(nextArr);
					this.setData({ arrDate: allArr, })
				} else if (level == 0) {
					arrDateDuration = ['今天', next1, next2, next3, next4, next5, next6]
					let allArr = item.payload.rewards.slice(0, 7)
					this.setData({ arrDate: allArr })
				} else if (level == 1) {
					arrDateDuration = [preve1, '今天', next1, next2, next3, next4, next5]
					let allArr = item.payload.rewards.slice(0, 7)
					this.setData({ arrDate: allArr })
				} else if (level == 2) {
					arrDateDuration = [preve1, preve2, '今天', next1, next2, next3, next4]
					let allArr = item.payload.rewards.slice(0, 7)
					this.setData({ arrDate: allArr })
				}
				this.setData({ check: item, level: item.payload.level })
			} else if (item.type == '"articleShared"') {
				this.setData({ articleShared: item })
			} else if (item.type == 'articleRead') {
				this.setData({ articlearticleReadShared: item })
			} else {
				this.setData({ shareBeenRead: item })
			}
		});

		let arrCheck = [];
		this.data.arrDate.forEach((item, index) => {
			arrCheck[index] = new Object()
			arrCheck[index]['number'] = item;
			arrCheck[index]['name'] = arrDateDuration[index];

		})
		this.setData({ arrCheck: arrCheck });
		this.setData({
			accountBalance: data.data.data.accountBalance,
			missions: data.data.data.missions.slice(1)
		});
		console.log(this.data.missions)


	},
	/*活动规则点击弹出*/
	handleRule: function () {
		this.setData({
			ruleIsShow: !this.data.ruleIsShow,
		})
	},
	/** 点击领取和去完成发生的动作 **/
	goToFinish: function (e) {
		if (e.target.dataset.criteria == false) {
			wx.navigateTo({
				url: '/pages/index/index'
			})
		} else if (e.target.dataset.completed == false) {
			wx.showToast({
				title: '领取成功',
				icon: 'success',
				duration: 1000,
				mask: true,
				success: res => {
					this.setData({
						accountBalance: this.data.accountBalance + e.target.dataset.reward,
					});
					console.log(e.target.dataset.completed);
					e.target.dataset.completed = true;
					console.log(e.target.dataset.completed);
					//this.onLoad();//刷新页面
					console.log("页面刷新完成");
				}
			})
		} else {
			return;
		}
	},
	/**点击签到 */
	toCheck: function () {
		if (this.data.checked == false) {
			wx.showToast({
				title: '签到成功',
				icon: 'none',
				duration: 1000,
				mask: true,
				success: res => {
					this.onLoad();
					this.setData({
						checked: !this.data.checked,
					})
				}
			})
		}
	}

})

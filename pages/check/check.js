
let app = getApp().globalData;
const gdt = app.applicationDataContext;
const data  = require('../../data/mock')
Page({
	data: {
		url: '',
		reportSubmit: true,
		accountBalance: "",
		missions: [],
		ruleIsShow: false,
		checked: false,    //控制button的显示内容
		isChecked: false,       //控制签到的color
		month:null,
		day:null,
	},
	onShow:function(){
	},
	onLoad:function(){
		let date = new Date();
		let month = date.getMonth()+1;
		let day = date.getDate();
		let december = month+"."+day;
		this.setData({
			accountBalance : data.data.data.accountBalance,
			missions : data.data.data.missions.slice(1),
			month: month,
			day:day,
		});
	},
	/*活动规则点击弹出*/
	handleRule:function(){
		this.setData({
			ruleIsShow : !this.data.ruleIsShow,
		})
	},
	/** 点击领取和去完成发生的动作 **/
	goToFinish:function(e){
		if(e.target.dataset.criteria == false){ 
			wx.navigateTo({
			url: '/pages/index/index'
			})
	    } else if(e.target.dataset.completed ==false) {
			wx.showToast({
				title: '领取成功',
				icon: 'success',
				duration: 1000,
				mask: true,
				success: res=>{
					this.setData({
						accountBalance : this.data.accountBalance + e.target.dataset.reward,
					});
					console.log(e.target.dataset.completed);
					e.target.dataset.completed = true;
					console.log(e.target.dataset.completed);
					//this.onLoad();//刷新页面
					console.log("页面刷新完成");
				}
		    })
	    } else{
			return ;
		}
	},
	/**点击签到 */
	toCheck:function(){
		if(this.data.checked==false){
			wx.showToast({
				title: '签到成功',
				icon: 'none',
				duration:1000,
				mask:true,
				success: res=>{
					this.onLoad();
					this.setData({
						checked : !this.data.checked,
					})
				}
			})
		}
	}

})

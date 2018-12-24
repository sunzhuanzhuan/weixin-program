

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const data  = require('../../data/mock')
Page({
	data: {
		url: '',
		reportSubmit: true
	},
	onShow:function(){
		console.log(data.data)
	}

})

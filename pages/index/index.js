//index.js
//获取应用实例
const app = getApp();

Page({
    data: {
        data: [],
        shareList:[],
        likeList:[],
        list:[],
        heightFlag:true,
        item1: {
            index: 1,
            msg: 'this is a template',
            time: '2016-09-15'
        },
        userInfo:{},
        shareAfter: '../../images/shareAfter.png',
        shareBefore: "../../images/shareBefore.png",
        likeAfter: "../../images/likeAfter.png",
        likeBefore: "../../images/likeBefore.png",
        flag:true,
        templateFlag:true,
        colorTitle:0,
        shinIndex:999999,
        //屏幕的宽度
        screenWidth:'',
        screenHeight:'',
        endWidth:'',
        startsWidth:'',
        isMore:true
    },
    onShow: function () {
        wx.getExtConfig({
            success:function (res) {
                console.log(res.extConfig);
            }
        })
        let that =this;
        wx.getStorage({
            key: 'userInfo',
            success: function(res) {
                that.setData({userInfo:res.data})
            }
        })
        wx.request({
            url: "http://127.0.0.1:49928/appservice/index.json",
            success: function (res) {
                that.setData({data: res.data.tab})
            }
        });
        wx.request({
            url: "http://127.0.0.1:49928/appservice/share.json",
            success: function (res) {
                that.setData({shareList:res.data.data})
            }
        });
        wx.request({
            url: "http://127.0.0.1:49928/appservice/like.json",
            success:  function (res) {
                that.setData({likeList:res.data.data})
            }
        });
        wx.request({
            url: "http://127.0.0.1:49928/appservice/list.json",
            success:function (res) {
                that.setData({list:res.data.data})
            }
        });
        //获取屏幕的宽度
        wx.getSystemInfo({
            success: function(res) {
                that.setData({screenWidth:res.screenWidth,screenHeight:res.screenHeight})
            }
        });
    },
    bindGetUserInfo: function(e) {
        wx.setStorage({
            key:"userInfo",
            data:e.detail.userInfo
        })
        this.setData({userInfo:e.detail.userInfo})
    },
    handleTab(e){
       // console.log(e.currentTarget.dataset.name)
        if(e.currentTarget.dataset.name == 'share'){
            //console.log(e.currentTarget.dataset.name)
            this.setData({flag:true})
        }else{
            this.setData({flag:false})
        }
    },
    handleShrink(e){
        console.log(e.currentTarget.dataset.id)
        this.setData({shinIndex:e.currentTarget.dataset.id,heightFlag:!this.data.heightFlag})
    },
    handleTitleTab(e){
        if(e.currentTarget.dataset.tab == this.data.data.length){
            this.setData({templateFlag:false,colorTitle:e.currentTarget.dataset.tab })
        }else{
            this.setData({templateFlag:true,colorTitle:e.currentTarget.dataset.tab })
        }
    },
    //跳转到详情
    handleDetail(){
        wx.navigateTo({
            url:'/pages/logs/logs'
        })
    },
    handleTouchEnd(e){
        this.setData({endWidth:e.changedTouches[0].clientX})
        if(this.data.startsWidth >= this.data.screenWidth/2){
            if(this.data.startsWidth-this.data.endWidth >= this.data.screenWidth/2){
                this.setData({templateFlag:true,colorTitle:++this.data.colorTitle });
                if(this.data.colorTitle>this.data.data.length){
                    this.setData({templateFlag:true,colorTitle:0 })
                } else if(this.data.colorTitle==this.data.data.length){
                    this.setData({templateFlag:false,colorTitle:this.data.data.length })
                }
            }
        }else{
            //console.log(this.data.startsWidth-this.data.endWidth)
            if(this.data.endWidth-this.data.startsWidth >= this.data.screenWidth/2){
                this.setData({templateFlag:true,colorTitle:--this.data.colorTitle });
                if(this.data.colorTitle>this.data.data.length){
                    this.setData({templateFlag:true,colorTitle:0 })
                }else if(this.data.colorTitle<0){
                    this.setData({templateFlag:false,colorTitle:this.data.data.length})
                }
            }
        }

    },
    handleTouchStart(e){
        //console.log(e.changedTouches[0].clientX)

        this.setData({startsWidth:e.changedTouches[0].clientX})
    },
    handleTouchMove(){

    },
    handleTouchBottom(e){
        wx.request({
            url: "http://127.0.0.1:55079/appservice/list.json",
            success: this.handleSuccessMore.bind(this)
        });
    },
    handleSuccessMore(res){
        this.setData({isMore:false})
        //if(res.data.code == 1000){
            if(res.data.data.length == 0){
                this.setData({hsaMore:false})
            }else{
                this.setData({hsaMore:true})
            }
       // }
        // this.data.shareList.push(...res.data.data);
        // console.log(this.data.shareList);
    }

})

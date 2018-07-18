//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        data: [],
        shareList:[],
        heightFlag:true,
        item1: {
            index: 1,
            msg: 'this is a template',
            time: '2016-09-15'
        },
        userInfo: {},
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
    onLoad: function () {
        wx.request({
            url: "http://127.0.0.1:55079/appservice/index.json",
            success: this.handleSuccess.bind(this)
        });
        wx.request({
            url: "http://127.0.0.1:55079/appservice/share.json",
            success: this.handleSuccessShare.bind(this)
        });
        wx.request({
            url: "http://127.0.0.1:55079/appservice/list.json",
            success: this.handleSuccessShare.bind(this)
        });
        wx.getUserInfo({
            success: this.handleGetUserInfo.bind(this)
        });
        //获取屏幕的宽度
        let that =this;
        wx.getSystemInfo({
            success: function(res) {
                that.setData({screenWidth:res.screenWidth,screenHeight:res.screenHeight})
            }
        });
    },
    handleSuccessShare(res){
        this.setData({shareList:res.data.data})
    },
    handleSuccess(res) {
        this.setData({data: res.data.tab})
    },
    handleGetUserInfo(res) {
        this.setData({userInfo: res.userInfo})
        console.log(1111111111111111)
        console.log(res.userInfo)
    },
    handleTab(e){
       // console.log(e.currentTarget.dataset.name)
        if(e.currentTarget.dataset.name == 'share'){
            console.log(e.currentTarget.dataset.name)
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
            console.log(this.data.startsWidth-this.data.endWidth)
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
        console.log(e.changedTouches[0].clientX)

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

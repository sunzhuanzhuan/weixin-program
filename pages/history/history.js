

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
Page({
    data:{
        myData:[]
    },
    onLoad:function(options){
       
        this.appState = gdt.localState;
        console.log(this.appState.myCollectArtical);

        this.setData({ 
            makeMyCollectArtical: this.appState.myCollectArtical,
            makeMyCollectVideo: this.appState.MyCollectVideo,
            myViews: this.appState.myViews, 
        });
        const makeMyCollectArtical = ()=> {
            this.appState.myCollectArtical.forEach((x)=> {
                const entity = x.entity;
                if (!entity) {
                    return;
                }
                entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
                entity.readTimes = entity.readTimes || 0;
                entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
                let read = entity.readTimes +''
                  if(read.length === 1){
                      entity.readTimes = parseInt(Math.random()*20+30)
                  }
            });
            this.setData({ makeMyCollectArtical: this.appState.MyCollectArtical });
           
        };
        const makeMyCollectVideo = ()=> {
            this.appState.myCollectVideo.forEach((x)=> {
                const entity = x.entity;
                if (!entity) {
                    return;
                }
                entity._sourceWxDisplayName = entity.sourceWxNickname || '-'
                entity.readTimes = entity.readTimes || 0;
                entity._publishedFromNow = util.moment(entity.publishedAt).fromNow();
                let read = entity.readTimes +''
                  if(read.length === 1){
                      entity.readTimes = parseInt(Math.random()*20+30)
                  }
            });
            
            this.setData({ makeMyCollectVideo: this.appState.MyCollectVideo},()=>{
                
            });
           
        };
        gdt.on('collectVideoItems', ()=> {
             this.setData({ makeMyCollectArtical: res });
            
        });
        gdt.on('collectArticalItems', ()=> {
            this.setData({ makeMyCollectArtical: res });
            
        });
        gdt.on('viewsItems', ()=> {
            this.setData({ myViews: this.appState.myViews });
            
        });
        
        gdt.fetchDashboardAnalytics();
       
        
        console.log(this.data)
        if(options.type === 'history'){
            gdt.magicMyViewsFirstLoad().then((res)=>{
                this.setData({ myData: res});
            })
        }else if(options.type === 'artical'){
            gdt.magicMyCollectArticalFirstLoad().then((res)=>{
                this.setData({ myData: res });
            });
        }else{
            gdt.magicMyCollectVideoFirstLoad().then((res)=>{
                this.setData({ myData: res });
            });
        }
        
        
        
        
        
    },
    //进入详情
    handleDetail:function(e){
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
        })
    }
})
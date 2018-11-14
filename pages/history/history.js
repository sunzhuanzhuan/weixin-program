

let app = getApp().globalData;
const gdt = app.applicationDataContext;
const util = require('../../utils/util');
Page({
    data:{
        name:'',
        myCollectArtical:[],
        myCollectVideo:[],
        myViews:[]

    },
    onLoad:function(options){
       this.setData({name:options.type})
        this.appState = gdt.localState;
        
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
            this.setData({ myCollectArtical: this.appState.myCollectArtical });
            
           
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
            
            this.setData({ myCollectVideo: this.appState.myCollectVideo});
            
        };
        const makeMyViews = ()=> {
            this.appState.myViews.forEach((x)=> {
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
            
            this.setData({ myViews: this.appState.myViews});
           
        };
        gdt.on('collectVideoItems',makeMyCollectVideo);
        gdt.on('collectArticalItems',makeMyCollectArtical);
        gdt.on('viewsItems',makeMyViews);
        
        gdt.fetchDashboardAnalytics();
       
        let that = this
       
        if(options.type === 'history'){
            gdt.magicMyViewsFirstLoad();
           
        }else if(options.type === 'artical'){
            gdt.magicMyCollectArticalFirstLoad();
           
        }else{
            gdt.magicMyCollectVideoFirstLoad();
            
        }
        
        
        
        
    },
    //进入详情
    handleDetail:function(e){
        wx.navigateTo({
            url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id
        })
    }
})


let app = getApp().globalData;
const gdt = app.applicationDataContext;

Page({
    data:{
        url:''
    },
    onLoad:function(){
        gdt.baseServerUri.then((res)=>{
            
            this.setData({
                url:'https://'+res.split('/')[2] +'/static/images/mini_show.gif'
            })

        })
    },
    handleContent:function(){
        wx.setClipboardData({
            data: 'xiaoyujuhe123',
            success (res) {
              wx.getClipboardData({
                success (res) {
                  console.log(res.data) // data
                }
              })
            }
          })
    }
})
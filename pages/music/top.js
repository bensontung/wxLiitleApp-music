var util = require('../../utils/util.js')
Page({
  onReady: function (e) {
    var that =this
    // 初始歌单
    that.getMusicList(6,"港台");
    //
     setInterval(function(){
            that.checkProgress()
          },1000)
  },
  data: {
    indexId:0,
    topid:0,
    topname:"",
    open:false,
    songId:0,
    playSta:0,
    isNext:0,
    percent:0,
    songList:[],
    topList:[
      {
        topid:3,
        name:"欧美"
      },
      {
        topid:5,
        name:"内地"
      },
      {
        topid:6,
        name:"港台"
      },
      {
        topid:26,
        name:"热歌"
      }
    ]
  },
  onLoad: function () {
    var that = this
    //调用应用实例的方法获取全局数据

  //监听停止
    // wx.onBackgroundAudioStop(function() {
    //   //获取状态
    //   wx.getBackgroundAudioPlayerState({
    //       success: function(res) {
    //           //console.log("playSta stop >"+JSON.stringify(res))
    //           if(res.currentPosition==res.duration) { //结束跳到下一首
    //             var indexId=that.data.indexId + 1
    //             if(indexId >= that.data.songList.length){
    //               indexId = 0
    //             }
    //             that.setData({
    //               songId:that.data.songList[indexId].songid,
    //               playSta:1,
    //               percent:0,
    //               indexId:indexId
    //             })
    //             wx.playBackgroundAudio({
    //                 dataUrl: that.data.songList[indexId].url,
    //                 title: that.data.songList[indexId].songname,
    //                 coverImgUrl: that.data.songList[indexId].albumpic_big
    //             })

    //           } 
    //       }
    //     })  

    //   }) 

  
    

  },
 goPlay: function(e){
   var that = this
       if(e.currentTarget.id==this.data.songId){ //选择同一首
           if(this.data.playSta){
             this.setData({
              playSta:0
             })
             wx.pauseBackgroundAudio()
           }else{
              this.setData({
                playSta:1
              })
             wx.playBackgroundAudio({
                  dataUrl: e.currentTarget.dataset.url,
                  title: e.currentTarget.dataset.title,
                  coverImgUrl: e.currentTarget.dataset.cover
              })
           }
       }else{ 
         that.setData({
           songId:e.currentTarget.id,
           playSta:1,
           percent:0,
           indexId:e.currentTarget.dataset.index
         })
         //play new
        wx.stopBackgroundAudio()
        wx.playBackgroundAudio({
            dataUrl: e.currentTarget.dataset.url,
            title: e.currentTarget.dataset.title,
            coverImgUrl: e.currentTarget.dataset.cover,
            success: function(res){
              var indexId =that.data.indexId
              var list={
                songid: that.data.songList[indexId].songid,
                songname: that.data.songList[indexId].songname,
                singername: that.data.songList[indexId].singername,
                albumpic_small: that.data.songList[indexId].albumpic_small,
                albumpic_big: that.data.songList[indexId].albumpic_big,
                url:that.data.songList[indexId].url
              }
              util.addList(list)
            }
        })
         //监听停止
        wx.onBackgroundAudioStop(function() {
          //获取状态
          wx.getBackgroundAudioPlayerState({
              success: function(res) {
                  //console.log("playSta stop >"+JSON.stringify(res))
                  if(res.currentPosition==res.duration) { //结束跳到下一首
                    var indexId=that.data.indexId + 1
                    if(indexId >= that.data.songList.length){
                      indexId = 0
                    }
                    that.setData({
                      songId:that.data.songList[indexId].songid,
                      playSta:1,
                      percent:0,
                      indexId:indexId
                    })
                    wx.playBackgroundAudio({
                        dataUrl: that.data.songList[indexId].url,
                        title: that.data.songList[indexId].songname,
                        coverImgUrl: that.data.songList[indexId].albumpic_big,
                        success: function(res){
                          var list={
                            songid: that.data.songList[indexId].songid,
                            songname: that.data.songList[indexId].songname,
                            singername: that.data.songList[indexId].singername,
                            albumpic_small: that.data.songList[indexId].albumpic_small,
                            albumpic_big: that.data.songList[indexId].albumpic_big,
                            url:that.data.songList[indexId].url
                          }
                          util.addList(list)
                        }
                    })

                  } 
              }
            })  
        }) 



       }
 },
//选择类型
chooseTop: function(e){
  if(e.currentTarget.id !=this.data.topid){
         var id=e.currentTarget.id,name=e.currentTarget.dataset.name;
         this.getMusicList(id,name)
         this.setData({
            open: !this.data.open
          })  
  }
},
//展收
kindToggle: function(){
  this.setData({
     open: !this.data.open
   })
},
//获取歌单
 getMusicList: function(id,name){
   var that = this
   wx.request({
      url: 'https://mall.mifa.net/test2.php', 
      data: {
        topid: id,
        getType:"top" 
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        //console.log(res)
          if(res.data.showapi_res_code==0){
            if(res.data.showapi_res_body.ret_code==0){
              that.setData({
              topid:id,
              topname:name,
              songList: res.data.showapi_res_body.pagebean.songlist.slice(0,20)
            });
            }
          }
      }
  })

 },
 //check progress 播放进程状态
 checkProgress: function(){
   var that = this
   if(that.data.playSta){
     wx.getBackgroundAudioPlayerState({
        success: function(res) {
            if(res.status==1){
                var percentProgress = res.currentPosition/res.duration*100
                that.setData({
                  percent:percentProgress
                })
            }
        }
    })
   }
 }
 

})
var util = require('../../utils/util.js')
Page({
  onReady: function (e) {
    var that =this
     setInterval(function(){
            that.checkProgress()
          },1000)
  },
  onShow: function (e){
    var mylist  = util.getStor("list")
    if(!util.isEmpty(mylist)){
      mylist  = JSON.parse(mylist)
      mylist.sort(util.sortBy('time',0))
    }
    this.setData({
        songList: mylist
      });
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
    songList:[]
    },
  onLoad: function () {

  },
 delList: function(e){
   util.delList(e.currentTarget.dataset.songid)
   var mylist  = util.getStor("list")
   if(!util.isEmpty(mylist)){
     mylist  = JSON.parse(mylist)
     mylist.sort(util.sortBy('time',0))
   }
   this.setData({
      songList: mylist
    }); 
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
         this.setData({
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
            coverImgUrl: e.currentTarget.dataset.cover
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
                        coverImgUrl: that.data.songList[indexId].albumpic_big
                    })

                  } 
              }
            })  
        }) 



       }
 },
//获取歌单
 getMusicList: function(id,name){
   var that = this
   wx.request({
      url: 'https://mall.mifa.net/favor.php', 
      data: {
        topid: "",
        getType:"favor" 
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
        //console.log(res.data)
            that.setData({
              songList: res.data
            });
           
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
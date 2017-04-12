var util = require('../../utils/util.js')
//获取应用实例
var app = getApp()
Page({
  data: {
    userInfo: {},
    inputShowed: false,
    inputVal: "",
    indexId:0,
    songId:0,
    playSta:0,
    isNext:0,
    percent:0,
    songList:[],
    keyword:[]
  },
  //事件处理函数
  onReady: function(){
    var that = this
    setInterval(function(){
      that.checkProgress()
    },1000)
  },
  onLoad: function () {
    //console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    var keyList=util.getStor("key")
    console.log(keyList);
    if(!util.isEmpty(keyList)){
      //keyList=JSON.parse(keyList)
       that.setData({
        keyword:JSON.parse(keyList)
      })
    }
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })
    })
     

  },
  formSubmit: function(e) {
    //console.log('form发生了submit事件，携带数据为：', this.data.inputVal)
    var that = this
    var keyword=that.data.inputVal
    if(keyword != ""){
      util.addKeyword(keyword)
      this.setData({
                keyword:JSON.parse(util.getStor("key")),
                inputShowed: false
      }) 
      wx.request({
      url: 'https://mall.mifa.net/test2.php', 
      data: {
        keyword: keyword,
        getType:"search" 
      },
      header: {
          'content-type': 'application/json'
      },
      success: function(res) {
         //console.log(res)
          if(res.data.showapi_res_code==0){
            if(res.data.showapi_res_body.ret_code==0){
              that.setData({
              songList: res.data.showapi_res_body.pagebean.contentlist.slice(0,20)
            });
            }
          }
      }
  })
    }
  },
  formReset: function() {
    console.log('form发生了reset事件')
  },
  showInput: function () {
        this.setData({
            inputShowed: true
        });
    },
    hideInput: function () {
        this.setData({
            inputVal: "",
            inputShowed: false
        });
    },
    clearInput: function () {
        this.setData({
            inputVal: ""
        });
    },
    inputTyping: function (e) {
        this.setData({
            inputVal: e.detail.value,
            inputShowed: true
        });
    },
    chooseInput: function (e){
        this.setData({
            inputVal: e.currentTarget.dataset.keyword,
            inputShowed: false
        });
        this.formSubmit();
    },
    delKey: function (e){
           util.delKeyword(e.currentTarget.dataset.keyword)
           this.setData({
                keyword:JSON.parse(util.getStor("key"))
            }) 
    },
    //播放音乐
    goPlay: function(e){
      var that = this
     //console.log(e.currentTarget.dataset.url)
       if(e.currentTarget.id==this.data.songId){
           if(this.data.playSta){
             this.setData({
              playSta:0
             })
             wx.pauseBackgroundAudio()
           }else{
              this.setData({
                playSta:1,
                indexId:e.currentTarget.dataset.index
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
            coverImgUrl: e.currentTarget.dataset.cover,
            success: function(res){
              var indexId =that.data.indexId
              var list={
                songid: that.data.songList[indexId].songid,
                songname: that.data.songList[indexId].songname,
                singername: that.data.songList[indexId].singername,
                albumpic_small: that.data.songList[indexId].albumpic_small,
                albumpic_big: that.data.songList[indexId].albumpic_big,
                url:that.data.songList[indexId].m4a
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
                      dataUrl: that.data.songList[indexId].m4a,
                      title: that.data.songList[indexId].songname,
                      coverImgUrl: that.data.songList[indexId].albumpic_big,
                      success: function(res){
                        var list={
                          songid: that.data.songList[indexId].songid,
                          songname: that.data.songList[indexId].songname,
                          singername: that.data.songList[indexId].singername,
                          albumpic_small: that.data.songList[indexId].albumpic_small,
                          albumpic_big: that.data.songList[indexId].albumpic_big,
                          url:that.data.songList[indexId].m4a
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
 //check progress 播放进程状态
 checkProgress: function(){
   var that = this
   if(that.data.playSta){
     wx.getBackgroundAudioPlayerState({
        success: function(res) {
            // var status = res.status
            // var dataUrl = res.dataUrl
            // var currentPosition = res.currentPosition
            // var duration = res.duration
            // var downloadPercent = res.downloadPercent
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

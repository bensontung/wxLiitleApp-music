//时间格式化
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}
//本地缓存存取
function setStor(name,value){
  wx.setStorageSync(name,value)
}
function getStor(name){
  return  wx.getStorageSync(name) || []
}
//判断空值
function isEmpty(value) {
  return (Array.isArray(value) && value.length === 0) 
      || (Object.prototype.isPrototypeOf(value) && Object.keys(value).length === 0);
}
//排序
function sortBy(attr,rev){
        //attr:排序字段, rev: 1升序,0降序
        if(rev ==  undefined){
            rev = 1;
        }else{
            rev = (rev) ? 1 : -1;
        }
        return function(a,b){
            a = a[attr];
            b = b[attr];
            if(a < b){
                return rev * -1;
            }
            if(a > b){
                return rev * 1;
            }
            return 0;
        }
    }
//播放记录
function addList(list){
   var musicList = getStor("list")
   if(isEmpty(musicList)){
      var list2 = {
        songid: list.songid,
        songname: list.songname,
        singername: list.singername,
        albumpic_small: list.albumpic_small,
        albumpic_big: list.albumpic_big,
        url:list.url,
        time:Date.now()
      }
      musicList.unshift(list2)
      //保存歌单
      setStor('list',JSON.stringify(musicList))
   }else{
     var jsonstr = JSON.parse(musicList)
     var result=false
      //查找是否有在
      for(var i in jsonstr){
          if(jsonstr[i].songid==list.songid){
              jsonstr[i].time=Date.now()
              result = true
          }
      }
      if(!result){
        jsonstr.unshift({
          songid: list.songid,
          songname: list.songname,
          singername: list.singername,
          albumpic_small: list.albumpic_small,
          albumpic_big: list.albumpic_big,
          url:list.url,
          time:Date.now()
        })
      }
      if(jsonstr.length>50){
        jsonstr.pop()
      }
      //jsonstr.sort(sortBy('time',0)) //排序
      //保存歌单
      setStor('list',JSON.stringify(jsonstr))
      jsonstr = null
   }
   musicList = null
}
function delList(id){
  var oldList = getStor("list")
  if(!isEmpty(oldList)){
      var jsonstr = JSON.parse(oldList)
      var list =[]
      var result = false
      for(var i in jsonstr){
          if(jsonstr[i].songid==id){
              result = true
          }else{
             list.push(jsonstr[i])
          }
      }
      if(result){
        setStor('list',JSON.stringify(list))
      }
      list=null  
  }
 oldList=null
}
//搜索记录
function addKeyword(e){
  var keyList = getStor("key")
   if(isEmpty(keyList)){
      var list = {
        keyword: e,
        time:Date.now()
      }
      keyList.unshift(list)
      //保存搜索词
      setStor('key',JSON.stringify(keyList))
   }else{
     var jsonstr = JSON.parse(keyList)
     var result=false
      //查找是否有在
      for(var i in jsonstr){
          if(jsonstr[i].keyword==e){
              jsonstr[i].time=Date.now()
              result = true
          }
      }
      if(!result){
        jsonstr.unshift({
          keyword: e,
          time:Date.now()
        })
      }
      if(jsonstr.length>5){
        jsonstr.pop()
      }
      jsonstr.sort(sortBy('time',0)) 
      //保存搜索词
      setStor('key',JSON.stringify(jsonstr))
      jsonstr = null
   }
   keyList = null
}
function delKeyword(e){
  var keyList = getStor("key")
  if(!isEmpty(keyList)){
      var jsonstr = JSON.parse(keyList)
      var list =[]
      var result = false
      for(var i in jsonstr){
          if(jsonstr[i].keyword==e){
              //jsonstr[i].time=Date.now()
              result = true
          }else{
             list.push(jsonstr[i])
          }
      }
      if(result){
        setStor('key',JSON.stringify(list))
      }
      list = null
      jsonstr = null
  }
  keyList = null
}

module.exports = {
  formatTime: formatTime,
  setStor: setStor,
  getStor: getStor,
  addList: addList,
  delList: delList,
  addKeyword: addKeyword,
  delKeyword: delKeyword,
  sortBy: sortBy,
  isEmpty: isEmpty
}

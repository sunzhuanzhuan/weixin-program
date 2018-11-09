
const moment = require('moment.min.js');

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatSeconds(value) {

  var second = parseInt(value);// 秒

  var mini = 0;// 分

  if(second > 60) {

      mini = parseInt(second/60);
      if(mini < 10){
        mini= '0'+mini
      }else{
        mini=mini
      }
      second = parseInt(second%60);
      if(second < 10){
        second='0' +second
      }else{
        second=second
        
      }
      return mini+':'+second
  }else{
    if(second < 10){
      return '00:0'+second
    }else{
      return '00:'+second
    }
    
  }

    

 

}

module.exports = {
  formatTime: formatTime,
  moment:moment,
  formatSeconds:formatSeconds
}

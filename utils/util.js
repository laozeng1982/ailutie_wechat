function formatTimeToString(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatDateToString(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  return [year, month, day].map(formatNumber).join('-')
}

function formatStringToDate(year, month, day) {

  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * for string date format like '2016-9-01' or '2016/9/01'
 */
function formatStringToDate(date, spliter) {
  var year = date.split(spliter)[0];
  var month = date.split(spliter)[1];
  var day = date.split(spliter)[2];

  return new Date(Date.UTC(year, month - 1, day));
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function formatStringDate(year, month, day) {
  return [year, month, day].map(formatNumber).join('-');
}

/**
 * 检查当前选择日期是否过期
 * 过期返回true，未过期返回false
 */
function isExpired(selectedDate) {
  var isExpired = false;

  var nowString = formatDateToString(new Date());
  var now = formatStringToDate(nowString, '-').getTime() / (3600 * 24 * 1000);
  var selected = formatStringToDate(selectedDate, '-').getTime() / (3600 * 24 * 1000);

  // console.log("now: ", now);
  // console.log("selected: ", selected);
  if (selected < now) {
    isExpired = true;
  } else {
    isExpired = false;
  }

  return isExpired;
}

function getMoveDays(startDay, isNext, dayCount) {
  var selectedDayTimeMills = formatStringToDate(startDay, '-').getTime();
  var moveDayTimeMills;
  //时间改变一天，直接加上、或减去一天的毫秒数
  if (isNext) {
    moveDayTimeMills = selectedDayTimeMills + 3600 * 24 * 1000 * dayCount;
  } else {
    moveDayTimeMills = selectedDayTimeMills - 3600 * 24 * 1000 * dayCount;
  }
  var moveDayDate = new Date();
  moveDayDate.setTime(moveDayTimeMills);
  console.log("move to ", moveDayDate + ".............");

  return formatDateToString(moveDayDate);

}

/**
 * 这个是重量单位选择器的函数，先放着
 */
function onChangeMeasure(e) {
  var measurement;
  if (e.detail.value) {
    measurement = 'Kg';
  } else {
    measurement = 'Lb';
  }
  this.setData({
    curMeasurement: measurement
  });

  console.log(e.detail.value);
  console.log(this.data.curMeasurement);
}

module.exports = {
  formatTimeToString: formatTimeToString,
  formatDateToString: formatDateToString,
  formatStringToDate: formatStringToDate,
  formatStringDate: formatStringDate,
  isExpired: isExpired,
  getMoveDays: getMoveDays
}

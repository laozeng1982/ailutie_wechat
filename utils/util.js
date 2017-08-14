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
  var month =  date.split(spliter)[1];
  var day = date.split(spliter)[2];

  return new Date(Date.UTC(year, month - 1, day));
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTimeToString: formatTimeToString,
  formatDateToString: formatDateToString,
  formatStringToDate: formatStringToDate
}

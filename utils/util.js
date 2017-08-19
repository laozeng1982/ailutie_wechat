/**
 * 工具类包，提供以下功能：
 * 1、日期之间的转换，日期和字符串的转换
 * 
 */

import DataType from '../datamodel/DataType.js'

const DATATYPE = new DataType.DataType();

/**
 * 将日期和时间转为指定格式，例如：2017-08-30 15:30:25
 * 参数：date，日期类（Date）
 */
function formatTimeToString(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

/**
 * 将日期转为指定格式，例如：2017-08-30
 * 参数：date，日期类（Date）
 */
function formatDateToString(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();

    return [year, month, day].map(formatNumber).join('-');
}

/**
 * 给定年月日，取得当前时间
 * 参数year：年
 * 参数month：月，自然月
 * 参数day：当月第day日
 */
function getDateFromString(year, month, day) {

    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * 将字符串日期转换为日期类，得到对应的日期对象
 * 参数date：字符串表示的日期，比如 '2016-9-01'或者'2016/9/01'
 * 参数spliter：字符串中的分隔符
 */
function getDateFromString(date, spliter) {
    var year = date.split(spliter)[0];
    var month = date.split(spliter)[1];
    var day = date.split(spliter)[2];

    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * 格式化输出日期字符串，输出格式为：2017-08-30
 * 参数year：年
 * 参数month：月，自然月
 * 参数day：当月第day日
 */
function formatStringDate(year, month, day) {
    return [year, month, day].map(formatNumber).join('-');
}

/**
 * 
 */
function formatNumber(n) {
    n = n.toString()
    return n[1] ? n : '0' + n
}



/**
 * 检查当前选择日期是否过期
 * 过期返回true，未过期返回false
 */
function isExpired(selectedDate) {
    var isExpired = false;

    var nowString = formatDateToString(new Date());
    var now = getDateFromString(nowString, '-').getTime() / (3600 * 24 * 1000);
    var selected = getDateFromString(selectedDate, '-').getTime() / (3600 * 24 * 1000);

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
    var selectedDayTimeMills = getDateFromString(startDay, '-').getTime();
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
    that.setData({
        curMeasurement: measurement
    });

    console.log(e.detail.value);
    console.log(that.data.curMeasurement);
}

function isLogin() {
    var app = getApp();
    if (!app.globalData.isLogin) {
        console.log("No user login...");
        return false;
    } else {
        console.log(app.globalData.userInfo.aa, "login");
        return true;
    }
}

/**
 * 检查用户是否有注册，如果没有注册，将不能远程同步
 */
function checkSignUp() {
    var userInfo = wx.getStorageSync("UserInfo");
    // console.log(userInfo.length);
    return (userInfo.length == 0);
}

function showToast(text, o, count) {
    var that = o;
    count = parseInt(count) ? parseInt(count) : 3000;
    that.setData({
        toastText: text,
        isShowToast: true,
    });
    setTimeout(function () {
        that.setData({
            isShowToast: false
        });
    }, count);
}

/**
   * 根据第一列数据的变化，动态获取第二列的值
   */
function getMovementNamePickerList(idxOfColumn1) {
    var app = getApp();
    var movementNamePickerList;
    switch (idxOfColumn1) {
        case 0:
            //0、胸部
            movementNamePickerList = app.globalData.movementNameArrayPectorales;
            break;
        case 1:
            //1、肩部
            movementNamePickerList = app.globalData.movementNameArrayShoulder;
            break;
        case 2:
            //2、背部
            movementNamePickerList = app.globalData.movementNameArrayDorsal;
            break;
        case 3:
            //3、腰部
            movementNamePickerList = app.globalData.movementNameArrayWaist;
            break;
        case 4:
            //4、腹部
            movementNamePickerList = app.globalData.movementNameArrayAbdomen;
            break;
        case 5:
            //5、肱二头
            movementNamePickerList = app.globalData.movementNameArrayArmBiceps;
            break;
        case 6:
            //6、肱三头
            movementNamePickerList = app.globalData.movementNameArrayArmTriceps;
            break;
        case 7:
            //7、小臂
            movementNamePickerList = app.globalData.movementNameArrayForeArm;
            break;
        case 8:
            //8、股二头
            movementNamePickerList = app.globalData.movementNameArrayFemorisBiceps;
            break;
        case 9:
            //9、股四头
            movementNamePickerList = app.globalData.movementNameArrayFemorisQuadriceps;
            break;
        case 10:
            //10、小腿
            movementNamePickerList = app.globalData.movementNameArrayShank;
            break;
        default:
            break;
    };
    return movementNamePickerList;
}

module.exports = {
    formatTimeToString: formatTimeToString,
    formatDateToString: formatDateToString,
    getDateFromString: getDateFromString,
    formatStringDate: formatStringDate,
    isExpired: isExpired,
    isLogin: isLogin,
    checkSignUp: checkSignUp,
    showToast: showToast,
    getMovementNamePickerList: getMovementNamePickerList,
    getMoveDays: getMoveDays,

}

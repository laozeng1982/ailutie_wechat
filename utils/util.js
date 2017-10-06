/**
 * 工具类包，提供以下功能：
 * 1、日期之间的转换，日期和字符串的转换
 *
 */

import StorageType from '../datamodel/StorageType.js'

const STORAGETYPE = new StorageType.StorageType();

/**
 * 将日期和时间转为指定格式，例如：2017-08-30 15:30:25
 * 参数：date，日期类（Date）
 */
function formatTimeToString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':');
}

/**
 * 将日期转为指定格式，例如：2017-08-30
 * 参数：date，日期类（Date）
 */
function formatDateToString(date) {
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

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
function getDateFromString(date, splicer) {
    let year = date.split(splicer)[0];
    let month = date.split(splicer)[1];
    let day = date.split(splicer)[2];

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
    n = n.toString();
    return n[1] ? n : '0' + n;
}

function log(msg) {
    // let time = formatTimeToString(new Date());
    let trace = (new Error()).stack.split("\n")[2].replace(/(^\s*)|(\s*$)/g, "");
    console.log(trace);
    // console.error(trace);
    let name = trace.toString().split(" ")[0] + " " + trace.split(" ")[1] + ":";
    console.log(name, msg);
}

/**
 * 检查当前选择日期与今天的关系
 * 过期返回：-1
 * 今天返回：0
 * 将来返回：1
 */
function dateDirection(selectedDate) {
    let direction = -1;

    let nowString = formatDateToString(new Date());
    let now = getDateFromString(nowString, '-').getTime() / (3600 * 24 * 1000);
    let selected = getDateFromString(selectedDate, '-').getTime() / (3600 * 24 * 1000);

    // console.log("now: ", now);
    // console.log("selected: ", selected);

    let distance = datesDistance(selectedDate, formatDateToString(new Date()));
    if (distance > 0) {
        direction = -1;
    } else if (distance === 0) {
        direction = 0;
    } else {
        direction = 1;
    }

    return direction;
}

/**
 * 检查当前选择日期与今天的关系
 * 返回end时间到start的天数，正数表示end时间靠后，反之亦然
 */
function datesDistance(start, end) {
    let distance;

    let startTime = getDateFromString(start, '-').getTime() / (3600 * 24 * 1000);
    let endTime = getDateFromString(end, '-').getTime() / (3600 * 24 * 1000);

    distance = endTime - startTime;

    console.log("day distance is: " + distance);

    return distance;
}

/**
 *
 * @param startDay
 * @param isNext
 * @param dayCount
 */
function getMovedDate(startDay, isNext, dayCount) {
    let selectedDayTimeMills = getDateFromString(startDay, '-').getTime();
    let movedDayTimeMills;
    //时间改变一天，直接加上、或减去一天的毫秒数
    if (isNext) {
        movedDayTimeMills = selectedDayTimeMills + 3600 * 24 * 1000 * dayCount;
    } else {
        movedDayTimeMills = selectedDayTimeMills - 3600 * 24 * 1000 * dayCount;
    }
    let movedDayDate = new Date();
    movedDayDate.setTime(movedDayTimeMills);
    console.log("move to ", movedDayDate + ".............");

    return formatDateToString(movedDayDate);

}


/**
 *
 * @param startDate
 * @param checkDate
 * @param endDate
 */
function inPeriod(startDate, checkDate, endDate) {
    let startDateTimeMills = getDateFromString(startDate, '-').getTime();
    let checkDateTimeMills = getDateFromString(checkDate, '-').getTime();
    let endDateTimeMills = getDateFromString(endDate, '-').getTime();

    return checkDateTimeMills >= startDateTimeMills && checkDateTimeMills <= endDateTimeMills;
}

function objClone(obj) {
    if (obj instanceof Object) {
        let copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = objClone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/**
 * 这个是重量单位选择器的函数，先放着
 */
function onChangeMeasure(e) {
    let measurement;
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
    let app = getApp();
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
    let userInfo = wx.getStorageSync("UserInfo");
    // console.log(userInfo.length);
    return (userInfo.length == 0);
}

function showNormalToast(text, o, count) {
    let that = o;
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

function showWarnToast(text, o, count) {
    let that = o;
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
 * 把所有部位简写，生成一个长度合适显示的字符串
 * @param partArr
 * @returns {string}
 */
function makePartString(partArr) {
    // 先替换，换成单字
    var partArrString = partArr.toString().replace(/部/g, "").replace(/有氧/, "氧")
        .replace(/肱二头/, "臂").replace(/肱三头/, "臂").replace(/小臂/g, "臂")
        .replace(/股二头/g, "腿").replace(/股四头/g, "腿").replace(/小腿/g, "腿");

    let noRepeatStringArr = [];

    // 去重复，好像搞复杂了~~
    for (let item of partArrString) {
        if (item !== "," && !noRepeatStringArr.includes(item)) {
            noRepeatStringArr.push(item);
        }
    }
    // console.log("partArrString: ", partArrString);
    // console.log("noRepeatStringArr: ", noRepeatStringArr);
    let partString = noRepeatStringArr.length > 3 ? noRepeatStringArr.slice(0, 3).join(",") + "..." : noRepeatStringArr.join(",");

    return partString;
}

/**
 * 根据第一列数据的变化，动态获取第二列的值
 */
function getMovementNamePickerList(idxOfColumn1) {
    let app = getApp();
    let movementNamePickerList;
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
    }

    return movementNamePickerList;
}

module.exports = {
    formatTimeToString: formatTimeToString,
    formatDateToString: formatDateToString,
    getDateFromString: getDateFromString,
    formatStringDate: formatStringDate,
    formatNumber: formatNumber,
    dateDirection: dateDirection,
    datesDistance: datesDistance,
    isLogin: isLogin,
    checkSignUp: checkSignUp,
    showNormalToast: showNormalToast,
    showWarnToast: showWarnToast,
    getMovementNamePickerList: getMovementNamePickerList,
    getMovedDate: getMovedDate,
    inPeriod: inPeriod,
    makePartString: makePartString,
    log: log

}

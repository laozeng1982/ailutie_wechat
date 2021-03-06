/**
 * 工具类包，提供以下功能：
 * 1、日期之间的转换，日期和字符串的转换
 *
 */
import User from '../datamodel/User'
import PlanSet from '../datamodel/PlanSet'
import SystemSetting from '../datamodel/SystemSetting'

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
function getDateFromNumbers(year, month, day) {
    return new Date(Date.UTC(year, month - 1, day));
}

/**
 * 将字符串日期转换为日期类，得到对应的日期对象
 * 参数date：字符串表示的日期，比如 '2016-9-01'或者'2016/9/01'
 * 参数splicer：字符串中的分隔符
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
 * 格式化输出数字，固定位数
 * @param n，位数
 */
function formatNumber(n) {
    n = n.toString();
    return n[1] ? n : '0' + n;
}

/**
 * 两个简单数组比较相等
 * @param array1
 * @param array2
 */
function compare2Array(array1, array2) {
    return (array1.length === array2.length) &&
        array1.every(function (element, index) {
            return element === array2[index];
        });
}

/**
 * 检查当前选择日期与今天的关系
 * 过期，则返回：-1
 * 今天，则返回：0
 * 将来，则返回：1
 */
function dateDirection(selectedDate) {
    let direction = -1;

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
    // console.log("move to ", movedDayDate + ".............");

    return formatDateToString(movedDayDate);
}

/**
 *
 * @param startDate
 * @param checkDate
 * @param endDate
 */
function checkDate(startDate, checkDate, endDate) {
    let startDateTimeMills = getDateFromString(startDate, '-').getTime();
    let checkDateTimeMills = getDateFromString(checkDate, '-').getTime();
    let endDateTimeMills = getDateFromString(endDate, '-').getTime();

    return startDateTimeMills <= checkDateTimeMills && checkDateTimeMills <= endDateTimeMills;
}

/**
 * 检查用户是否有注册，如果没有注册，将不能远程同步
 */
function checkSignUp() {
    let userInfo = wx.getStorageSync("UserInfo");
    // console.log(userInfo.length);
    return (userInfo.length === 0);
}

/**
 * 显示正常提示
 * @param text
 * @param host
 * @param count
 */
function showNormalToast(text, host, count) {
    let that = host;
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
 * 显示警告提示
 * @param text
 * @param host
 * @param count
 */
function showWarnToast(text, host, count) {
    let that = host;
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
    var partArrString = partArr.toString().replace(/部/g, "").replace(/全身/g, "氧").replace(/手臂/g, "臂");

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
 * 深度克隆
 * @param obj
 * @returns {*}
 */
function deepClone(obj) {

    let clone = obj.constructor === Array ? [] : {};

    // 递归
    for (let item in obj) {
        if (obj.hasOwnProperty(item)) {
            clone[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
        }
    }

    return clone;
}

/**
 * 功能：从选中的日期读取指定内容
 * 参数1：key，要读取的数据
 * 参数2：dataType，数据类型（StrorageType）
 * 返回：请求类型的数据
 * 调用关系：外部函数，开放接口
 */
function loadData(dataType) {
    // 读取该类型数据已存储的内容
    var readInData = wx.getStorageSync(dataType.key);
    // 当天请求的数据
    var requestData = '';

    // 根据类型来抽取需要的数据
    // 如果没有这个记录，取的会是空值，则新建一个对应的项
    if (readInData !== "") {
        requestData = readInData;
    } else {
        switch (dataType.id) {
            case 0:
                // 0. UserInfo
                requestData = new User.UserInfo();
                break;
            case 1:
                // 1. UserProfile
                requestData = new User.UserProfile();
                break;
            case 2:
                // 2. DailyRecords
                if (typeof (requestData.date) !== "undefined" && requestData.date !== "") {
                    console.log("here222222222222222222222222222222");
                } else {
                    requestData = [];
                }
                break;
            case 3:
                requestData = new SystemSetting.SystemSetting();
                break;
            case 4:
                requestData = [];
                break;
            case 5:
                requestData = [];
                break;
            default:
                break;
        }
    }

    // console.log("in Controller.loadData, after loadData, requestData: ", requestData);

    return requestData;
}

/**
 *
 * @returns {*}
 */
function loadPlan() {
    let storageType = new SystemSetting.StorageType();
    let planSet = this.loadData(storageType.PlanSet);
    let currentPlan = '';

    console.log("planSet:", planSet);

    for (let plan of planSet) {
        if (plan.currentUse) {
            currentPlan = plan;
        }
    }

    return (currentPlan === '') ? new PlanSet.Plan() : currentPlan;
}

/**
 * 功能：存储数据
 * 参数1：dataType，数据类型（StrorageType）
 * 参数2：dataToSave，要存储的数据
 * 调用关系：外部函数，开放接口
 */
function saveData(dataType, dataToSave) {
    // 根据类型来判断是否需要替换其中的数据，还是直接覆盖
    console.log("in saveData, targetToSave: ", dataToSave);
    wx.setStorageSync(dataType.key, dataToSave);
}

module.exports = {
    formatTimeToString: formatTimeToString,
    formatDateToString: formatDateToString,
    getDateFromString: getDateFromString,
    formatStringDate: formatStringDate,
    formatNumber: formatNumber,
    dateDirection: dateDirection,
    datesDistance: datesDistance,
    checkSignUp: checkSignUp,
    showNormalToast: showNormalToast,
    showWarnToast: showWarnToast,
    getMovedDate: getMovedDate,
    checkDate: checkDate,
    makePartString: makePartString,
    compare2Array: compare2Array,
    deepClone: deepClone,
    loadData: loadData,
    loadPlan: loadPlan,
    saveData: saveData

}

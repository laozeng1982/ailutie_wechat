/**
 * 工具类包，提供以下功能：
 * 1、日期之间的转换，日期和字符串的转换
 *
 */
import User from '../datamodel/User'
import PlanSet from '../datamodel/PlanReality'
import SystemSetting from '../datamodel/SystemSetting'
import Urls from '../datamodel/Urls'

const _ = require('./underscore.modified');
// const Promise = require('./bluebird.min'); //用了bluebird.js
const BASE_URL = 'https://www.newpictown.com/';
const urls = new Urls.Urls();
const Storage = new SystemSetting.StorageType();

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
    let selectedDayTimeMills;
    let movedDayTimeMills;

    // 判断参数时间类型
    if (typeof startDay === "string") {
        selectedDayTimeMills = getDateFromString(startDay, '-').getTime();
    } else {
        selectedDayTimeMills = startDay.getTime();
    }

    //时间改变一天，直接加上、或减去一天的毫秒数
    if (isNext) {
        movedDayTimeMills = selectedDayTimeMills + 3600 * 24 * 1000 * dayCount;
    } else {
        movedDayTimeMills = selectedDayTimeMills - 3600 * 24 * 1000 * dayCount;
    }
    let movedDayDate = new Date();
    movedDayDate.setTime(movedDayTimeMills);
    // console.log("move to ", movedDayDate + ".............");

    // 根据输入返回
    if (typeof startDay === "string") {
        return formatDateToString(movedDayDate);
    } else {
        return movedDayDate;
    }

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

function isEqual(a, b) {
    return _.isEqual(a, b);
}

/**
 * 功能：从选中的日期读取指定内容
 * 参数1：key，要读取的数据
 * 参数2：dataType，数据类型（StorageType）
 * 返回：请求类型的数据
 * 调用关系：外部函数，开放接口
 */
function loadData(dataType) {
    // 读取该类型数据已存储的内容
    let readInData = wx.getStorageSync(dataType.key);
    // 当天请求的数据
    let requestData = '';

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
                requestData = [];
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
        // 满足三个条件：有效的plan，且未过期和正在使用
        if (typeof plan !== 'undefined' && dateDirection(plan.toDate) >= 0 && plan.currentUse) {
            currentPlan = plan;
        }
    }

    return (currentPlan === '') ? new PlanSet.Plan(getApp().userInfoLocal.userUID) : currentPlan;
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

/**
 * 计算基础代谢率
 */
function calcBMR() {
    // 同一环境下的同一种恒温动物，其基础代谢量与其体表面积成正比。
    // 人的体表面积S（cm2），可由体重W（kg）和身高H（cm），用各种实验式来计算。
    // Dubois氏（1915）式：S=Wx0.245 × Hx0.725 × 71.84，被普遍应用。
}

/**
 * 计算每个练习消耗的热量
 * @param exercise
 * @param isKCal
 */
function calcEnergyCost(exercise, isKCal) {
    // 先简单计算吧，按照行程1米来算。
    // 焦耳是功和能的单位 (F：力的单位N，S距离单位m，m质量单位kg， a加速度单位m/s^2
    // 功: W=FS=maS,1焦耳=1牛·米=1千克·平方米/二次方秒
    // 换算：4184焦耳=1000 热卡 即1000卡
    // 1卡=1卡路里=4.186焦耳；
    // 1千卡=1大卡(kcal)=1000卡=1000卡路里 =4186焦耳=4.186千焦(kJ)。
    // 卡路里 (简称“卡”，缩写为"calorie")的定义为将1克水在1大气压下提升1摄氏度所需要的热量。
    let exerciseEnergy = 0;
    let idx = 0;
    for (let group of exercise.groupSet) {
        exerciseEnergy += group.executedQuantityPerGroup * group.executedQuantityPerAction * 9.8 / 4186;  // 将焦耳换成卡
        // console.log(idx, exerciseEnergy);
        idx++;
    }

    return isKCal ? exerciseEnergy : exerciseEnergy * 1000;
}

/**
 * 同步爱撸铁设计的动作信息
 * @param host
 */
function syncActions(host) {
    // 获取后台服务器上的动作数据
    wx.request({
        url: 'https://www.newpictown.com/part/allPredefinedOnes',
        success: function (res) {
            console.log("in syncActions, body info:", res.data);
            host.actionArray = res.data;
        }
    });
}

/**
 * 同步用户的微信信息
 * @param host
 */
function syncWechatUserInfo(host) {
    // 获取用户的微信信息
    wx.getUserInfo({
        success: res => {
            // 可以将 res 发送给后台解码出 unionId
            console.log("in syncWechatUserInfo, wechatUserInfo: ", res.userInfo);
            host.wechatUserInfo = res.userInfo;
            host.userInfoLocal.nickName = res.userInfo.nickName;
            host.userInfoLocal.gender = res.userInfo.gender === 1 ? "Male" : "Female";
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            if (host.userInfoReadyCallback) {
                host.userInfoReadyCallback(res);
            }
        },
        fail: res => {
            console.log("failed: ", res);
        }
    });
}

function copyInfo(host, res) {
    host.userInfoLocal.userUID = res.data.id;
    host.userInfoLocal.birthday = res.data.dateOfBirth;
    host.userInfoLocal.nickName = res.data.nickName;
    host.userInfoLocal.gender = res.data.gender;
    host.userInfoLocal.height = res.data.extendedInfoMap.height.value;
    host.userInfoLocal.weight = res.data.extendedInfoMap.weight.value;
    host.userInfoLocal.wechatOpenId = res.data.wechatMPOpenId;
    host.userInfoLocal.wechatUnionId = res.data.wechatMPOpenId;

}

/**
 * 同步由爱撸铁设计的用户数据信息
 * @param host
 */
function syncUserInfo(host) {
    wx.login({
        success: function (res) {
            console.log("in syncUserInfo, login.res.code:", res);
            if (res.code) {
                // 1、获取js_code，去后台换取OpenId
                wx.request({
                    url: urls.user.getOpenId(res.code),
                    method: 'GET',
                    success: function (res) {
                        let openId = res.data;
                        console.log("in syncUserInfo, openId:", openId);
                        // 2、根据OpenId获取服务器上用户信息
                        if (typeof openId !== 'undefined' || openId !== '') {
                            wx.request({
                                    url: urls.user.byOpenId(openId),
                                    method: 'GET',
                                    success: function (res) {
                                        if (typeof res.data.id !== 'undefined') {
                                            console.log("in syncData, userInfo:", res.data);
                                            copyInfo(host, res);
                                            console.log("in syncData, host.userInfoLocal:", host.userInfoLocal);
                                            saveData(Storage.UserInfo, host.userInfoLocal);
                                        } else {
                                            console.log("in syncData, host.userInfoLocal:", host.userInfoLocal);
                                            host.userInfoLocal.wechatOpenId = openId;
                                            console.log("in syncData, no user exist!");
                                            wx.showModal({
                                                title: 'Error',
                                                content: '还未注册，去注册？',
                                                success: function (res) {
                                                    if (res.confirm) {
                                                        // 去注册
                                                        wx.redirectTo({
                                                            url: '/pages/settings/userinfo/userinfo?model=newUser',
                                                        });
                                                    } else if (res.cancel) {
                                                        console.log('用户取消UserUID');
                                                    }
                                                }
                                            });

                                        }
                                    },
                                    fail: function (res) {
                                        console.log("get fail: ", res.data);
                                    }
                                }
                            );
                        } else {
                            console.log("get OpenId fail: ", res.data);
                            wx.showModal({
                                title: 'Error',
                                content: '未能获取用户的OpenId，请检查网络',
                            });
                        }
                    },
                    fail: function (res) {
                        console.log("get OpenId fail: ", res.data);
                        wx.showModal({
                            title: 'Error',
                            content: '未能获取用户的OpenId，请检查网络',
                        });
                    }
                })
            }
        }
    });
}

/**
 * 同步数据
 * @param host
 * @param type
 * @param data2Sever
 * @param data2Local
 */
function syncData(host, type, data2Sever, data2Local) {
    switch (type) {
        case "actions":
            // 爱撸铁自定义动作列表
            syncActions(host);
            break;
        case "wechat":
            // 微信用户信息
            syncWechatUserInfo(host);
            break;
        case "user":
            // 爱撸铁用户信息
            syncUserInfo(host);
            break;
        case "plan":
            console.log("return id:", res.data.id);
            for (let plan of data2Local) {
                if (isEqual(plan, data2Sever)) {
                    plan.id = res.data.id;
                }
            }
            saveData(Storage.PlanSet, data2Local);
            console.log("create plan successful, res.data:", res.data);
            break;
        case "reality":
            for (let reality of data2Local) {
                if (reality.date = res.date) {
                    reality.id = res.data.id;
                }
            }

            saveData(Storage.RealitySet, data2Local);
            console.log("create reality successful, res.data:", res.data);
            break;
        default:
            console.log("in createData, wrong type!");
            break;
    }
}

/**
 * 到服务端创建数据，本地保存新建的数据
 * @param type
 * @param data2Sever
 * @param data2Local
 */
function createData(type, data2Sever, data2Local) {
    delete data2Sever.id;
    wx.request({
            url: BASE_URL + type + "/",
            method: 'POST',
            data: data2Sever,
            success: function (res) {
                if (typeof res.data.id !== 'undefined') {
                    switch (type) {
                        case "user":
                            data2Local.userUID = parseInt(res.data.id);
                            data2Local.wechatOpenId = data2Sever.wechatMPOpenId;
                            data2Local.nickName = data2Sever.nickName;
                            console.log("data2Local: ", data2Local);
                            saveData(Storage.UserInfo, data2Local);
                            console.log("create user successful, res.data:", res.data);
                            break;
                        case "plan":
                            console.log("return id:", res.data.id);
                            for (let plan of data2Local) {
                                if (isEqual(plan, data2Sever)) {
                                    plan.id = res.data.id;
                                }
                            }
                            saveData(Storage.PlanSet, data2Local);
                            console.log("create plan successful, res.data:", res.data);
                            break;
                        case "reality":
                            for (let reality of data2Local) {
                                if (reality.date = res.date) {
                                    reality.id = res.data.id;
                                }
                            }
                            saveData(Storage.RealitySet, data2Local);
                            console.log("create reality successful, res.data:", res.data);
                            break;
                        default:
                            console.log("in createData, wrong type!");
                            break;
                    }
                }
            },
            fail: function (res) {
                console.log("create fail: ", res.data);
            }
        }
    );
}

/**
 * 到服务端更新数据，本地保存更新的数据
 * @param type
 * @param data2Sever
 * @param data2Local
 */
function updateData(type, data2Sever, data2Local) {
    // 后台更新
    wx.request({
            url: BASE_URL + type + "/",
            method: 'PUT',
            data: data2Sever,
            success: function (res) {
                if (typeof res.data.id !== 'undefined') {
                    switch (type) {
                        case "user":
                            console.log("update user success: ", res.data);
                            saveData(Storage.UserInfo, data2Local);
                            break;
                        case "plan":
                            break;
                        case "reality":
                            break;
                        default:
                            console.log("in createData, wrong type");
                            break;
                    }
                }

            },
            fail: function (res) {
                console.log("update", type, "fail: ", res.data);
            }
        }
    );

}


module.exports = {
    formatTimeToString: formatTimeToString,
    formatDateToString: formatDateToString,
    getDateFromString: getDateFromString,
    formatStringDate: formatStringDate,
    formatNumber: formatNumber,
    dateDirection: dateDirection,
    datesDistance: datesDistance,
    showNormalToast: showNormalToast,
    showWarnToast: showWarnToast,
    getMovedDate: getMovedDate,
    checkDate: checkDate,
    makePartString: makePartString,
    compare2Array: compare2Array,
    deepClone: deepClone,
    isEqual: isEqual,
    underscore: _,
    loadData: loadData,
    loadPlan: loadPlan,
    saveData: saveData,
    calcEnergyCost: calcEnergyCost,
    createData: createData,
    updateData: updateData,
    syncData: syncData,
    // wxPromisify: wxPromisify

}

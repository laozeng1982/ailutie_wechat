/**
 * 工具类包，提供以下功能：
 * 1、日期之间的转换，日期和字符串的转换
 *
 */
import User from '../datamodel/User'
import PlanSet from '../datamodel/PlanSet'
import SystemSetting from '../datamodel/SystemSetting'

const _ = require('./underscore.modified');
const Promise = require('./bluebird.min'); //用了bluebird.js

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
        exerciseEnergy += group.executedQuantity * group.executedWeight * 9.8 / 4186;  // 将焦耳换成卡
        // console.log(idx, exerciseEnergy);
        idx++;
    }

    return isKCal ? exerciseEnergy : exerciseEnergy * 1000;
}

/**
 * 获取并设置app的OpenId
 */
function setWechatOpenId(host) {
    wx.login({
        success: function (res) {
            if (res.code) {
                //获取openId
                wx.request({
                    url: 'https://api.weixin.qq.com/sns/jscode2session',
                    data: {
                        //小程序唯一标识
                        appid: 'wxbea378c38515347c',
                        //小程序的 app secret
                        secret: 'cca9244dc17c06c3ab91ac9ee158c9d0',
                        grant_type: 'authorization_code',
                        js_code: res.code
                    },
                    method: 'GET',
                    header: {'content-type': 'application/json'},
                    success: function (openIdRes) {
                        console.log("登录成功返回的openId：", openIdRes.data);
                        // weChatUserInfo.openId = openIdRes.data.openid;
                        // 判断openId是否获取成功
                        if (openIdRes.data.openid != null && typeof openIdRes.data.openid !== 'undefined') {
                            // 有一点需要注意，询问用户是否授权，那提示是这API发出的
                            wx.getUserInfo({
                                success: function (data) {
                                    // 自定义操作，获取成功，传给全局变量
                                    host.openId = openIdRes.data.openid;
                                    console.log("登录成功返回的openId：" + openIdRes.data.openid);
                                },
                                fail: function (failData) {
                                    // TODO，二次授权
                                    wx.showModal({
                                        title: 'Warining',
                                        content: '如果不授权，将无法远程保存您的数据，“取消”不授权，“确定”授权',
                                        success: function (res) {
                                            if (res.confirm) {
                                                setWechatOpenIdAgain(host);
                                                console.log('用户点击确定')
                                            } else if (res.cancel) {
                                                console.log('用户点击取消')
                                            }
                                        }
                                    });
                                    console.log("用户拒绝授权");
                                }
                            });
                        } else {
                            console.log("获取用户openId失败");
                        }
                    },
                    fail: function (error) {
                        console.log("获取用户openId失败");
                        console.log(error);
                    }
                })
            }
        }
    });
}

/**
 * 手动打开微信授权
 */
function setWechatOpenIdAgain(host) {
    wx.openSetting({
        success: function (data) {
            //判断 用户是否同意授权
            if (data.authSetting["scope.userInfo"] === true) {
                // 同意授权
                wx.login({
                    success: function (res) {
                        if (res.code) {
                            console.log("登录成功返回的CODE：" + res.code);
                            //获取openId
                            wx.request({
                                url: 'https://api.weixin.qq.com/sns/jscode2session',
                                data: {
                                    // 小程序唯一标示
                                    appid: 'wxbea378c38515347c',
                                    // 小程序的 app secret
                                    secret: 'cca9244dc17c06c3ab91ac9ee158c9d0',
                                    grant_type: 'authorization_code',
                                    js_code: res.code
                                },
                                method: 'GET',
                                header: {'content-type': 'application/json'},
                                success: function (openIdRes) {
                                    // 获取到 openId
                                    console.log(openIdRes.data.openid);
                                    // 判断openId是否为空
                                    if (openIdRes.data.openid != null && typeof openIdRes.data.openid !== 'undefined') {
                                        wx.getUserInfo({
                                            success: function (data) {
                                                // 自定义操作，获取成功，传给全局变量
                                                host.openId = openIdRes.data.openid;
                                                console.log("登录成功返回的openId：" + openIdRes.data.openid);
                                            }
                                        })
                                    } else {
                                        // openId为空
                                    }
                                }
                            })
                        }
                    }
                });
            } else {
                // 手动开启是否授权提示框后，用户再次拒绝
            }
        }
    });
}

/**
 * 检查是否系统注册
 */
function checkRegister() {
    console.log("checking register");

    // 验证是否是首次使用爱撸铁，首次登陆，录入用户基本信息
    let userInfo = loadData((new SystemSetting.StorageType()).UserInfo);
    console.log("in checkRegister, userInfo: ", userInfo);
    let userUID = userInfo.userUID;

    if (typeof userUID === 'undefined' || userUID === -1) {
        // 去注册
        console.log("in checkRegister, go to User information record page!");
        wx.redirectTo({
            url: 'pages/settings/userinfo/userinfo?model=newUser',
        });
    }
}

/**
 * 提供获取微信信息的结构
 * @param host
 */
function setWechatUserInfo(host) {
    // 获取用户信息
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userInfo']) {
                // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                wx.getUserInfo({
                    success: res => {
                        // 可以将 res 发送给后台解码出 unionId
                        host.wechatUserInfo = res.userInfo;
                        console.log("in checkRegister, res.userInfo: ", res.userInfo);
                        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                        // 所以此处加入 callback 以防止这种情况
                        if (host.userInfoReadyCallback) {
                            host.userInfoReadyCallback(res);
                        }
                    }
                })
            }
        }
    });
}

/**
 * 从服务端读取用户信息
 * @param host
 */
function setUserInfoFromServer(host) {
    // 异步获取信息
    setTimeout(function () {
        let getUserInfo = wxPromisify(wx.request);
        if (typeof host.openId !== 'undefined' || host.openId !== '') {
            getUserInfo({
                url: "https://www.newpictown.com/" + "user/byWechatUnionId/" + "admin",
            }).then(function (res) {
                console.log("setUserInfoFromServer: ", res.data);
                host.userInfoFromServer = res.data;
            }).catch(function () {
                console.error("get user information failed")
            });
        }
    }, 2000);
}

/**
 * 微信版的Promise
 * @param fn
 * @returns {Function}
 */
function wxPromisify(fn) {
    return function (obj = {}) {
        return new Promise((resolve, reject) => {
            obj.success = function (res) {
                resolve(res)
            };

            obj.fail = function (res) {
                reject(res)
            };

            fn(obj);
        })
    }
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
    isEqual: isEqual,
    underscore: _,
    loadData: loadData,
    loadPlan: loadPlan,
    saveData: saveData,
    calcEnergyCost: calcEnergyCost,
    setWechatOpenId: setWechatOpenId,
    setWechatUserInfo: setWechatUserInfo,
    setUserInfoFromServer: setUserInfoFromServer,
    checkRegister: checkRegister,
    wxPromisify: wxPromisify

}

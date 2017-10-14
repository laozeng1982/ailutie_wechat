//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util.js'
import Controller from './utils/Controller.js'
import StorageType from './datamodel/StorageType.js'
import Plan from './datamodel/PlanSet.js'
import Body from './datamodel/Body'

const CONTROLLER = new Controller.Controller();
const STORAGETYPE = new StorageType.StorageType();

App({
    onLaunch: function () {

        // 全局变量
        this.planSet = CONTROLLER.loadData(STORAGETYPE.PlanSet);

        this.currentPlan = CONTROLLER.loadPlan();

        console.log("this.planSet: ", this.planSet);
        console.log("app onLoad");

        //默认使用登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        });
        // 获取用户信息
        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            this.globalData.wechatUserInfo = res.userInfo;
                            console.log("app onLoad, res.userInfo: ", res.userInfo);
                            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                            // 所以此处加入 callback 以防止这种情况
                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res);
                            }
                        }
                    })
                }
            }
        });

        // 准备数据：
        var systemSetting = new Body.Body();

        systemSetting.makeDefaultDefaultPartList();

        console.log("SystemSetting: ", systemSetting);

        // if (systemSetting.body.parts.length > 0) {
        //     CONTROLLER.saveData(STORAGETYPE.SystemSetting, systemSetting);
        // }

        // 验证是否是首次登陆，首次登陆，录入用户基本信息
        var userInfo = CONTROLLER.loadData(STORAGETYPE.UserInfo);
        console.log("userInfo: ", userInfo);
        var userHeight = userInfo.height;

        if (typeof (userHeight) === 'undefined' || userHeight === "") {
            // 去注册
            console.log("in app, go to User information record page!");
            wx.redirectTo({
                url: 'pages/settings/userinfo/userinfo?model=newUser',
            });
        }

        if (userInfo.defaultWechatLogin) {
            // 使用微信登录
            console.log("user wechat ID");

        }
        console.log("app onLoad done");
    },

    getWechatUserInfo: function (cb) {
        var that = this;
        if (this.globalData.wechatUserInfo) {
            typeof cb == "function" && cb(this.globalData.wechatUserInfo)
        } else {
            //调用登录接口
            wx.getUserInfo({
                withCredentials: false,
                success: function (res) {
                    that.globalData.wechatUserInfo = res.userInfo;
                    typeof cb == "function" && cb(that.globalData.wechatUserInfo)
                }
            })
        }
    },

    getGid: (function () {//全局唯一id
        let id = 0;
        return function () {
            id++;
            return id;
        }
    })(),

    system: {
        userConfig: {
            measurement: "Kg",
        },
    },

    // 方便别的JS调用
    Controller: CONTROLLER,
    StorageType: STORAGETYPE,
    Util: util,

    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    makingNewPlan: true,
    planStartDate: '',
    planEndDate: '',
    lastPlanSaved: false,

    globalData: {
        // 定义一些全局变量
        userInfo: null,
        wechatUserInfo: null,

        isLogin: false,// 登陆状态记录

        planMakeModel: -1,  // 用户对制定计划的选择，1代表使用推荐计划，2代表使用自定义计划，否则是-1

        selectedDateString: util.formatDateToString(new Date()),
        selectedDate: new Date(),

        // Records页面上选中的movement Id，默认给-1
        selectedMvIdOnRecordPage: -1,

        selectedMoveNameOnRecordPage: -1,
        selectedPartNameOnRecordPage: -1,

        selectedPartNameOnPlanPage: -1,

    },

})

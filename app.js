//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util'
import StorageType from './datamodel/SystemSetting'
import PlanSet from './datamodel/PlanSet'
import Body from './datamodel/Body'

const STORAGETYPE = new StorageType.StorageType();

App({
    onLaunch: function () {

        // 全局变量
        this.planSet = util.loadData(STORAGETYPE.PlanSet);

        this.currentPlan = new PlanSet.Plan();

        console.log("app onLoad, currentPlan", this.currentPlan);

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

        this.getWechatUserInfo();

        // 准备数据：
        // var body = new Body.Body();

        // body.makeDefaultDefaultPartList();

        // console.log("body: ", body);

        // 验证是否是首次登陆，首次登陆，录入用户基本信息
        // this.userInfo = util.loadData(STORAGETYPE.UserInfo);
        // console.log("userInfo: ", this.userInfo);
        // var userHeight = this.userInfo.height;

        // if (typeof (userHeight) === 'undefined' || userHeight === "") {
        //     // 去注册
        //     console.log("in app, go to User information record page!");
        //     wx.redirectTo({
        //         url: 'pages/settings/userinfo/userinfo?model=newUser',
        //     });
        // }

        // if (this.userInfo.defaultWechatLogin) {
        //     // 使用微信登录
        //     console.log("user wechat ID");
        // }
        // console.log("app onLoad done");
    },

    // 提供获取微信信息的结构
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

    // 提供工具类的统一接口，方便其他的JS通过app调用
    StorageType: STORAGETYPE,
    Util: util,

    // 定义一些全局变量，在页面跳转的时候判断，方便其他的JS通过app调用

    makingNewPlan: true,    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    planMakeModel: 3,  // 用户对计划来源的选择，1代表使用推荐计划，2代表使用历史计划，3代表使用自定义计划，默认是三
    planStartDate: '',
    planEndDate: '',
    lastPlanSaved: false,

    globalData: {

        userInfo: null,
        wechatUserInfo: null,

        isLogin: false,// 登陆状态记录

        selectedDateString: util.formatDateToString(new Date()),
        selectedDate: new Date(),
    },

})

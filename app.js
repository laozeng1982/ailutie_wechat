//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util'
import settings from './datamodel/Settings'
import userPlanSet from './datamodel/PlanReality'

const Settings = new settings.Settings();

App({
    onLaunch: function () {
        // 同步服务器模板数据，将来可能会有增加
        util.syncData(this, "predefined");
        // 同步用户微信信息
        util.syncData(this, "wechat");
        // 同步用户数据
        util.syncData(this, "user");

        // console.log(this.Settings);

    },


    // 提供工具类的统一接口，方便其他的JS通过app调用
    // Settings: Settings,

    Util: util,

    // 定义一些全局变量，在页面跳转的时候判断，方便其他的JS通过app调用
    wechatUserInfo: {},
    Settings: util.loadData(Settings.Storage.Settings),    // 全局同步标志
    userInfoLocal: util.loadData(Settings.Storage.UserInfo), // 全局用户信息保存变量
    currentPlan: new userPlanSet.Plan(),    // 全局当前计划
    actionArray: {},

    makingNewPlan: true,    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    lastPlanSaved: false,

    selectedDateString: util.formatDateToString(new Date()),
    selectedDate: new Date(),

    globalData: {},

})

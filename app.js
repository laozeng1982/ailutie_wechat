//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util'
import StorageType from './datamodel/SystemSetting'
import PlanSet from './datamodel/PlanReality'

const STORAGETYPE = new StorageType.StorageType();

App({
    onLaunch: function () {
        // 同步服务器模板数据
        util.syncSysParameter(this);
        // 获取用户微信信息
        util.setWechatUserInfo(this);
        // 获取用户OpenId
        util.setWechatOpenId(this);
        // 查询用户是否注册过
        util.checkRegister(this);
        

        // 全局变量
        this.planSet = util.loadData(STORAGETYPE.PlanSet);

        this.currentPlan = new PlanSet.Plan();

        console.log("app onLoad, currentPlan", this.currentPlan);

        console.log("app onLoad done");
    },

    // 提供工具类的统一接口，方便其他的JS通过app调用
    StorageType: STORAGETYPE,
    Util: util,

    // 定义一些全局变量，在页面跳转的时候判断，方便其他的JS通过app调用
    wechatUserInfo: {},
    openId: '',
    userInfoLocal: {},
    userInfoFromServer: {},

    makingNewPlan: true,    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    planMakeModel: 3,  // 用户对计划来源的选择，1代表使用推荐计划，2代表使用历史计划，3代表使用自定义计划，默认是三
    planStartDate: '',
    planEndDate: '',
    lastPlanSaved: false,

    globalData: {

        userInfo: null,
        selectedDateString: util.formatDateToString(new Date()),
        selectedDate: new Date(),
    },

})

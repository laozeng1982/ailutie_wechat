//app.js
/**
 * 小程序总入口
 */
import util from './utils/Util'
import StorageType from './datamodel/SystemSetting'
import PlanSet from './datamodel/PlanSet'

const STORAGETYPE = new StorageType.StorageType();

App({
    onLaunch: function () {
        // 获取用户OpenId
        util.setWechatOpenId(this);
        // 获取用户微信信息
        util.setWechatUserInfo(this);
        // 根据OpenId获取服务器上用户信息
        util.setUserInfoFromServer(this);
        // 查询用户是否注册过
        util.checkRegister();

        // 全局变量
        this.planSet = util.loadData(STORAGETYPE.PlanSet);

        this.currentPlan = new PlanSet.Plan();

        console.log("app onLoad, currentPlan", this.currentPlan);

        console.log("app onLoad done");
    },

    // 提供工具类的统一接口，方便其他的JS通过app调用
    StorageType: STORAGETYPE,
    Util: util,

    requestUrl: 'https://www.newpictown.com/',

    // 定义一些全局变量，在页面跳转的时候判断，方便其他的JS通过app调用
    wechatUserInfo: {},
    openId: '',
    userInfoFromServer: {},

    makingNewPlan: true,    // 操作计划的模式：如制定新计划为真，否则为假，在首页里两个操作互斥
    planMakeModel: 3,  // 用户对计划来源的选择，1代表使用推荐计划，2代表使用历史计划，3代表使用自定义计划，默认是三
    planStartDate: '',
    planEndDate: '',
    lastPlanSaved: false,

    globalData: {

        userInfo: null,


        isLogin: false,// 登陆状态记录

        selectedDateString: util.formatDateToString(new Date()),
        selectedDate: new Date(),
    },

})

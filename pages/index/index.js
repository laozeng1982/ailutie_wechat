//index.js
import User from '../../datamodel/UserInfo.js'
import chartWrap from '../ui/canvas/chartWrap'
import getConfig from './getConfig'
import PlanSet from '../../datamodel/PlanSet'

const app = getApp();

Page({
    data: {
        currentPlan: '',

        motto: 'Hello',
        wechatUserInfo: {},
        notSignUp: true,

        imgUrls: [
            '../image/friend_64px.png',
            '../image/friends_search.png',
            '../image/fruits_64px.png'
        ],

        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000
    },

    //事件处理函数
    onSwiperChange: function (e) {
        // console.log(e);
        console.log(e.detail.current, e.target.id);
    },

    onModifyPlan: function (e) {
        wx.navigateTo({
            url: '../plan/user_define/preview_plan?model=modify',
        });
    },

    onMakePlan: function () {
        wx.navigateTo({
            url: '../plan/select_goal/select_goal',
        });
    },

    onLoad: function () {
        console.log('index page onLoad');
        var that = this;

        var notSignUp = app.Util.checkSignUp();
        console.log("notSignUp is: ", notSignUp);

        //调用应用实例的方法获取全局数据
        app.getWechatUserInfo(function (wechatUserInfo) {
            //更新数据
            that.setData({
                currentPlan: app.currentPlan,
                wechatUserInfo: wechatUserInfo,
                motto: 'Hello ' + wechatUserInfo.nickName,
                notSignUp: notSignUp
            });
        });
    },

    onShow: function () {
        console.log('index page onShow');
        let pageThis = this;

        app.deviceInfo.then(function (deviceInfo) {
            console.log('设备信息', deviceInfo);
            let labels = ["11-01", "11-02", "11-03", "11-04", "11-05", "11-06", "11-07"];
            let data = [1, 12, 123, 1234, 12345, 123456, 56789];

            let width = Math.floor(deviceInfo.windowWidth - (deviceInfo.windowWidth / 750) * 10 * 2);  //canvas宽度
            let height = Math.floor(width / 1.6);//这个项目canvas的width/height为1.6
            let canvasId = 'myCanvas';
            let canvasConfig = {
                width: width,
                height: height,
                id: canvasId
            };

            let config = getConfig(canvasConfig);
            chartWrap.bind(pageThis)(config);

            // console.log("canvasConfig", canvasConfig);
            // console.log("config", config);
        });

        let planSet = app.Controller.loadData(app.StorageType.PlanSet);
        let currentPlan = '';

        console.log(planSet);

        for (let plan of planSet) {
            if (plan.currentUse) {
                currentPlan = plan;
            }
        }

        app.currentPlan = (currentPlan === '') ? new PlanSet.Plan() : currentPlan;

        this.setData({
            currentPlan: app.currentPlan
        });

        console.log(this.data.currentPlan);
    }

})
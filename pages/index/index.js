//index.js
import User from '../../datamodel/UserInfo.js'
import chartWrap from '../ui/canvas/chartWrap'
import getConfig from './getConfig'

const app = getApp();

Page({
    data: {
        planType: [
            { id: 1, text: "零基础小白", selected: false },
            { id: 2, text: "有一定基础", selected: false },
        ],

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
    bindViewTap: function () {
        wx.switchTab({
            url: '../plan/plan',
        });
    },

    onSwiperChange: function (e) {
        // console.log(e);
        console.log(e.detail.current, e.target.id);
    },

    onTypeSelected: function (e) {
        var planType = this.data.planType;
        switch (e.currentTarget.id) {
            case "1":
                planType[0].selected = true;
                planType[1].selected = false;
                app.globalData.planMakeModel = 1;
                break;
            case "2":
                planType[0].selected = false;
                planType[1].selected = true;
                app.globalData.planMakeModel = 2;
                break;
            default:
                break;
        }
        this.setData({
            planType: planType
        });

        wx.navigateTo({
            url: '../plan/select_goal/select_goal',
        });
    },

    onMakePlan: function () {
        wx.navigateTo({
            url: '../plan/select_plan_type/select_plan_type',
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
                wechatUserInfo: wechatUserInfo,
                motto: 'Hello ' + wechatUserInfo.nickName,
                notSignUp: notSignUp
            });
        });
    },

    onShow: function () {
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
    }

})
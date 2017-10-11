//index.js
import User from '../../datamodel/UserInfo.js'
import PlanSet from '../../datamodel/PlanSet'
import ChartMaker from 'ChartMaker'

const app = getApp();
const chartMaker = new ChartMaker.ChartMaker();

Page({
    data: {
        currentPlan: '',
        currentChart: '',
        chartTitle: '',
        motto: 'Hello',
        wechatUserInfo: {},
        notSignUp: true,

        chartType: [
            {id: 1 + "", text: "本周", checked: true},
            {id: 2 + "", text: "本月", checked: false},
            {id: 3 + "", text: "部位", checked: false},
        ],

        indicatorDots: false,
        autoplay: false,
        duration: 500
    },

    touchHandler: function (e) {
        this.data.currentChart.scrollStart(e);
    },

    moveHandler: function (e) {
        this.data.currentChart.scroll(e);
    },

    touchEndHandler: function (e) {
        // TODO 这里可以做的更复杂，实现点击进入当天详细内容
        console.log("touchEnd:", e.target.id);
        this.data.currentChart.scrollEnd(e);
        // this.data.currentChart.showToolTip(e, {
        //     format: function (item, category) {
        //         return category + ', ' + item.name + ': ' + item.data
        //     }
        // });
    },

    onRadioChange: function (e) {
        let chartType = this.data.chartType;
        let currentChart;
        switch (e.detail.value) {
            case "1":
                for (let idx = 0; idx < chartType.length; idx++) {
                    chartType[idx].checked = (parseInt(e.detail.value) - 1) === idx;
                }
                chartMaker.setDrawType("line");
                currentChart = chartMaker.makeChart();
                this.setData({
                    chartTitle: "本周运动量",
                });
                break;
            case "2":
                for (let idx = 0; idx < chartType.length; idx++) {
                    chartType[idx].checked = (parseInt(e.detail.value) - 1) === idx;
                }
                chartMaker.setDrawType("scroll");
                currentChart = chartMaker.makeChart();
                this.setData({
                    chartTitle: "本月运动量",
                });
                break;
            case "3":
                for (let idx = 0; idx < chartType.length; idx++) {
                    chartType[idx].checked = (parseInt(e.detail.value) - 1) === idx;
                }
                chartMaker.setDrawType("pie");
                currentChart = chartMaker.makeChart();
                this.setData({
                    chartTitle: "本次计划各部位锻炼次数比例",
                });
                break;
            default:
                break;
        }

        this.setData({
            currentChart: currentChart,
            chartType: chartType
        });

    },

    /**
     * 修改现有计划
     * 只有当前有计划是才能有此接口，置app.makingNewPlan为false。
     *
     */
    onModifyPlan: function () {
        app.makingNewPlan = false;
        wx.navigateTo({
            url: '../plan/user_define/preview_plan?model=modify',
        });
    },

    /**
     * 定制新计划
     * 只有当前没有有计划是才能有此接口，置app.makingNewPlan为true。
     *
     */
    onMakePlan: function () {
        app.makingNewPlan = true;
        wx.navigateTo({
            url: '../plan/select_goal/select_goal',
        });
    },

    onLoad: function () {

        console.log('index page onLoad');
        let that = this;

        let notSignUp = app.Util.checkSignUp();
        // console.log("notSignUp is: ", notSignUp);

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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        // 首次进入，渲染第一张，周视图
        let currentChart = chartMaker.makeChart();

        this.setData({
            chartTitle: "本周运动量",
            currentChart: currentChart
        });
        // console.log("in onReady:", this.data.currentChart);
    },

    onShow: function () {
        console.log('index page onShow');

        app.currentPlan = app.Controller.loadPlan();

        this.setData({
            currentPlan: app.currentPlan,

        });

        console.log("app.currentPlan", this.data.currentPlan);
    }

})
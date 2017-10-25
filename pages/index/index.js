//index.js
import ChartMaker from '../ui/canvas/ChartMaker'
import ChartData from '../ui/canvas/ChartData'

const app = getApp();
const chartMaker = new ChartMaker.ChartMaker('indexCanvas');
const chartData = new ChartData.ChartData();

Page({
    data: {
        currentPlan: '',
        currentChart: '',
        chartTitle: '',
        notSignUp: true,

        chartType: [
            {id: 1 + "", text: "本周", checked: true},
            {id: 2 + "", text: "本月", checked: false},
            {id: 3 + "", text: "部位", checked: false},
        ],

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

                currentChart = chartMaker.makeLineChart(chartData.createLineData(true));
                this.setData({
                    chartTitle: "本周运动量",
                });
                break;
            case "2":
                for (let idx = 0; idx < chartType.length; idx++) {
                    chartType[idx].checked = (parseInt(e.detail.value) - 1) === idx;
                }
                currentChart = chartMaker.makeLineChart(chartData.createLineData(false));
                this.setData({
                    chartTitle: "本月运动量",
                });
                break;
            case "3":
                for (let idx = 0; idx < chartType.length; idx++) {
                    chartType[idx].checked = (parseInt(e.detail.value) - 1) === idx;
                }

                currentChart = chartMaker.makePieChart(chartData.createPieData());
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
     */
    onViewPlan: function () {
        app.makingNewPlan = false;
        wx.navigateTo({
            url: '../plan/plan_details/plan_details?mode=modify',
        });
    },

    /**
     * 定制新计划
     * 置app.makingNewPlan为true。
     * 增加可以制定临时计划的功能
     */
    onMakePlan: function (e) {
        // console.log(e.currentTarget);
        app.makingNewPlan = true;
        let url = (e.currentTarget.id === "tempPlan") ?
            "../plan/define_plan/define_plan?mode=tempPlan" : "../plan/define_plan/define_plan?mode=longPlan";

        wx.navigateTo({
            url: url,
        });
    },

    onLoad: function () {
        console.log('index page onLoad');

        app.getWechatUserInfo();

        console.log(app.globalData.wechatUserInfo);

        let notSignUp = app.Util.checkSignUp();

        //更新数据
        this.setData({
            notSignUp: notSignUp
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    onShow: function () {
        // 首次进入，渲染第一张，周视图
        let currentChart = chartMaker.makeLineChart(chartData.createLineData(true));

        this.setData({
            chartTitle: "本周运动量",
            currentChart: currentChart
        });

        console.log('index page onShow');

        // 这里是预览和修改计划的唯一入口，所以需要在这里更新app.currentPlan
        app.currentPlan.cloneDataFrom(app.Util.loadPlan());

        this.setData({
            currentPlan: app.currentPlan,

        });

        console.log("app.currentPlan", this.data.currentPlan);
    }

})
// pages/plan/plan_list/plan_list.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mode: "",   // 计划显示的模式
        planList: [], // 将要显示的计划列表
        tabData: [],
        currentTabIdx: 0,

    },

    makeTabData: function () {
        let tabData;
        if (this.data.mode === "recommend") {
            tabData = [
                {
                    type: "ailutie",
                    name: "爱撸铁推荐",
                    data: [],
                    selected: true
                },
                {
                    type: "coach",
                    name: "明星教练",
                    data: [],
                    selected: false
                },
                {
                    type: "other",
                    name: "网友上传",
                    data: [],
                    selected: false
                }
            ]
        } else {
            tabData = [
                {
                    type: "user",
                    name: "我的历史计划",
                    data: [],
                    selected: true
                }
            ]
        }

        this.setData({
            tabData: tabData
        });
    },

    onSwitchNav: function (e) {
        let currentTabIdx = e.currentTarget.dataset.current;
        this.setData({
            currentTabIdx: currentTabIdx
        });
    },

    onSwiperChange: function (e) {
        let currentTabIdx = e.detail.current;
        this.setData({
            currentTabIdx: currentTabIdx
        });
    },

    onPlanSelected: function (e) {
        console.log(e.currentTarget.dataset.plan);
        app.currentViewPlan = e.currentTarget.dataset.plan;
        wx.navigateTo({
            url: '../plan_details/plan_details?mode=' + this.data.tabData[this.data.currentTabIdx].name,
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options.mode);
        if (options.mode === "recommend") {
            wx.setNavigationBarTitle({
                title: '选择推荐计划',
            });
        } else {
            wx.setNavigationBarTitle({
                title: '选择我的历史计划',
            });
        }

        this.setData({
            mode: options.mode
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.makeTabData();

        let planSet = app.Util.loadData(app.StorageType.PlanSet);

        console.log("planSet:", planSet);

        let tabData = this.data.tabData;

        tabData[0].data = planSet;
        if (this.data.mode === "recommend") {
            tabData[1].data = planSet;
            tabData[2].data = planSet;
        }
        this.setData({
            tabData: tabData
        });

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})
// pages/plan/plan_details/plan_details.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {

    },
    /**
     * 保存计划
     */
    savePlanData: function () {

        app.currentPlan.currentUse = true;

        // if (app.planSet.length === 0) {
        //     app.planSet.push(app.currentPlan);
        // } else {
        //     // 暂时不考虑删除计划，隐藏即可，这里就需要判断是否有激活的计划，有的话直接替换，没有的话，直接添加
        //     var hasUsingPlan = false;
        //     for (let idx = 0; idx < app.planSet.length; idx++) {
        //         if (app.planSet[idx].currentUse) {
        //             hasUsingPlan = true;
        //             app.planSet.splice(idx, 1, app.currentPlan);
        //         }
        //     }
        //     if (!hasUsingPlan) {
        //         app.planSet.push(app.currentPlan);
        //     }
        // }

        // 暂时不考虑删除计划，隐藏即可，然后直接添加
        for (let idx = 0; idx < app.planSet.length; idx++) {
            app.planSet[idx].currentUse = false;
        }

        app.planSet.push(app.currentPlan);

        app.Util.saveData(app.StorageType.PlanSet, app.planSet);

        app.Util.showNormalToast("计划已保存", this, 2000);

        console.log(app.planSet);
    },

    onComments: function () {

    },

    onFavorite: function (e) {

    },

    onUseThisPlan: function () {
        wx.navigateTo({
            url: '../define_plan/define_plan?mode=modify',
        });
    },

    onShowDetails: function (e) {
        // console.log(e.currentTarget.id);
        let idx = parseInt(e.currentTarget.id);
        let plan = this.data.plan;

        plan.circleDaySet[idx].showDetails = !plan.circleDaySet[idx].showDetails;

        this.setData({
            plan: plan
        });
    },

    onDeletePlan: function () {
        wx.showModal({
            title: '提醒',
            content: '确定删除？',
            success: function (res) {
                if (res.confirm) {
                    let planSet = app.Util.loadData(app.StorageType.PlanSet);
                    for (let idx = 0; idx < planSet.length; idx++) {
                        planSet[idx].currentUse = false;
                    }

                    app.Util.saveData(app.StorageType.PlanSet, planSet);

                    wx.switchTab({
                        url: '../../index/index',
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },

    onModifyPlan: function () {
        wx.navigateTo({
            url: '../define_plan/define_plan?mode=modify',
        });
    },

    onGoBack: function () {
        wx.navigateBack({
            delta: 1,
        });
    },

    onSavePlan: function () {
        this.savePlanData();

        wx.switchTab({
            url: '../../index/index',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        wx.setNavigationBarTitle({
            title: "预览计划",
        });

        this.setData({
            options: options
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

        let plan = app.currentPlan;

        app.currentPlan.setPlanParts();

        for (let circleDay of plan.circleDaySet) {
            circleDay.showDetails = false;
            circleDay.partShowing = circleDay.partArray.join("，");
        }

        this.setData({
            plan: plan
        });

        // console.log(this.data.plan);
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
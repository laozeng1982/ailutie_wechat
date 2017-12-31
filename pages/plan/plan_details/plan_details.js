// pages/plan/plan_details/plan_details.js
import Dictionary from '../../../datamodel/Dictionary'

const app = getApp();
const dict = new Dictionary.Dictionary();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        planSetting: [
            {id: "name", description: "计划名字：", value: ''},
            {id: "purpose", description: "健身目标：", value: ''},
            {id: "grade", description: "健身水平：", value: ''},
            {id: "targetUser", description: "目标人群：", value: ''},
            {id: "facility", description: "健身设备：", value: ''},
            {id: "place", description: "健身地点：", value: ''},
            {id: "description", description: "计划描述：", value: ''},
        ]
    },
    /**
     * 保存计划
     */
    savePlanData: function () {

        app.currentPlan.currentUse = true;

        let planSet = app.Util.loadData(app.StorageType.PlanSet);
        if (planSet.length > 0) {
            // 先寻找是否有当天plan，如果有，删除
            for (let idx = 0; idx < planSet.length; idx++) {
                if (planSet[idx].id === app.currentPlan.id) {
                    planSet.splice(idx, 1);
                    break;
                }
            }
        }

        // 暂时不考虑删除计划，隐藏即可，然后直接添加
        let plan2Save = app.Util.deepClone(app.currentPlan);

        app.Util.syncData(null, "plan", plan2Save, planSet);

        app.Util.showNormalToast("计划已保存", this, 2000);

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
        let planSetting = this.data.planSetting;

        app.currentPlan.setPlanParts();

        for (let circleDay of plan.circleDaySet) {
            circleDay.showDetails = false;
            circleDay.partShowing = circleDay.displayPartArray.join("，");
        }

        // 设置中文显示
        for (let setting of planSetting) {
            setting.value = dict.getChFromEn(app.currentPlan[setting.id]);
        }

        this.setData({
            plan: plan,
            planSetting: planSetting
        });

        console.log("in plan_details, app.currentPlan: ", app.currentPlan);
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
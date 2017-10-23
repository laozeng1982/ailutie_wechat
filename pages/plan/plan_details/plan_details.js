// pages/plan/plan_details/plan_details.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // plan: {},
    },


    onComments: function () {

    },

    onFavorite: function (e) {

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
            url: '../define_plan/define_plan',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: "预览计划",
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


        this.setData({
            plan: plan
        });

        console.log(this.data.plan);
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
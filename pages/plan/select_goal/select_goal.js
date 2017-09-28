// pages/plan/plan_goal/plan_goal.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        goalType: [
            { id: 1, text: "减脂", selected: false },
            { id: 2, text: "增肌", selected: false },
            { id: 3, text: "塑形", selected: false },
        ],
        userType: [
            { id: 1, text: "零基础小白", selected: false },
            { id: 2, text: "有一定基础", selected: false },
            { id: 3, text: "锻炼达人", selected: false },
        ],
    },

    onGoalTypeSelected: function (e) {
        console.log(e.currentTarget.id);
        var goalType = this.data.goalType;
        switch (e.currentTarget.id) {
            case "1":
                goalType[0].selected = true;
                goalType[1].selected = false;
                goalType[2].selected = false;
                break;
            case "2":
                goalType[0].selected = false;
                goalType[1].selected = true;
                goalType[2].selected = false;
                break;
            case "3":
                goalType[0].selected = false;
                goalType[1].selected = false;
                goalType[2].selected = true;
                break;
        }
        this.setData({
            goalType: goalType
        });
    },

    onUserTypeSelected: function (e) {
        var userType = this.data.userType;
        switch (e.currentTarget.id) {
            case "1":
                userType[0].selected = true;
                userType[1].selected = false;
                userType[2].selected = false;
                break;
            case "2":
                userType[0].selected = false;
                userType[1].selected = true;
                userType[2].selected = false;
                break;
            case "3":
                userType[0].selected = false;
                userType[1].selected = false;
                userType[2].selected = true;
                break;
        }
        this.setData({
            userType: userType
        });
    },

    onNext: function () {
        var selected = false;
        // for (let item of this.data.goalType) {
        //     selected = selected || item.selected;
        // }

        // if (!selected) {
        //     app.Util.showWarnToast("还未选择类型", this, 2000);
        //     return;
        // }

        // var selected = false;
        // for (let item of this.data.userType) {
        //     selected = selected || item.selected;
        // }

        // if (!selected) {
        //     app.Util.showWarnToast("还未选择类型", this, 2000);
        //     return;
        // }

        if (app.globalData.planMakeModel===1) {
            wx.navigateTo({
                url: '../recommend_planlist/recommend_planlist',
            });
        } else {
            wx.navigateTo({
                url: '../user_define/select_part',
            });
        }


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '定制我的锻炼计划',
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
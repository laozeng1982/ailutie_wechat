// pages/plan/select_plan_type/select_plan_type.js
import util from '../../../utils/util.js'

var app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        planType: [
            { id: 1, text: "零基础小白", selected: false },
            { id: 2, text: "有一定基础", selected: false },
        ],
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
            default :
                break;
        }
        this.setData({
            planType: planType
        });
    },

    onNext: function () {
        var selected = false;
        for (let item of this.data.planType) {
            selected = selected || item.selected;
        }

        if (!selected) {
            util.showWarnToast("还未选择类型", this, 2000);
            return;
        }

        if (app.globalData.planMakeModel === 1) {
            wx.navigateTo({
                url: '../select_goal/select_goal',
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
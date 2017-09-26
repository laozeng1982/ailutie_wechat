// pages/plan/plan_select_user_type/plan_select_user_type.js
import util from '../../../utils/util.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userType: [
            { id: 1, text: "零基础小白", selected: false },
            { id: 2, text: "有一定基础", selected: false },
            { id: 3, text: "锻炼达人", selected: false },
        ],
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
        for (let item of this.data.userType) {
            selected = selected || item.selected;
        }

        if (!selected) {
            util.showWarnToast("还未选择类型", this, 2000);
            return;
        }
        wx.navigateTo({
            url: '../select_plan_type/select_plan_type',
        });
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
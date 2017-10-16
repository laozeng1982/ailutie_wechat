// userprofile.js

import User from '../../../datamodel/User'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        curRecords: '',
        userProfile: '',
        today: ''
    },

    onSelectDate: function (e) {
        console.log(e);
        if (app.Util.dateDirection(e.detail.value) === 1) {
            app.Util.showToast("小哥，不能记录将来的指标哦！", this, 2000);
            return;
        }
        this.setData({
            selectedDate: e.detail.value
        });
    },

    onInput: function (e) {
        console.log('form发生了submit事件，携带数据为：', e);
        this.valueChange(e);
    },

    onSliderChange: function (e) {
        console.log('form发生了submit事件，携带数据为：', e);
        this.valueChange(e);
    },

    valueChange: function (e) {
        var userProfile = this.data.userProfile;
        for (var idx = 0; idx < userProfile.length; idx++) {
            if ((userProfile[idx].type + userProfile[idx].key) === e.target.id) {
                userProfile[idx].value = parseInt(e.detail.value);
            }
        }

        this.setData({
            userProfile: userProfile
        });
    },


    onFormSubmit: function (e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value)
    },

    onFormReset: function () {
        console.log('form发生了reset事件')
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var today = app.Util.formatDateToString(new Date());

        // var curRecords = app.Controller.loadData(app.StorageType.DailyRecords);
        // var userProfile = curRecords.profiles;

        // console.log("in onLoad, ", curRecords);
        // console.log(userProfile);

        // if (typeof (userProfile) === "undefined") {
        //     userProfile = new User.UserProfile().profiles;
        // }

        // console.log(userProfile);
        this.setData({
            today: today,
            // userProfile: userProfile
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
// userprofile.js

import StorageType from '../../../datamodel/StorageType.js'
import Controller from '../../../utils/Controller.js'
import util from '../../../utils/util.js'
import UerProfile from '../../../datamodel/UserProfile.js'

const DATATYPE = new StorageType.StorageType();
const CONTROLLER = new Controller.Controller();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        curRecords: '',
        userProfile: '',
        selectedDate: ''
    },

    onSelectDate: function (e) {
        console.log(e);
        if (util.dateDirection(e.detail.value) === 1) {
            util.showToast("小哥，不能记录将来的指标哦！", this, 2000);
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
        var selectedDate = util.formatDateToString(new Date());

        var curRecords = CONTROLLER.loadData(selectedDate, DATATYPE.DailyRecords);
        var userProfile = curRecords.profiles;

        console.log("in onLoad, ", curRecords);
        console.log(userProfile);

        if (typeof (userProfile) === "undefined") {
            userProfile = new UerProfile.UserProfile().profiles;
        }

        console.log(userProfile);
        this.setData({
            selectedDate: selectedDate,
            userProfile: userProfile
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
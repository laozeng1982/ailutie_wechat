// userinfo.js
import util from '../../../utils/util.js'
import Controller from '../../../utils/Controller.js'
import StorageType from '../../../datamodel/StorageType.js'

const CONTROLLER = new Controller.Controller();
const STORAGETYPE = new StorageType.StorageType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        option: '',
        dataCollector: '',
        genderArray: ["男", "女"],
        userInfo: '',
    },

    onPickerChange: function (e) {
        console.log(e);
        var userInfo = this.data.userInfo;
        switch (e.target.id) {
            case "birthday":
                userInfo.birthday = e.detail.value;
                break;
            case "gender":
                userInfo.gender = this.data.genderArray[parseInt(e.detail.value)];
                break;
            case "height":
                userInfo.height = parseInt(this.data.heightArray[parseInt(e.detail.value)]);
                break;
            case "weight":
                userInfo.weight = parseInt(this.data.weightArray[parseInt(e.detail.value)]);
            default:
                break;
        }

        this.setData({
            userInfo: userInfo
        });
    },

    onOK: function () {
        // 根据入口不同，选择切换不同的Tab
        CONTROLLER.saveData("UserInfo", STORAGETYPE.UserInfo, this.data.userInfo);
        if (this.data.option === "newUser") {
            wx.switchTab({
                url: '../../index/index',
            });
        } else {
            wx.switchTab({
                url: '../../settings/settings',
            });
        }
    },

    /**
     * 生命周期函数--监听页面加载
     * 这是非tabBar页面，每次进入都会调用onLoad
     * 每一次进入的入口，初始化在这里进行
     */
    onLoad: function (options) {
        // 初始化入口参数，以备离开页面的时候正确切换,请选择
        this.data.option = options.model;
        var userInfo = CONTROLLER.loadData("UserInfo", STORAGETYPE.UserInfo);
        // var

        if (userInfo.birthday === "") {
            userInfo.birthday = '1990-08-30';
        }

        if (userInfo.gender === "") {
            userInfo.gender = '男';
        }

        if (userInfo.height === "") {
            userInfo.height = 170;
        } else {
            userInfo.height = parseInt(userInfo.height);
        }

        if (userInfo.weight === "") {
            userInfo.weight = 65;

        } else {
            userInfo.weight = parseInt(userInfo.weight);
        }

        var heightArray = [];
        var weightArray = [];
        for (let idx = 1; idx <= 220; idx++) {
            heightArray.push(idx + " cm");
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightArray.push(idx + " Kg");
        }

        this.setData({
            userInfo: userInfo,
            heightArray: heightArray,
            weightArray: weightArray
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
        console.log("onUnload");
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
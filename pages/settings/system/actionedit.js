// actionedit.js
import BodyPartList from '../../../datamodel/BodyPart.js'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bodyPartList: '',

        // 新建一个动作来存储选择
        newAction: '',
    },

    onPartChange: function (e) {
        console.log(e);
        var newAction = this.data.newAction;
        newAction.actionPart = this.data.bodyPartNameArray[parseInt(e.detail.value) - 1];
        this.setData({
            newAction: newAction
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var newAction = new BodyPartList.Action();

        this.setData({
            newAction: newAction
        })
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
        var bodyPartList = new BodyPartList.BodyPartList();
        bodyPartList.fullCopyFrom(app.globalData.bodyPartList);
        bodyPartList.clearSelection();

        var newAction = this.data.newAction;

        newAction.actionPart = app.globalData.selectedPartNameOnPlanPage;

        var bodyPartNameArray = [];

        for (var item of bodyPartList.partList) {
            bodyPartNameArray.push(item.partName);
        }

        this.setData({
            newAction: newAction,
            bodyPartList: bodyPartList,
            bodyPartNameArray: bodyPartNameArray,

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
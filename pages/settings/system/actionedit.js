// actionedit.js
import BodyPartList from '../../../datamodel/BodyPart.js'
import util from '../../../utils/util.js'
import StorageType from '../../../datamodel/StorageType.js'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bodyPartList: '',

        // 新建一个动作来存储用户的修改
        newAction: '',

        bodyPartNameArray: [],
        equipmentArray: [],
        measurementArray: [],

        contents: [],

    },

    onControllerChange: function (e) {
        console.log("in onControllerChange, id: ", e.currentTarget.id, "value: ", e.detail.value);

        var contents = this.data.contents;

        var index = parseInt(e.currentTarget.id);

        // 先判断事件的类型，如果是change类，那么是checkbox或者picker的值变化
        // 否则是输入类型
        if (e.type === "change") {
            if (e.detail.value[0] === "checkbox") {
                contents[index].userDefine = !contents[index].userDefine;
            } else {
                contents[index].value = contents[index].data[parseInt(e.detail.value)];
            }
        } else {
            contents[index].value = e.detail.value;
        }

        console.log(contents);
        this.setData({
            contents: contents
        });
    },

    onCancel: function (e) {

    },

    onConfirm: function (e) {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var newAction = new BodyPartList.Action();

        this.setData({
            newAction: newAction
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
        var bodyPartList = new BodyPartList.BodyPartList();
        bodyPartList.fullCopyFrom(app.globalData.bodyPartList);
        bodyPartList.clearSelection();

        var bodyPartNameArray = [];

        bodyPartNameArray.push("请选择");

        for (var item of bodyPartList.partList) {
            bodyPartNameArray.push(item.partName);
        }

        var equipmentArray = ["请选择", "杠铃", "哑铃", "龙门架", "操场"];

        var measurementArray = ["请选择", "Kg", "Lbs", "Km", "个"];

        var newAction = this.data.newAction;

        if (app.globalData.selectedPartNameOnPlanPage !== -1)
            newAction.actionPart = app.globalData.selectedPartNameOnPlanPage;
        else
            newAction.actionPart = bodyPartNameArray[0];

        newAction.actionEquipment = equipmentArray[0];
        newAction.actionMeasurement = measurementArray[0];

        var contents = this.data.contents;

        contents = [
            {
                id: 0,
                name: "部位名称：",
                input_style_class: "input-short",
                input_holder: "",
                data: bodyPartNameArray,
                value: newAction.actionPart,
                hasPicker: true,
                userDefine: false
            },
            {
                id: 1,
                name: "动作名称：",
                input_style_class: "",
                input_holder: "",
                data: [],
                value: newAction.actionName,
                hasPicker: false,
                userDefine: true
            },
            {
                id: 2,
                name: "器械设备：",
                input_style_class: "input-short",
                input_holder: "",
                data: equipmentArray,
                value: newAction.actionEquipment,
                hasPicker: true,
                userDefine: false
            },
            {
                id: 3,
                name: "计量单位：",
                input_style_class: "input-short",
                input_holder: "",
                data: measurementArray,
                value: newAction.actionMeasurement,
                hasPicker: true,
                userDefine: false
            },
            {
                id: 4,
                name: "动作描述：",
                input_style_class: "",
                input_holder: "",
                data: [],
                value: newAction.actionDescription,
                hasPicker: false,
                userDefine: true
            },
        ];

        this.setData({
            contents: contents,
            newAction: newAction,
            bodyPartList: bodyPartList,
            bodyPartNameArray: bodyPartNameArray,
            equipmentArray: equipmentArray,
            measurementArray: measurementArray,

        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        var systemSeting = wx.getStorageSync();
        systemSeting.bodyPartList = this.data.bodyPartList;

        var storage = new StorageType.StorageType();

        util.saveData(storage.SystemSetting.value, storage.SystemSetting, systemSeting);


        // 重置一些控件
        this.setData({
            userDefinePartName: false,
            userDefineEquipment: false,
            userDefineMeasurement: false
        });

        console.log("ActionEdit page hide.");
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
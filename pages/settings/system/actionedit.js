// actionedit.js
import BodyPartList from '../../../datamodel/Body.js'
import util from '../../../utils/Util.js'
import Controller from '../../../utils/Controller.js'
import StorageType from '../../../datamodel/StorageType.js'

const app = getApp();
const CONTROLLER = new Controller.Controller();
const storageType = new StorageType.StorageType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bodyPartList: '',

        routeParameter: '',

        // 新建一个动作来存储用户的修改
        newAction: '',

        bodyPartNameArray: [],
        actionNameArray: [],
        equipmentArray: [],
        measurementArray: [],

        modifyActionIdx: '',

        models: [
            {name: 'add', value: '新增', checked: false},
            {name: 'modify', value: '修改', checked: false},
            {name: 'remove', value: '删除', checked: false},
            {name: 'reset', value: '恢复', checked: false},
        ],

        controller: [],

    },

    onModelChange: function (e) {
        console.log(e);
        var model = e.detail.value;
        var models = this.data.models;
        var controller = this.data.controller;
        if (model === "add") {
            models[0].checked = true;
            models[1].checked = false;
            models[2].checked = false;
            models[3].checked = false;

            controller[0].show = true;
            controller[1].show = true;
            controller[2].show = true;
            controller[3].show = true;
            controller[4].show = true;

            // // 如果页面从制定计划页面跳转来，则指定部位名
            // if (app.globalData.selectedPartNameOnPlanPage !== -1)
            //     controller[0].value = app.globalData.selectedPartNameOnPlanPage;

        } else if (model === "modify") {
            models[0].checked = false;
            models[1].checked = true;
            models[2].checked = false;
            models[3].checked = false;

            controller[0].show = true;
            controller[1].show = true;
            controller[2].show = true;
            controller[3].show = true;
            controller[4].show = true;
        } else if (model === "remove") {
            models[0].checked = false;
            models[1].checked = false;
            models[2].checked = true;
            models[3].checked = false;

            controller[0].show = true;
            controller[1].show = true;
            controller[2].show = false;
            controller[3].show = false;
            controller[4].show = false;
        } else if (model === "reset") {
            models[0].checked = false;
            models[1].checked = false;
            models[2].checked = false;
            models[3].checked = true;

            controller[0].show = false;
            controller[1].show = false;
            controller[2].show = false;
            controller[3].show = false;
            controller[4].show = false;
        }

        console.log(controller);

        this.setData({
            models: models,
            controller: controller,

        });
    },

    /**
     * 所有控件的响应
     * @param e
     */
    onControllerChange: function (e) {
        console.log("in onControllerChange, type is: ", e.type, ", id: ", e.currentTarget.id, ", value: ", e.detail.value);

        console.log("value type", typeof (e.detail.value));
        var controller = this.data.controller;

        var index = parseInt(e.currentTarget.id);

        // 先判断事件的类型，如果是change类，那么是checkbox或者picker的值变化
        // 否则是输入类型
        if (e.type === "change") {

            if (index === 0) {
                controller[1].data = this.data.actionNameArray[parseInt(e.detail.value) - 1];
                controller[1].value = this.data.actionNameArray[parseInt(e.detail.value) - 1][0];
            }
            if (index === 1) {
                this.data.modifyActionIdx = parseInt(e.detail.value);
            }

            controller[index].value = controller[index].data[parseInt(e.detail.value)];

        } else {
            // 去掉空格
            String.prototype.trim = function () {
                return this.replace(/(^\s*)|(\s*$)/g, '');
            };

            controller[index].value = e.detail.value.trim();
        }

        console.log(controller);
        this.setData({
            controller: controller
        });
    },

    onCancel: function (e) {
        // this.goPage();
    },

    onConfirm: function (e) {
        // this.goPage();
        this.collectDataAndSave();
    },

    goPage: function () {
        if (this.data.routeParameter.backUrl.indexOf("currentPlan") !== -1) {
            wx.switchTab({
                url: this.data.routeParameter.backUrl
            });
        } else {
            wx.redirectTo({
                url: this.data.routeParameter.backUrl
            })
        }
    },

    /**
     *
     */
    initDataSets: function () {
        var systemSetting = CONTROLLER.loadData(storageType.SystemSetting);
        console.log("in onLoad: ", systemSetting);

        // 根据系统中存储的动作库，准备初始数据
        var bodyPartList = systemSetting.bodyPartList;

        var bodyPartNameArray = [];

        var actionNameArray = [];

        bodyPartNameArray.push("选择或输入");

        for (var item of bodyPartList.partList) {
            bodyPartNameArray.push(item.partName);
            var actionNameList = [];
            for (var action of item.actionList) {

                if (!(action.actionName === "自定义动作"))
                    actionNameList.push(action.actionName);
            }
            actionNameArray.push(actionNameList);
        }

        console.log(actionNameArray);

        var equipmentArray = ["选择或输入", "杠铃", "哑铃", "龙门架", "操场"];

        var measurementArray = ["选择或输入", "Kg", "Lbs", "Km", "个"];

        var controller;

        controller = [
            {
                id: 0,
                name: "部位名称：",
                input_style_class: "input-short",
                input_holder: "",
                data: bodyPartNameArray,
                value: bodyPartNameArray[0],
                hasPicker: true,
                userDefine: true,
                show: true
            },
            {
                id: 1,
                name: "动作名称：",
                input_style_class: "",
                input_holder: "",
                data: actionNameArray[0],
                value: actionNameArray[0][0],
                hasPicker: true,
                userDefine: true,
                show: true
            },
            {
                id: 2,
                name: "器械设备：",
                input_style_class: "input-short",
                input_holder: "",
                data: equipmentArray,
                value: equipmentArray[0],
                hasPicker: true,
                userDefine: true,
                show: true
            },
            {
                id: 3,
                name: "计量单位：",
                input_style_class: "input-short",
                input_holder: "",
                data: measurementArray,
                value: measurementArray[0],
                hasPicker: true,
                userDefine: true,
                show: true
            },
            {
                id: 4,
                name: "动作描述：",
                input_style_class: "",
                input_holder: "",
                data: [],
                value: "",
                hasPicker: false,
                userDefine: true,
                show: true
            },
        ];


        this.setData({
            controller: controller,
            bodyPartList: bodyPartList,
            actionNameArray: actionNameArray,
            bodyPartNameArray: bodyPartNameArray,
            equipmentArray: equipmentArray,
            measurementArray: measurementArray,

        });
    },

    initModels: function (options) {

        var controller = this.data.controller;
        var bodyPartNameArray = this.data.bodyPartNameArray;
        var actionNameArray = this.data.actionNameArray;

        var models = this.data.models;
        if (options.model === "add") {
            models[0].checked = true;
            models[1].checked = false;
            models[2].checked = false;

            // 如果页面从制定计划页面跳转来，则指定部位名
            if (app.globalData.selectedPartNameOnPlanPage !== -1) {
                controller[0].value = app.globalData.selectedPartNameOnPlanPage;

                for (var idx = 1; idx < bodyPartNameArray.length; idx++) {
                    if (bodyPartNameArray[idx] === app.globalData.selectedPartNameOnPlanPage) {
                        controller[1].data = actionNameArray[idx - 1];
                        controller[1].value = actionNameArray[idx - 1][0];
                        break;
                    }
                }
            }


        } else if (options.model === "modify") {
            models[0].checked = false;
            models[1].checked = true;
            models[2].checked = false;
        } else {
            models[0].checked = false;
            models[1].checked = false;
            models[2].checked = true;

            // controller[0].
            controller[1].value = "";
            controller[2].show = false;
            controller[3].show = false;
            controller[4].show = false;
        }

        this.setData({
            models: models,
            controller: controller,
            bodyPartNameArray: bodyPartNameArray

        });
    },

    /**
     *
     */
    collectDataAndSave: function () {
        var sucess = false;
        console.log("in collectDataAndSave", this.data.bodyPartList);
        var bodyPartList = this.data.bodyPartList;
        var controller = this.data.controller;

        // 从界面获取用户的选择或输入
        var partName = controller[0].value;
        var actionName = controller[1].value;
        var actionEquipment = controller[2].value;
        var actionMeasurement = controller[3].value;
        var actionDescription = controller[4].value;

        // 先判断输入
        if (this.data.models[0].checked || this.data.models[1].checked) {
            if (partName === "" || partName.indexOf("选择或输入") !== -1) {
                util.showToast("请输入部位名称！", this, 2000);
                return sucess;
            }

            if (actionName === "") {
                util.showToast("请输入动作名称！", this, 2000);
                return sucess;
            }

            if (actionEquipment === "" || actionEquipment.indexOf("选择或输入") !== -1) {
                util.showToast("请输入设备名称！", this, 2000);
                return sucess;
            }

            if (actionMeasurement === "" || actionMeasurement.indexOf("选择或输入") !== -1) {
                util.showToast("请输入计量单位！", this, 2000);
                return sucess;
            }

            if (actionDescription === "") {
                util.showToast("请输入动作描述！", this, 2000);
                return sucess;
            }
        }

        if (this.data.models[0].checked || this.data.models[1].checked) {
            // 增加
            for (var partIdx = 0; partIdx < bodyPartList.partList.length; partIdx++) {
                if (bodyPartList.partList[partIdx].partName === partName) {
                    // 查重
                    if (!this.data.actionNameArray[partIdx].includes(actionName)) {
                        // 先弹出“用户自定义”这个内置的
                        var userdefine = bodyPartList.partList[partIdx].actionList.pop();
                        // 添加用户建立的动作
                        var newAction = new BodyPartList.Action();
                        newAction.actionPart = partName;
                        newAction.actionPartId = partIdx + 1;
                        newAction.actionName = actionName;
                        newAction.actionEquipment = actionEquipment;
                        newAction.actionMeasurement = actionMeasurement;
                        newAction.actionDescription = actionDescription;

                        if (this.data.models[1].checked)
                            bodyPartList.partList[partIdx].actionList.splice(this.data.modifyActionIdx, 1, newAction);
                        else
                            bodyPartList.partList[partIdx].actionList.push(newAction);
                        bodyPartList.partList[partIdx].actionList.push(userdefine);
                    } else {
                        util.showToast("已经有这个动作了", this, 2000);
                        return sucess;
                    }

                    // 重置序号
                    for (var idx = 0; idx < bodyPartList.partList[partIdx].actionList.length; idx++) {
                        bodyPartList.partList[partIdx].actionList[idx].actionId = idx + 1;
                    }
                    break;
                }
            }
        } else if (this.data.models[1].checked) {
            // 修改
            // for (var partIdx = 0; partIdx < bodyPartList.partList.length; partIdx++) {
            //
            // }

        } else if (this.data.models[2].checked) {
            // 删除
            for (var partIdx = 0; partIdx < bodyPartList.partList.length; partIdx++) {
                if (bodyPartList.partList[partIdx].partName === partName) {

                    for (var actionIdx = 0; actionIdx < bodyPartList.partList[partIdx].actionList.length; actionIdx++) {
                        if (bodyPartList.partList[partIdx].actionList[actionIdx].actionName === actionName &&
                            actionName !== "自定义动作") {
                            bodyPartList.partList[partIdx].actionList.splice(actionIdx, 1);

                            // 重置序号
                            for (var idx = 0; idx < bodyPartList.partList[partIdx].actionList.length; idx++) {
                                bodyPartList.partList[partIdx].actionList[idx].actionId = idx + 1;
                            }
                            break;
                        }

                    }
                    break;
                }
            }

        } else if (this.data.models[3].checked) {
            // 恢复到软件初始状态
            bodyPartList = new BodyPartList.BodyPartList();
        }

        console.log("in onUnload, bodyPartList", bodyPartList);

        var systemSetting = CONTROLLER.loadData(storageType.SystemSetting);

        systemSetting.bodyPartList = bodyPartList;

        this.setData({
            bodyPartList: bodyPartList
        });

        CONTROLLER.saveData(storageType.SystemSetting, systemSetting);

        this.initDataSets();

        sucess = true;

        return sucess;
    },

    /**
     * 生命周期函数--监听页面加载
     * 这是非tabBar页面，每次进入都会调用onLoad
     * 每一次进入的入口，初始化在这里进行
     */
    onLoad: function (options) {

        this.initDataSets();
        this.initModels(options);
        console.log("ActionEdit page onLoad!");
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

        console.log("ActionEdit page onShow!");
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log("ActionEdit page onHide!");
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

        // this.collectDataAndSave();
        console.log("ActionEdit page unLoad!");
    }
    ,

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
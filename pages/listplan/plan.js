/**
 * plan.js
 * 计划页面，响应各种操作
 */

import util from '../../utils/util.js'
import Controller from '../../utils/Controller.js'
import DataType from '../../datamodel/StorageType.js'
import DailyRecords from '../../datamodel/DailyRecords.js'
import Movement from '../../datamodel/Movement.js'
import RecordFactory from '../../datamodel/RecordFactory.js'
import PlanModal from '../ui/modal/PlanModal.js'
import BodyPartList from '../../datamodel/BodyPart.js'

//全局变量
var app = getApp();
const DATATYPE = new DataType.StorageType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 用来保存当前选中的日期，初始进程序，显示当天
        selectedDate: util.formatDateToString(new Date()),

        bodyPartList: '',

        //所有的计划，是个Movement的列表
        allMovementsHolder: '',
        tmpRecords: [],

        // 存放选中日期的计划和记录
        curRecords: '',

        // 初始化，这些数据一是用来显示初始化设置
        pick: false,

        // 指定当前修改的记录ID
        selectedPartId: '',
        selectedMovementId: '',

        Controller: '',


        // 3D 数组，用来存放动作组数，次数和重量
        movementNoMultiArray: app.globalData.movementNoMultiArray,
        // 数量选择索引
        multiMovementNoIndex: [0, 0, 0],

        // 组件控制
        scrollY: true,
        scrollHeight:
            850,
        actionName:
            '',

    },

    //------------------------------------------------------
    //以下是监听函数，及其对应的处理操作

    /**
     * 响应往前一天的操作
     */
    onLastDate: function () {
        this.data.Controller.moveDay(false, this);
    },

    /**
     * 响应往前一天的操作
     */
    onNextDate: function () {
        this.data.Controller.moveDay(true, this);
    },

    /**
     * 响应点击日期按钮，跳转日历页面
     */
    onSelectDate: function () {
        //TODO 增加读取数据功能
        //离开页面前，先保存，在onHide里去统一实现
        console.log("select date");
        app.globalData.selectedDate = util.getDateFromString(this.data.selectedDate, '-');
        wx.switchTab({
            url: '../records/records',
        });
    },

    /**
     * 响应界面调用的函数
     */
    onAddMovement: function () {
        if (util.isExpired(this.data.selectedDate)) {
            console.log("isExpired!!!!!!!!!!");
            return;
        } else {
            // 取得正在编辑的动作，传给Modal
            this.setData({
                actionName: "添加动作",
                showModal: true
            });
        }
    },

    /**
     * 响应处理修改动作的业务
     */
    onModifyMovement: function (e) {
        if (util.isExpired(this.data.selectedDate)) {
            console.log("isExpired!!!!!!!!!!");
            return;
        }

        // 把这个Modify界面重置到该动作的参数
        console.log("in onModifyMovement, e.currentTarget.id: ", e.currentTarget.id);

        // 取得正在编辑的动作，传给Modal
        var tmp = this.data.curRecords.movementList[e.currentTarget.id - 1];

        this.setData({});
    },


    onBodyPartSelected: function (e) {

        this.setData({
            selectedPartId: e.detail.value,
        });
        // console.log("in onBodyPartSelected, selectedPartId: ", this.data.selectedPartId);
        // console.log("in onBodyPartSelected, this.data.actionList: ", this.data.bodyPartList.partList[e.detail.value - 1]);
    },

    onBodyPartTap: function (e) {

        this.setData({
            // bodyPartList: this.data.bodyPartList,
            selectedPartId: e.currentTarget.id,
        });
        // console.log("in onBodyPartTap, selectedPartId: ", this.data.selectedPartId);
        // console.log("in onBodyPartTap, this.data.actionList: ", this.data.bodyPartList.partList[e.detail.value - 1]);

    },

    onMovementSelected: function (e) {
        // 简单反选
        // 先搜索全列表，查找动作有无选中，有的话标记，部位列表自然设为选中状态
        this.onMovementItemClick(e);
        console.log("in onMovementSelected, selected movement ID: ", e.currentTarget.id);
        console.log("in onMovementSelected, before: ", this.data.bodyPartList.partList[this.data.selectedPartId - 1]);
    },

    /**
     * 具体动作这边选了以后，激活选中状态
     * @param e
     */
    onMovementTap: function (e) {
        this.onMovementItemClick(e);
        console.log("in onMovementTap, movement", e.currentTarget.id);
        // console.log(this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList);
    },

    onNumberChange: function (e) {

        console.log("in onNumberChange, picker id: ", e.currentTarget.id);

        console.log('in onNumberChange, picker发送选择改变，携带值为', e.detail.value);

        var selectedRowArr = e.detail.value;
        console.log("picker",);


        var planGpCount = parseInt(this.data.movementNoMultiArray[0][selectedRowArr[0]]);
        var planCount = parseInt(this.data.movementNoMultiArray[1][selectedRowArr[1]]);
        var planWeight = parseInt(this.data.movementNoMultiArray[2][selectedRowArr[2]]);
        var measurement = this.data.movementNoMultiArray[3][selectedRowArr[3]];

        var allHolder = this.data.allMovementsHolder;

        var movement = allHolder[this.data.selectedPartId - 1][this.data.selectedMovementId - 1];
        movement.contents.planGpCount = planGpCount;
        movement.contents.details = [];
        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount + "次, ", +planWeight, measurement);

        for (var idx = 0; idx < planGpCount; idx++) {
            var record = new RecordFactory.DetailRecord(idx + 1,
                planCount,
                planWeight,
                0,
                0);
            record.measurement = measurement;
            movement.contents.details.push(record);

        }
        allHolder[this.data.selectedPartId - 1][this.data.selectedMovementId - 1] = movement;

        // 重新置为选中
        this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList[e.currentTarget.id - 1].actionSelected = true;

        this.setData({
            bodyPartList: this.data.bodyPartList,
            allMovementsHolder: allHolder
        });


        console.log("in onNumberChange, picker: ", this.data.allMovementsHolder[this.data.selectedPartId - 1][this.data.selectedMovementId - 1]);
        console.log("in onNumberChange, picker: ", this.data.allMovementsHolder);

    },

    onMovementItemClick: function (e) {
        // 当有锻炼数据时，一定置为选中，不能取消
        if (this.isTrained(e.currentTarget.id)) {
            this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList[e.currentTarget.id - 1].actionSelected = true;
        } else {
            this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList[e.currentTarget.id - 1].actionSelected =
                !this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList[e.currentTarget.id - 1].actionSelected;
        }


        // 先搜索全列表，查找动作有无选中，有的话标记，部位列表自然设为选中状态
        var hasSelected = false;
        for (var item of this.data.bodyPartList.partList[this.data.selectedPartId - 1].actionList) {
            if (item.actionSelected === true) {
                hasSelected = true;
                break;
            }
        }

        this.data.bodyPartList.partList[this.data.selectedPartId - 1].selected = hasSelected;

        this.setData({
            selectedMovementId: e.currentTarget.id,
            bodyPartList: this.data.bodyPartList
        });
    },

    isTrained(index) {
        var isTrain = false;
        var allHolder = this.data.allMovementsHolder;

        var movement = allHolder[this.data.selectedPartId - 1][index - 1];

        if (parseInt(movement.contents.curFinishedGpCount) > 0 || parseInt(movement.contents.mvFeeling) > 0) {
            isTrain = true;
        } else {
            for (var detail of movement.contents.details) {

                if (parseInt(detail.actualCount) > 0 || parseInt(detail.actualWeight) > 0 ||
                    detail.finished || parseInt(detail.groupFeeling) > 0) {
                    console.log(parseInt(detail.actualCount), parseInt(detail.actualWeight),
                        detail.finished, parseInt(detail.groupFeeling));
                    isTrain = true;
                    break;
                }
            }
        }
        console.log("in isTrained, ", isTrain);
        return isTrain;
    },

    /**
     * 选择或者修改完成，整理allMovementsList中的选中项
     * @param e
     */
    collectDataToSave() {
        if (util.isExpired(this.data.selectedDate)) {
            util.showToast('历史数据不能修改哦^_^', this, 2000);
            return;
        }
        this.data.curRecords.movementList = [];
        this.data.curRecords.date = util.formatDateToString(app.globalData.selectedDate);
        console.log("in collectDataToSave, ", this.data.curRecords.date);
        console.log("in collectDataToSave, ", this.data.bodyPartList.partList.length);
        var mvIndex = 1;
        for (var partIdx = 0; partIdx < this.data.bodyPartList.partList.length; partIdx++)
            for (var mvIdx = 0; mvIdx < this.data.bodyPartList.partList[partIdx].actionList.length; mvIdx++) {
                if (this.data.bodyPartList.partList[partIdx].selected && this.data.bodyPartList.partList[partIdx].actionList[mvIdx].actionSelected) {
                    console.log("part", partIdx + 1, this.data.bodyPartList.partList[partIdx].selected,
                        "movement", mvIdx + 1, this.data.bodyPartList.partList[partIdx].actionList[mvIdx].actionPart, ", ",
                        this.data.bodyPartList.partList[partIdx].actionList[mvIdx].actionName, ", ",
                        this.data.bodyPartList.partList[partIdx].actionList[mvIdx].actionSelected);
                    // console.log(this.data.allMovementsHolder[partIdx][mvIdx]);

                    var movement = this.data.allMovementsHolder[partIdx][mvIdx];
                    movement.mvId = mvIndex;
                    mvIndex++;
                    this.data.curRecords.movementList.push(this.data.allMovementsHolder[partIdx][mvIdx]);
                }
            }
    },

    /**
     * 若选择的天里完全没有记录，则直接刷新所有选择状态，如果有记录，把记录同步到allMovementsList中，以及重置部位和选中的状态
     */
    initRecords: function () {
        var result = this.refreshAllData();

        console.log("in initRecords, this.data.curRecords, ", this.data.curRecords);

        var bodyPartList = result[0];
        var allHolder = result[1];
        // console.log("in initRecords, this.data.bodyPartList, ", this.data.bodyPartList);
        // console.log("in initRecords, this.data.allMovementsHolder, ", this.data.allMovementsHolder);

        var alreadySetSelectID = false;
        var selectedPartId;
        if (this.data.curRecords.movementList.length === 0) {
            // 如果没有数据，直接选第一个得了。
            selectedPartId = 1;
        } else {
            for (var item of this.data.curRecords.movementList) {
                for (var partIdx = 0; partIdx < allHolder.length; partIdx++) {
                    if (item.mvInfo.partName === bodyPartList.partList[partIdx].partName) {
                        // 用以保证每次进入计划界面的时候能选中一个部位
                        if (!alreadySetSelectID) {
                            selectedPartId = partIdx + 1;
                            alreadySetSelectID = true;
                        }
                        bodyPartList.partList[partIdx].selected = true;
                    }
                    for (var mvId = 0; mvId < allHolder[partIdx].length; mvId++) {
                        if (item.mvInfo.mvName === allHolder[partIdx][mvId].mvInfo.mvName) {
                            console.log("in initRecords, ", allHolder[partIdx][mvId].mvInfo.mvName);
                            bodyPartList.partList[partIdx].actionList[mvId].actionSelected = true;
                            allHolder[partIdx][mvId] = item;
                        }
                    }
                }
            }
        }

        this.setData({
            selectedPartId: selectedPartId,
            bodyPartList: bodyPartList,
            allMovementsHolder: allHolder
        });

    },


    /**
     * refreshAll Data
     * 为了避免两次刷新数据，refresh改回返回数据，到其他函数里去刷新，免得画面抖动
     */
    refreshAllData: function () {
        //初始化
        var bodyPartList = new BodyPartList.BodyPartList();
        bodyPartList.fullCopyFrom(app.globalData.bodyPartList);
        bodyPartList.clearSelection();

        var allHolder = [];
        for (var list of bodyPartList.partList) {
            var tmpHolder = [];
            for (var item of list.actionList) {
                var movement = new Movement.Movement();
                movement.mvInfo.partName = item.actionPart;
                movement.mvInfo.mvName = item.actionName;
                movement.mvInfo.mvPictureSrc = item.actionPictureSrc;
                movement.contents.planGpCount = 6;
                for (var idx = 0; idx < movement.contents.planGpCount; idx++) {
                    var record = new RecordFactory.DetailRecord(idx + 1,
                        10,
                        30,
                        0,
                        0);
                    record.measurement = "Kg";
                    movement.contents.details.push(record);
                }
                tmpHolder.push(movement);
            }
            allHolder.push(tmpHolder);
        }
        console.log("in refreshAllData, bodyPartList", bodyPartList);
        console.log("in refreshAllData, allHolder", allHolder);

        return [bodyPartList, allHolder];
    },

//-------------------------------------------------------------------------------
//生命周期函数，页面跳转等等

    /**
     * 生命周期函数--监听页面加载
     * 只有页面第一次进入时调用，这里初始化一些基本信息，其他动态的重新赋值操作，放到onShow中去
     */
    onLoad: function (options) {

        var result = this.refreshAllData();

        this.setData({
            bodyPartList: result[0],
            allMovementsHolder: result[1],
            Controller: new Controller.Controller(),

        });

        console.log("plan page onLoad call");
        console.log("plan page onLoad , this.data.allMovementsHolder", this.data.allMovementsHolder);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        console.log("plan page onReady call");
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log("plan page onShow call");
        this.setData({
            selectedDate: util.formatDateToString(app.globalData.selectedDate),
        });

        var curRecords = this.data.Controller.loadData(this.data.selectedDate, DATATYPE.DailyRecords);
        console.log("plan page onShow call", curRecords);

        this.setData({
            curRecords: curRecords
        });

        this.initRecords();

        console.log("in onShow, this.data.curRecords: ", this.data.curRecords);

        if (util.isExpired(this.data.selectedDate)) {
            util.showToast('历史数据不能修改哦^_^', this, 2000);
        }
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.collectDataToSave();
        this.data.Controller.saveData(this.data.selectedDate, DATATYPE.DailyRecords, this.data.curRecords);

        // this.data.Controller.saveData(util.formatDateToString(app.globalData.selectedDate), DATATYPE.DailyRecords, this.data.curRecords);
        console.log("plan page onHide call: data saved");
    }
    ,

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("plan page onUnload call");
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        console.log("plan page onPullDownRefresh call");
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        console.log("plan page onReachBottom call");
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})

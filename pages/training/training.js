/**
 * 锻炼计划记录页面
 */
import util from '../../utils/util.js'
import controller from '../../utils/Controller.js'
import DataType from '../../datamodel/StorageType.js'
import DailyRecords from '../../datamodel/DailyRecords.js'
import Movement from '../../datamodel/Movement.js'
import RecordFactory from '../../datamodel/RecordFactory.js'
import Controller from '../../utils/Controller.js'
import PlanModal from '../ui/modal/PlanModal.js'
import MvScoreModal from '../ui/modal/MvScoreModal.js'

// import planPage from '../listplan/plan.js'

//获取应用实例
var app = getApp();
const DATATYPE = new DataType.StorageType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedDate: '',
        curRecords: [],
        curMovementName: '',
        // 当前选中的动作，初始选中第一个
        curSelectedMovementId: 1,
        // 当前锻炼的组数，初始为第一个
        curSelectedRecordId: 0,

        // 输入框里的次数和重量
        actualCount: '',
        actualWeight: '',
        actualGpFeeling: '',
        actualMvFeeling: 5, // 默认给5分，免得用户忘了选

        // 1D数组用来存放一个动作的评分
        movementScoreArray: '',
        // mvFeelingIndex: 6,

        countSelector: [],
        weightSelector: [],

        // 3D 数组，用来存放动作次数、重量和评分
        groupScoreMultiArray: '',
        // 数量选择索引
        groupScoreIndex: [7, 4, 6],

        Controller: '',
        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        showDetails: false,

        scorllinTo:'',

        disableRemoveBtn: true,
        disableModifyBtn: true,
    },

    onLastMovement: function (e) {
        this.onMoveMovement(e, true);
    },

    onNextMovement: function (e) {
        this.onMoveMovement(e, false);
    },

    onShowDetails: function (e) {
        this.setData({
            showDetails: !this.data.showDetails
        });
        console.log(this.data.showDetails);
    },

    /**
     * 功能：每组动作修改
     * 参数：e，点击事件
     */
    onMoveMovement: function (e, isLast) {

        var curSelectedMovementId = this.data.curSelectedMovementId;
        var maxId = this.data.curRecords.movementList.length;
        if (isLast) {
            curSelectedMovementId = curSelectedMovementId === 1 ? 1 : this.data.curSelectedMovementId - 1;
        } else {
            curSelectedMovementId = curSelectedMovementId === maxId ? maxId : this.data.curSelectedMovementId + 1;
        }

        console.log("in onGroupModify, curSelectedMovementId ", curSelectedMovementId);

        this.setData({
            curSelectedMovementId: curSelectedMovementId,
            // 换动作就重置状态
            curSelectedRecordId: 0,
            disableModifyBtn: true,
            disableRemoveBtn: true
        });
    },

    onCountTap: function (e) {
        this.setData({
            actualCount: e.currentTarget.id
        });
        console.log("in onCountTap, e.detail.scrollTop", e.currentTarget.id);
    },

    onWeightTap: function (e) {
        this.setData({
            actualWeight: e.currentTarget.id
        });
        console.log("in onWeightTap, e.detail.scrollTop", e.currentTarget.id);
    },

    /**
     * 最重要的，记录函数
     * @param e
     */
    onRecordBtnTap: function (e) {

        // 先判断输入是否为空
        if (!this.checkInput()) {
            return;
        }

        var curRecords = this.data.curRecords;
        var curMovmentIdx = this.data.curSelectedMovementId - 1;
        var measurement = curRecords.movementList[curMovmentIdx].contents.details[0].measurement;
        console.log(parseInt(curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount));
        console.log(parseInt(curRecords.movementList[curMovmentIdx].contents.planGpCount));
        if (parseInt(curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount)
            < parseInt(curRecords.movementList[curMovmentIdx].contents.planGpCount)) {

            for (var index = 0; index < curRecords.movementList[curMovmentIdx].contents.details.length; index++) {
                if (parseInt(curRecords.movementList[curMovmentIdx].contents.details[index].actualCount) <= 0) {
                    // 为真时，表示没有记录
                    curRecords.movementList[curMovmentIdx].contents.details[index].actualCount = this.data.actualCount;
                    curRecords.movementList[curMovmentIdx].contents.details[index].actualWeight = this.data.actualWeight;
                    curRecords.movementList[curMovmentIdx].contents.details[index].groupFeeling = this.data.actualGpFeeling;
                    curRecords.movementList[curMovmentIdx].contents.details[index].finished = true;

                    curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount++;
                    curRecords.movementList[curMovmentIdx].contents.actualGpCount = curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount;
                    curRecords.movementList[curMovmentIdx].contents.mvFeeling = this.data.actualMvFeeling;

                    break;
                }
            }
        } else {
            util.showToast("帅哥，本动作计划已经完成了哦！", this, 1000);
            curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount++;
            var record = new RecordFactory.DetailRecord(
                curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount,
                0,
                0,
                this.data.actualCount,
                this.data.actualWeight,
                measurement);
            record.groupFeeling = this.data.actualGpFeeling;
            record.finished = true;
            curRecords.movementList[curMovmentIdx].contents.details.push(record);

            curRecords.movementList[curMovmentIdx].contents.actualGpCount = curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount;
            curRecords.movementList[curMovmentIdx].contents.mvFeeling = this.data.actualMvFeeling;

        }


        this.setData({
            curRecords: curRecords
        });
    },

    /**
     * 当选中已完成的某一个记录时，
     * @param e
     */
    onModifyBtnTap: function (e) {
        // 先判断输入是否为空
        if (!this.checkInput()) {
            return;
        }

        var curRecords = this.data.curRecords;

        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details[this.data.curSelectedRecordId - 1].actualCount = this.data.actualCount;
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details[this.data.curSelectedRecordId - 1].actualWeight = this.data.actualWeight;
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details[this.data.curSelectedRecordId - 1].groupFeeling = this.data.actualGpFeeling;

        this.setData({
            disableRemoveBtn: true,
            disableModifyBtn: true,
            curRecords: curRecords
        });

    },

    /**
     * 响应删除操作
     * 判断是否删除的是计划内的内容，如果是，先弹窗询问，然后根据情况是否调用删除函数
     * @param e
     */
    onRemoveBtnTap: function (e) {

        var details = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details;

        // 如果是计划内的
        var planCount = parseInt(details[this.data.curSelectedRecordId - 1].planCount);
        var planWeight = parseInt(details[this.data.curSelectedRecordId - 1].planWeight);

        console.log(planWeight, planCount);
        var host = this;
        if (planCount > 0 || planWeight > 0) {
            wx.showModal({
                title: '提示',
                content: '这是计划内的，建议修改哦，确定删除？',
                success: function (res) {
                    if (res.confirm) {
                        console.log('用户点击确定');
                        host.removeItem(true);
                    } else if (res.cancel) {
                        console.log('用户点击取消')
                    }
                }
            });
        } else {
            this.removeItem(false);
        }
    },

    /**
     * 实现具体删除功能，重置一系列数据
     * @param removePlanItem，是否删除计划内的内容
     */
    removeItem: function (removePlanItem) {
        var curRecords = this.data.curRecords;

        // 先删除，修改对应的数据
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.curFinishedGpCount--;
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.actualGpCount--;

        // 如果删除的是计划内的，planGpCount也的减去
        if (removePlanItem) {
            curRecords.movementList[this.data.curSelectedMovementId - 1].contents.planGpCount--;
        }

        var details = curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details;

        details.splice(this.data.curSelectedRecordId - 1, 1);

        // 重置序号，然后拷贝回来
        for (var idx = 0; idx < details.length; idx++) {
            details[idx].id = idx + 1;
        }

        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.details = details;

        this.setData({
            disableRemoveBtn: true,
            disableModifyBtn: true,
            curRecords: curRecords
        });
    },

    checkInput: function () {
        // 先判断输入是否为空
        if (parseInt(this.data.actualCount) <= 0 || isNaN(parseInt(this.data.actualCount))) {
            util.showToast("次数不能为空！", this, 1000);
            return false;
        } else if (parseInt(this.data.actualWeight) <= 0 || isNaN(parseInt(this.data.actualWeight))) {
            util.showToast("数量不能为空！", this, 1000);
            return false;
        } else if (parseInt(this.data.actualGpFeeling) <= 0 || isNaN(parseInt(this.data.actualGpFeeling))) {
            util.showToast("分数不能为空！", this, 1000);
            return false;
        }

        return true;
    },

    onCountInput: function (e) {
        this.setData({
            actualCount: e.detail.value
        });

    },

    onWeightInput: function (e) {
        this.setData({
            actualWeight: e.detail.value
        });

    },

    onScoreInput: function (e) {
        var groupFeeling = e.detail.value;
        if (parseInt(groupFeeling) > 10)
            groupFeeling = 10;
        else if (parseInt(groupFeeling) <= 0)
            groupFeeling = 1;
        this.setData({
            actualGpFeeling: groupFeeling
        });

    },

    onGroupScore: function (e) {
        console.log('in numberChange, picker发送选择改变，携带值为', e.detail.value);
        console.log(e);

        // 选中数据的索引
        var selectedRowArr = e.detail.value;
        var actualCount = this.data.groupScoreMultiArray[0][selectedRowArr[0]];
        var actualWeight = this.data.groupScoreMultiArray[1][selectedRowArr[1]];
        var groupFeeling = this.data.groupScoreMultiArray[2][selectedRowArr[2]];

        this.setData({
            actualCount: actualCount,
            actualWeight: actualWeight,
            actualGpFeeling: groupFeeling
        });

    },

    onMovementScore: function (e) {

        console.log("in onMovementScore,e", e);
        var curRecords = this.data.curRecords;
        var mvFeeling = parseInt(e.detail.value) + 1;
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.mvFeeling = mvFeeling;
        this.setData({
            curRecords: curRecords,
            actualMvFeeling: mvFeeling
        });

    },

    onSelectFinishedDetails: function (e) {
        console.log("in onMovementScore, e", e.currentTarget.id, ",  type: ", typeof(e.currentTarget.id));
        this.setData({
            disableRemoveBtn: false,
            disableModifyBtn: false,
            curSelectedRecordId: e.currentTarget.id + "",
            scorllinTo: e.currentTarget.id + ""
        });
        console.log("in onMovementScore, e", this.data.curSelectedRecordId, ",  type: ", typeof(this.data.curSelectedRecordId));
    },


    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化

        var countSelector = [];
        var weightSelector = [];
        var groupScoreSelector = [];
        var mvScoreSelector = [];
        for (var idx = 1; idx <= 150; idx++) {
            countSelector.push(idx);
        }

        for (var idx = 1; idx <= 200; idx++) {
            weightSelector.push(idx);
        }

        for (var idx = 1; idx <= 10; idx++) {
            groupScoreSelector.push(idx);
            mvScoreSelector.push(idx);
        }

        var groupScoreMultiArray = [countSelector, weightSelector, groupScoreSelector];


        this.data.Controller = new Controller.Controller();

        this.setData({
            selectedDate: util.formatDateToString(new Date()),
            countSelector: countSelector,
            weightSelector: weightSelector,
            groupScoreMultiArray: groupScoreMultiArray,
            movementScoreArray: mvScoreSelector,
            Controller: this.data.Controller,

        });

        console.log("Training page onLoad call, this.data.selectedDate: ", this.data.selectedDate);

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
        // this.loadData();
        // 先读取，如果不存在，则新建一个
        this.data.curRecords = this.data.Controller.loadData(this.data.selectedDate, DATATYPE.DailyRecords);

        var index = 0;
        for (var movement of this.data.curRecords.movementList) {
            var finished = 0;
            for (var item of movement.contents.details) {
                // console.log("item, ", item);
                if (item.groupFeeling > 0) {
                    finished++;
                }
            }
            this.data.curRecords.movementList[index].contents.curFinishedGpCount = finished;
            index++;
        }


        this.setData({
            curRecords: this.data.curRecords
        });


        console.log("Training page onShow call, this.data.curRecords: ", this.data.curRecords);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.data.Controller.saveData(util.formatDateToString(new Date()),
            DATATYPE.DailyRecords,
            this.data.curRecords);
        console.log("Training page onHide call: data saved");
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
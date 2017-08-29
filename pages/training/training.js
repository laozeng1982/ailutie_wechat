/**
 * 锻炼计划记录页面
 */
import util from '../../utils/util.js'
import DataType from '../../datamodel/StorageType.js'
import RecordFactory from '../../datamodel/RecordFactory.js'
import Controller from '../../utils/Controller.js'

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

        // 控件关联值，输入框里的次数和重量
        actualCount: '',
        actualWeight: '',
        actualGpFeeling: '',
        actualMvFeeling: 3, // 默认给5分，免得用户忘了选

        totalScoreStarArray: [
            {id: 1, src: "../image/start_checked.png", checked: true},
            {id: 2, src: "../image/start_unchecked.png", checked: false},
            {id: 3, src: "../image/start_unchecked.png", checked: false},
            {id: 4, src: "../image/start_unchecked.png", checked: false},
            {id: 5, src: "../image/start_unchecked.png", checked: false},
        ],

        countSelector: [],
        weightSelector: [],

        // 3D 数组，用来存放动作次数、重量和评分
        groupScoreMultiArray: '',
        // 数量选择索引
        groupScoreIndex: [7, 4, 3],

        Controller: '',
        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        showDetails: false,

        disableRemoveBtn: true,
        disableModifyBtn: true,
    },

    onShowDetails: function (e) {
        this.setData({
            showDetails: !this.data.showDetails
        });
        console.log(this.data.showDetails);
    },

    /**
     * 功能：响应计划点击事件
     * 参数：e，点击事件
     */
    onMovementSelected: function (e) {
        this.selectMovement(e);
    },

    selectMovement: function (e) {

        console.log("in selectMovement, selected id: ", e.currentTarget.id);

        var curSelectedMovementId = parseInt(e.currentTarget.id);

        // 重置打分的星
        // 清零，否则不能由大分数改为小分数
        var curRecords = this.data.curRecords;

        var index = parseInt(curRecords.movementList[curSelectedMovementId - 1].contents.mvFeeling);
        console.log("stars: ", index);
        var totalStars = this.data.totalScoreStarArray;

        for (var idx = 0; idx < 5; idx++) {
            totalStars[idx].src = "../image/start_unchecked.png";
            totalStars[idx].checked = false;
        }

        // 点选
        for (var idx = 0; idx < index; idx++) {
            totalStars[idx].src = "../image/start_checked.png";
            totalStars[idx].checked = true;
        }

        this.setData({
            curSelectedMovementId: curSelectedMovementId,
            // 换动作就重置状态
            curSelectedRecordId: 0,
            disableModifyBtn: true,
            disableRemoveBtn: true,
            totalScoreStarArray: totalStars
        });

        this.setPickerIndex();

        // 给全局变量设值，方便切换到计划的时候，直接高亮当前计划，方便修改
        app.globalData.selectedPartNameOnRecordPage = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1].mvInfo.partName;
        app.globalData.selectedMoveNameOnRecordPage = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1].mvInfo.mvName;
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
                    curRecords.movementList[curMovmentIdx].contents.mvFeeling = this.getMvFeeling();

                    break;
                }
            }
            if (parseInt(curRecords.movementList[curMovmentIdx].contents.curFinishedGpCount)
                === parseInt(curRecords.movementList[curMovmentIdx].contents.planGpCount)) {
                curRecords.movementList[curMovmentIdx].contents.finished = true;
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
            curRecords.movementList[curMovmentIdx].contents.finished = true;
            curRecords.movementList[curMovmentIdx].contents.mvFeeling = this.getMvFeeling();

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
            curSelectedRecordId: -1,
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
            curSelectedRecordId: -1,
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


    onSelectFinishedDetails: function (e) {
        console.log("in onMovementScore, e", e.currentTarget.id, ",  type: ", typeof(e.currentTarget.id));
        this.setData({
            disableRemoveBtn: false,
            disableModifyBtn: false,
            curSelectedRecordId: e.currentTarget.id + "",
        });
        console.log("in onMovementScore, e", this.data.curSelectedRecordId, ",  type: ", typeof(this.data.curSelectedRecordId));
    },

    /**
     * 响应用户点击动作评分
     * @param e，点击事件，携带id，即为分数
     */
    onMovementScore: function (e) {
        console.log(e.currentTarget.id);
        // 实际分数
        var index = parseInt(e.currentTarget.id);
        var totalStars = this.data.totalScoreStarArray;

        // 清零，否则不能由大分数改为小分数
        for (var idx = 0; idx < 5; idx++) {
            totalStars[idx].src = "../image/start_unchecked.png";
            totalStars[idx].checked = false;
        }

        this.setData({
            totalScoreStarArray: totalStars
        });

        // 点选
        for (var idx = 0; idx < index; idx++) {
            totalStars[idx].src = "../image/start_checked.png";
            totalStars[idx].checked = true;
        }

        console.log("in onMovementScore,e", e);
        var curRecords = this.data.curRecords;
        curRecords.movementList[this.data.curSelectedMovementId - 1].contents.mvFeeling = index;

        this.setData({
            curRecords: curRecords,
            actualMvFeeling: index,
            totalScoreStarArray: totalStars
        });
    },

    /**
     * 将动作评分的初始值设为计划的值，方便用户选取
     */
    setPickerIndex: function () {
        if (this.data.curRecords.movementList.length === 0) {
            console.log("in setPickerIndex, today has no plan");
            return;
        }

        var selectedMovement = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1];
        // 获取当前计划的计划数据
        var planCount = selectedMovement.contents.details[0].planCount;
        var planWeight = selectedMovement.contents.details[0].planWeight;

        var groupScoreIndex = [
            this.getArrayIndex(planCount, this.data.groupScoreMultiArray[0]),
            this.getArrayIndex(planWeight, this.data.groupScoreMultiArray[1]),
            2
        ];
        // console.log("in setPickerIndex, ", planCount, planWeight);
        // 重置索引
        this.setData({
            actualCount: planCount,
            actualWeight: planWeight,
            actualGpFeeling: 3,
            groupScoreIndex: groupScoreIndex
        })
    },

    /**
     *
     * @param element
     * @param array，单调递增的数组
     * @returns {number}
     */
    getArrayIndex: function (element, array) {
        var indexOfElement = -1;
        if (element <= array[0]) {
            indexOfElement = 0;
        } else if (element >= array[array.length - 1]) {
            indexOfElement = array.length - 1;
        } else {
            for (var idx = 1; idx < array.length - 1; idx++) {
                if (element >= array[idx] && element <= array[idx + 1])
                    indexOfElement = idx;
            }
        }

        return indexOfElement;
    },

    /**
     * 根据选择的星数，获取动作感觉评分
     * @returns {number}
     */
    getMvFeeling: function () {
        var feeling = 0;
        for (var item of this.data.totalScoreStarArray) {
            if (item.checked)
                feeling++;
        }
        return feeling;
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化

        var countSelector = [];
        var weightSelector = [];
        var groupScoreSelector = [];
        for (var idx = 1; idx <= 150; idx++) {
            countSelector.push(idx);
        }

        for (var idx = 1; idx <= 200; idx++) {
            weightSelector.push(idx);
        }

        for (var idx = 1; idx <= 5; idx++) {
            groupScoreSelector.push(idx);

        }

        var groupScoreMultiArray = [countSelector, weightSelector, groupScoreSelector];


        this.data.Controller = new Controller.Controller();

        this.setData({
            selectedDate: util.formatDateToString(new Date()),
            countSelector: countSelector,
            weightSelector: weightSelector,
            groupScoreMultiArray: groupScoreMultiArray,
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
     * 页面Load以后，动态加载和初始化信息
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
            curRecords: this.data.curRecords,
            curSelectedMovementId: app.globalData.selectedMvIdOnRecordPage !== -1
                ? app.globalData.selectedMvIdOnRecordPage : this.data.curSelectedMovementId
        });

        this.setPickerIndex();

        // 重置全局变量，保证翻回Training页面时，能记住上次的位置
        app.globalData.selectedMvIdOnRecordPage = -1;
        console.log("Training page onShow call, this.data.curRecords: ", this.data.curRecords);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.data.Controller.saveData(util.formatDateToString(new Date()),
            DATATYPE.DailyRecords,
            this.data.curRecords);
        // 如果直接由此界面通过Tab跳到了计划界面，那么将选中的动作置为当前动作，方便修改。
        app.globalData.selectedDate = new Date();
        if (this.data.curRecords.movementList.length > 0) {
            app.globalData.selectedPartNameOnRecordPage = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1].mvInfo.partName;
            app.globalData.selectedMoveNameOnRecordPage = this.data.curRecords.movementList[this.data.curSelectedMovementId - 1].mvInfo.mvName;
        }

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
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
        curMovementIndex: 0, //当前选中的动作，初始选中第一个
        curSelectedMovementId: '',

        Controller: '',
        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        actionName: '',
        // 弹出Modal
        PLANMODAL: '',
        MVSCOREMODAL: '',
        showModal: false,
        showMvScoreModal: false
    },


    /**
     * 当今日计划中，一个动作被选上的时候，列出这组所有的动作细节
     */
    onGroupSelected: function (e) {
        console.log("in onGroupSelected, id: ", e.detail.value);

        // this.data.curRecords[e.detail.value -1].selected = true;

        var curMovementName;
        var curMovementIndex;

        for (var item of this.data.curRecords.movementList) {
            if (String(item.mvId) == String(e.detail.value)) {

                curMovementName = item.mvInfo.mvName;
                curMovementIndex = item.mvId - 1;
                console.log("in onGroupSelected, id: ", curMovementIndex, curMovementName);
                break;
            }
        }

        this.setData({
            curMovementName: curMovementName,
            curMovementIndex: curMovementIndex,
            curSelectedMovementId: e.detail.value
        });
        console.log("in onGroupSelected, this.data.curMovementIndex: ", this.data.curMovementIndex);
    },

    /**
     * 功能：每组动作修改
     * 参数：e，点击事件
     */
    onGroupModify: function (e) {
        var id = e.currentTarget.id;
        console.log("in onGroupModify, e ", e);

        var tmp = this.data.curRecords.movementList[e.currentTarget.id - 1];
        var curSelectedMovementId = e.currentTarget.id;
        console.log("in onGroupModify, tmp ", tmp);
        this.data.PLANMODAL.setBuffMovement(tmp, this);

        this.setData({
            PLANMODAL: this.data.PLANMODAL,
            curSelectedMovementId: curSelectedMovementId,
            curMovementIndex: e.currentTarget.id - 1,
            actionName: "修改动作",
            showModal: true
        });
        // planPage.onShow();
    },

    onGroupFinished: function (e) {

        console.log("in onGroupFinished, id: ", e.currentTarget.id);

        // var tmp = this.data.curRecords.movementList[e.currentTarget.id - 1];
        // if (tmp.contents.curFinishedGpCount < tmp.contents.planGpCount ||
        //     tmp.contents.mvFeeling == 0) {
        //     var curSelectedMovementId = e.currentTarget.id;
        //     console.log("in onGroupModify, tmp ", tmp);
        //     this.data.MVSCOREMODAL.setBuffMovement(tmp, this);
        //
        //
        //     this.setData({
        //         MVSCOREMODAL: this.data.MVSCOREMODAL,
        //         curSelectedMovementId: curSelectedMovementId,
        //         curMovementIndex: e.currentTarget.id - 1,
        //         showMvScoreModal: true
        //     });
        // }


    },

    /**
     * 功能：每组动作记录修改
     * 参数：e，点击事件
     */
    onMovementModify: function (e) {
        var checked = e.detail.value;
        var id = e.currentTarget.id;

        console.log("in onMovementModify, id: ", e, id, checked);
    },

    /**
     * 功能：标记每组动作的状态，点击该checkbox时，表示动作已经完成
     */
    onMovementFinished: function (e) {

        var checked = e.detail.value;
        // console.log("checked: ", checked);

        var details = this.data.curRecords.movementList[this.data.curMovementIndex].contents.details;
        // console.log(details);
        //这里不能绑定纯数字的item，否则无法监听，所以，id要用String转成字符串
        for (var idx = 0; idx < details.length; idx++) {
            if (checked.indexOf(String(details[idx].id)) !== -1) {
                this.data.curRecords.movementList[this.data.curMovementIndex].contents.details[idx].finished = true;
            } else {
                this.data.curRecords.movementList[this.data.curMovementIndex].contents.details[idx].finished = false;
            }
        }

        this.setData({
            curRecords: this.data.curRecords,
        });

        var that = this;
        console.log("in onGroupModify, e ", e);

        var tmp = this.data.curRecords.movementList[this.data.curMovementIndex];
        this.data.MVSCOREMODAL.setBuffMovement(tmp, this);

        this.setData({
            MVSCOREMODAL: this.data.MVSCOREMODAL,

            showMvScoreModal: true
        });
        // console.log("in onMovementFinished, this.data.curRecords[this.data.curMovementIndex].contents.details",
        //   this.data.curRecords[this.data.curMovementIndex].contents.details);
    },

    // ---------------------------------------------
    // 响应Modal界面控制
    /**
     *
     */
    onPreventTouchMove: function (e) {
        this.data.PLANMODAL.preventTouchMove(e);
    },

    onHideModal: function (e) {
        if (this.data.showModal)
            this.data.PLANMODAL.hideModal(e, this);
        else
            this.data.MVSCOREMODAL.hideModal(e, this);
    },

    onCancel: function (e) {
        if (this.data.showModal)
            this.data.PLANMODAL.cancel(e, this);
        else
            this.data.MVSCOREMODAL.cancel(e, this);
    },

    onConfirm: function (e) {
        if (this.data.showModal)
            this.data.PLANMODAL.confirm(e, this);
        else
            this.data.MVSCOREMODAL.confirm(e, this);
    },

    onRemove: function (e) {
        this.data.PLANMODAL.removeMovement(e, this);
    },

    // ---------------------------------------------
    // 响应Modal界面组件控制
    // 因为Modal必须内嵌在plan页面里，数据就必须挂在页面中，
    // 所以需要把页面实例(this)传过去，方便更新界面数据和交互

    onMovementChange: function (e) {
        this.data.PLANMODAL.movementChange(e, this);
    },

    onMovementColumnChange: function (e) {
        this.data.PLANMODAL.movementColumnChange(e, this);
    },

    onNumberChange: function (e) {
        if (this.data.showModal)
            this.data.PLANMODAL.numberChange(e, this);
        else
            this.data.MVSCOREMODAL.numberChange(e, this);
    },

    onScoreChange: function (e) {
        this.data.MVSCOREMODAL.scoreChange(e, this);
    },

    onSeperatingSelect: function (e) {
        this.data.PLANMODAL.setSeperatingSelect(e, this);
    },

    onSameMvCount: function (e) {
        this.data.PLANMODAL.setSameMvCount(e, this);
    },

    onInputGroupChange: function (e) {
        this.data.PLANMODAL.inputGroupChange(e, this);
    },

    onInputMvCountChange: function (e) {
        this.data.PLANMODAL.inputMvCountChange(e, this);
    },

    onInputWeightChange: function (e) {
        this.data.PLANMODAL.inputWeightChange(e, this);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化
        var planModal = new PlanModal.PlanModal(this);
        var mvScoreModal = new MvScoreModal.MvScoreModal();
        this.data.Controller = new Controller.Controller();

        this.setData({
            selectedDate: util.formatDateToString(new Date()),
            Controller: this.data.Controller,
            PLANMODAL: planModal,
            MVSCOREMODAL: mvScoreModal

        });


        console.log("plan page onLoad call");
        console.log("this.data.PLANMODAL", this.data.PLANMODAL);
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
        this.data.curRecords = new DailyRecords.DailyRecords(this.data.selectedDate);
        // console.log("in onShow, this.data.curRecords: ", this.data.curRecords);
        var curRecords = wx.getStorageSync(util.formatDateToString(new Date()));

        if (typeof (curRecords.date) != "undefined" && curRecords.date != "") {
            this.data.curRecords.fullCopyFrom(curRecords);
        }

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


        console.log("plan page onLoad, this.data.curRecords: ", this.data.curRecords);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        this.data.Controller.saveData(util.formatDateToString(new Date()),
            DATATYPE.DailyRecords,
            this.data.curRecords);
        console.log("plan page onHide call: data saved");
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
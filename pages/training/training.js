/**
 * 锻炼计划记录页面
 */
import util from '../../utils/util.js'
import controller from '../../utils/controller.js'
import DataType from '../../datamodel/DataType.js'
import SingleDayRecords from '../../datamodel/SingleDayRecords.js'
import Movement from '../../datamodel/Movement.js'
import Record from '../../datamodel/Record.js'
import PlanModal from '../ui/modal/PlanModal.js'

// import planPage from '../listplan/plan.js'

//获取应用实例
var app = getApp();
const DATATYPE = new DataType.DataType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        curRecords: [],
        curMovementName: '',
        curMovementIndex: 0, //当前选中的动作，初始选中第一个

        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        actionName: '',
        showModal: false
    },

    // 弹出Modal
    PLANMODAL: '',

    /**
     * 当今日计划中，一个动作被选上的时候，列出这组所有的动作细节
     */
    onGroupSelected: function (e) {
        console.log("in onPlanSelected, id: ", e.detail.value);

        // this.data.curRecords[e.detail.value -1].selected = true;

        var curMovementName;
        var curMovementIndex;

        for (var item of this.data.curRecords.movementList) {
            if (item.id == e.detail.value) {
                curMovementName = item.movementName;
                curMovementIndex = item.id - 1;
                break;
            }
        }

        this.setData({
            curMovementName: curMovementName,
            curMovementIndex: curMovementIndex,
            // curRecords: this.data.curRecords
        });
    },

    /**
     * 功能：每组动作修改
     * 参数：e，点击事件
     */
    onGroupModify: function (e) {
        var id = e.currentTarget.id;
        console.log("in onGroupModify, e ", e);

        var tmp = this.data.curRecords.movementList[e.currentTarget.id - 1];
        this.data.PLANMODAL.setBuffMovement(tmp, this);

        this.setData({
            PLANMODAL: this.data.PLANMODAL,
            curSelectedMovementId: e.currentTarget.id,
            actionName: "修改动作",
            showModal: true
        });
        // planPage.onShow();
    },

    onGroupFinished: function (e) {
        var checked = e.detail.value;
        console.log("in onGroupFinished, id: ", e, checked);
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

        var tmpMovementAmount = this.data.curRecords.movementList[this.data.curMovementIndex].movementAmount;
        // console.log(tmpMovementAmount);
        //这里不能绑定纯数字的item，否则无法监听，所以，id要用String转成字符串
        for (var idx = 0; idx < tmpMovementAmount.length; idx++) {
            if (checked.indexOf(String(tmpMovementAmount[idx].id)) !== -1) {
                this.data.curRecords.movementList[this.data.curMovementIndex].movementAmount[idx].finished = true;
            } else {
                this.data.curRecords.movementList[this.data.curMovementIndex].movementAmount[idx].finished = false;
            }
        }
        this.data.curRecords.movementList[this.data.curMovementIndex].curFinishedMvCount = checked.length;

        this.setData({
            curRecords: this.data.curRecords,
        });

        var that = this;
        console.log("in onGroupModify, e ", e);
        wx.showModal({
            title: 'haha',
            content: 'Just a Test',
            // showCancel: false
        });
        // console.log("in onMovementFinished, this.data.curRecords[this.data.curMovementIndex].movementAmount",
        //   this.data.curRecords[this.data.curMovementIndex].movementAmount);
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
        this.data.PLANMODAL.hideModal(e, this);
    },

    onCancel: function (e) {
        this.data.PLANMODAL.cancel(e, this);
    },

    onConfirm: function (e) {
        this.data.PLANMODAL.confirm(e, this);
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
        this.data.PLANMODAL.numberChange(e, this);
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
        var modal = new PlanModal.PlanModal(this);
        this.setData({
            PLANMODAL: modal,

        });
        console.log("plan page onLoad, this.data.curRecords: ", this.data.curRecords);

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
        var curRecords = controller.loadData(util.formatDateToString(new Date()),
            DATATYPE.SingleDayRecords);

        this.setData({
            curRecords: curRecords
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        controller.saveData(this.data.selectedDate,
            DATATYPE.SingleDayRecords,
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
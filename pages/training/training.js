/**
 * 锻炼计划记录页面
 */
import util from '../../utils/util.js'
import controller from '../../utils/controller.js'
import DataType from '../../datamodel/DataType.js'
import SingleDayRecords from '../../datamodel/SingleDayRecords.js'
import Movement from '../../datamodel/Movement.js'
import Record from '../../datamodel/Record.js'
import MovementModal from '../ui/modal/MovementModal.js'

// import planPage from '../listplan/plan.js'

//获取应用实例
var app = getApp();
const DATATYPE = new DataType.DataType();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        todayTrainPlan: [],
        curMovementName: '',
        curMovementIndex: 0, //当前选中的动作，初始选中第一个

        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        actionName: '',
        showModal: false
    },

    // 弹出Modal
    MOVEMENTMODAL: '',

    /**
     * 当今日计划中，一个动作被选上的时候，列出这组所有的动作细节
     */
    onGroupSelected: function (e) {
        console.log("in onPlanSelected, id: ", e.detail.value);

        // this.data.todayTrainPlan[e.detail.value -1].selected = true;

        var curMovementName;
        var curMovementIndex;

        for (var item of this.data.todayTrainPlan.movementList) {
            if (item.id == e.detail.value) {
                curMovementName = item.movementName;
                curMovementIndex = item.id - 1;
                break;
            }
        }

        this.setData({
            curMovementName: curMovementName,
            curMovementIndex: curMovementIndex,
            // todayTrainPlan: this.data.todayTrainPlan
        });
    },

    /**
     * 功能：每组动作修改
     * 参数：e，点击事件
     */
    onGroupModify: function (e) {
        var id = e.currentTarget.id;
        console.log("in onGroupModify, e ", e);
        wx.showModal({
            title: 'haha',
            content: 'Just a Test',
            showCancel: false
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

        var tmpMovementAmount = this.data.todayTrainPlan.movementList[this.data.curMovementIndex].movementAmount;
        // console.log(tmpMovementAmount);
        //这里不能绑定纯数字的item，否则无法监听，所以，id要用String转成字符串
        for (var idx = 0; idx < tmpMovementAmount.length; idx++) {
            if (checked.indexOf(String(tmpMovementAmount[idx].id)) !== -1) {
                this.data.todayTrainPlan.movementList[this.data.curMovementIndex].movementAmount[idx].finished = true;
            } else {
                this.data.todayTrainPlan.movementList[this.data.curMovementIndex].movementAmount[idx].finished = false;
            }
        }
        this.data.todayTrainPlan.movementList[this.data.curMovementIndex].curFinishedMvCount = checked.length;

        this.setData({
            todayTrainPlan: this.data.todayTrainPlan,
        });

        var that = this;
        console.log("in onGroupModify, e ", e);
        wx.showModal({
            title: 'haha',
            content: 'Just a Test',
            // showCancel: false
        });
        // console.log("in onMovementFinished, this.data.todayTrainPlan[this.data.curMovementIndex].movementAmount",
        //   this.data.todayTrainPlan[this.data.curMovementIndex].movementAmount);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化
        this.MOVEMENTMODAL = new MovementModal.MovementModal(this);
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
        var todayTrainPlan = controller.loadData(util.formatDateToString(new Date()),
            DATATYPE.SingleDayRecords);

        this.setData({
            todayTrainPlan: todayTrainPlan
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
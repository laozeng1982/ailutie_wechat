// records.js
import util from '../../utils/util.js'
import RecordsPageFunctions from 'RecordsPageFunctions.js'
import RecordsModal from '../ui/modal/RecordsModal.js'

//全局变量
const app = getApp();

Page({

    /**
     * 页面的初始数据
     * 只放页面的显示数据及控制显示的开关值
     */
    data: {

        curRecords: '',
        today: '',
        selectedDate: '',
        selectedWeek: '',
        curYear: 2017,
        curMonth: 0,
        curDate: '',
        weekArr: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        //保存当月的日期
        dateList: [],
        //保存有计划的日期
        dateListWithPlan: [],
        Functions: '',
        // 日期上长按，出现Modal的控制器
        RECORDSMODAL: '',
        showDateLongPress: false,

        // 控制器，只能为1,2,3
        selectedModel: -1
    },

    /**
     * 响应日历上选中日期
     * @param e
     */
    onDateSelected: function (e) {
        this.data.Functions.selectDate(this, e );
    },

    /**
     * 响应上月按钮
     */
    onLastMonth: function () {
        this.data.Functions.moveMonth(this, "last");
    },

    /**
     * 响应下月按钮
     */
    onNextMonth: function () {
        this.data.Functions.moveMonth(this, "next");
    },

    /**
     * 响应到今天按钮
     */
    onToToday: function () {
        this.data.Functions.moveMonth(this, "now");
    },

    /**
     * 日期上常按出现拷贝功能
     * 1、先判断选中的日期，有无计划，无计划弹出Toast提示；有计划，弹出Modal供用户选择
     * 1.1、将选中的计划设为每周同天的计划，有个时间段的概念，多长时间内的每周？如果指定的天有计划，是合并还是替换
     * 1.2、将选中的计划拷贝到指定的天，如果指定的天有计划，是合并还是替换
     * 1.3、删除当前计划，需要判断是否过期，过期不能删撒，今天的有记录就要提示
     * @param e
     */
    onDateLongPress: function (e) {
        console.log("in onDateLongPress, long press", e);
        console.log("in onDateLongPress, long press", e.currentTarget.dataset.date.value);
        var tmpRecords = this.data.Functions.loadData(e.currentTarget.dataset.date.value);
        if (tmpRecords.movementList.length === 0) {
            util.showToast("兄弟，别闹，这天没数据啊！！！", this, 2000);
            return;
        } else {
            this.setData({
                selectedModel: 1,
                showDateLongPress: true,
            });
        }


        // util.showToast("兄弟，你想干啥！！！", this, 2000);

    },

    /**
     * 设置模式
     * @param e
     */
    onModelChange: function (e) {
        console.log(e);
        this.setData({
            selectedModel: parseInt(e.detail.value),
        });

        console.log("in onModelChange, set model to: ", this.data.selectedModel);
    },

    /**
     * 这里是主要的处理逻辑
     * @param e
     */
    onConfirm: function (e) {

        // 最后执行！
        this.data.Functions.clearSelected(this);

    },

    /**
     * 退出，相当于返回
     * @param e
     */
    onCancel: function (e) {
        this.data.Functions.clearSelected(this);

    },

    /**
     * 响应动作列表中的动作被点中的事件，根据当时选择的日期进行判断
     * 1、如果是今天之前的，列出这个动作完成或者计划的详细信息
     * 2、如果是今天的，直接去锻炼
     * 3、如果是将来的计划，直接进入计划界面，并且选择该计划，进入待修改状态
     * @param e
     */
    onMovementTap: function (e) {
        console.log("in onMovementTap, selected: ", e.currentTarget.id);
        //传回全局变量，以便下次进入日期选择，还是当时选的。
        var direction = util.dateDirection(this.data.selectedDate);
        switch (direction) {
            case -1:
                break;
            case 0:
                app.globalData.selectedMvIdOnRecordPage = e.currentTarget.id;

                wx.switchTab({
                    url: '../training/training',
                });
                break;
            case 1:
                app.globalData.selectedPartNameOnRecordPage =
                    this.data.curRecords.movementList[e.currentTarget.id - 1].mvInfo.partName;
                app.globalData.selectedMoveNameOnRecordPage =
                    this.data.curRecords.movementList[e.currentTarget.id - 1].mvInfo.mvName;
                wx.switchTab({
                    url: '../listplan/plan',
                });
                break;
            default:
                break;
        }

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var today = util.formatDateToString(new Date());
        var Functions = new RecordsPageFunctions.RecordsPageFunctions();
        this.setData({
            today: today,
            RECORDSMODAL: new RecordsModal.RecordsModal(),
            Functions: Functions
        });
        console.log("Records page onLoad call, this.data.today: ", this.data.today);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     * 每次进入页面，调用loadDate()，刷新数据
     */
    onShow: function () {
        console.log(app.globalData.selectedDate);
        var year = app.globalData.selectedDate.getFullYear();
        var month = app.globalData.selectedDate.getMonth() + 1;
        var day = app.globalData.selectedDate.getDate();
        var idx = app.globalData.selectedDate.getDay();

        console.log("Records page onShow call, this.data.Functions:", this.data.Functions);

        var curRecords = this.data.Functions.loadData(util.formatStringDate(year, month, day));

        this.setData({
            curYear: year,
            curMonth: month,
            curDate: day,
            curRecords: curRecords,
            selectedDate: util.formatStringDate(year, month, day),
            selectedWeek: this.data.weekArr[idx]
        });


        this.data.Functions.prepareData(this);

        this.data.Functions.setDateList(this, year, month);
        console.log("Records page onShow call, this.data.curRecords: ", this.data.curRecords);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log("Records page onHide call, Nothing to be saved");
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("unload");
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
// calender.js
import util from '../../../utils/util.js'

import Controller from '../../../utils/Controller.js'
import DataType from '../../../datamodel/StorageType.js'

//全局变量
var app = getApp();
const DATATYPE = new DataType.StorageType();
const CONTROLLER = new Controller.Controller();
Page({

    /**
     * 页面的初始数据
     */
    data: {

        curRecords: '',
        today: '',
        selectedDate: '',
        selectedWeek: '',
        curYear: 2017,
        curMonth: 0,
        curDate: '',
        daysCountArr: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        weekArr: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        //保存当月的日期
        dateList: [],
        //保存有计划的日期
        dateListWithPlan: [],

        // 控制器，只能为1,2,3
        selectedModel: 1

    },

    prepareData: function () {
        // var
        //同步获取
        var userInfo = CONTROLLER.loadData(DATATYPE.UserInfo.value, DATATYPE.UserInfo);

        var dateListWithPlan = userInfo.hasPlanDateList;

        this.setData({
            dateListWithPlan: dateListWithPlan,

        });

        console.log("in calender.prepareData, userInfo: ", userInfo);
        console.log("in calender.prepareData, this.data.dateListWithPlan", this.data.dateListWithPlan);

    },

    /**
     * 最核心的函数
     * 1、获取每个的显示列表
     * 2、搜索、标记日期状态
     */
    setDateList: function (year, month) {
        var vm = this;
        //如果是闰年，则2月有29天
        var daysCountArr = this.data.daysCountArr;
        if (year % 4 == 0 && year % 100 != 0) {
            this.data.daysCountArr[1] = 29;
            this.setData({
                daysCountArr: daysCountArr
            });
        }

        //第几个月；下标从0开始，实际月份需要加1
        var dateList = [];
        dateList[0] = [];

        //第几个星期
        var weekIndex = 0;
        var firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getDay();
        var hasDoneFirstWeek = false;
        // console.log(firstDayOfWeek);
        for (var i = 0; i < vm.data.daysCountArr[month - 1]; i++) {
            var week = new Date(Date.UTC(year, month - 1, i + 1)).getDay();
            if (!hasDoneFirstWeek) {
                for (var blank = 0; blank < firstDayOfWeek; blank++) {
                    dateList[weekIndex].push({
                        value: '',
                        date: '',
                        week: '',
                        selected: false,
                        hasPlan: false
                    });
                }
                hasDoneFirstWeek = true;
            }

            dateList[weekIndex].push({
                value: util.formatStringDate(year, month, (i + 1)),
                date: i + 1,
                week: week,
                selected: false,
                hasPlan: false
            });

            if (week == 6) {
                weekIndex++;
                dateList[weekIndex] = [];
            }

        }

        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++)
                for (var planDay of this.data.dateListWithPlan) {
                    //当有记录的标记
                    if (dateList[week][day].value === planDay) {
                        // console.log(dateList[week][day].value, planDay);
                        dateList[week][day].hasPlan = true;
                    }
                }

        }

        vm.setData({
            dateList: dateList
        });
    },

    onToSelectedDate: function (e) {
        for (var idx = 0; idx < this.data.dateList.length; idx++) {
            for (var i = 0; i < this.data.dateList[idx].length; i++) {
                // console.log(this.data.dateList[idx][i]);
                if (this.data.dateList[idx][i].value === e.currentTarget.dataset.date.value) {
                    this.data.dateList[idx][i].selected = !this.data.dateList[idx][i].selected;
                }
            }

        }

        this.setData({
            dateList: this.data.dateList
        });

        this.selectDate(e.currentTarget.dataset.date.value, e.currentTarget.dataset.date.week);
    },

    selectDate: function (selectedDate, selectedWeek) {
        var now = selectedDate.split('-');
        var curYear = parseInt(now[0]);
        var curMonth = parseInt(now[1]);
        var curDate = parseInt(now[2]);


        var curRecords = CONTROLLER.loadData(selectedDate, DATATYPE.DailyRecords);

        this.setData({
            curRecords: curRecords,
            selectedDate: selectedDate,
            selectedWeek: selectedWeek,
            curYear: curYear,
            curMonth: curMonth,
            curDate: curDate,

        });

        app.globalData.selectedDate = util.getDateFromString(selectedDate, '-');
        console.log(app.globalData.selectedDate);
    },

    /**
     * 响应上月按钮
     */
    onPreMonth: function () {
        this.moveMonth(false);
    },

    /**
     * 响应下月按钮
     */
    onNextMonth: function () {
        this.moveMonth(true);
    },

    /**
     * 移动月的操作
     */
    moveMonth: function (isNext) {
        var curYear = this.data.curYear;
        var curMonth = this.data.curMonth;
        if (isNext) {
            curYear = curMonth + 1 == 13 ? curYear + 1 : curYear;
            curMonth = curMonth + 1 == 13 ? 1 : curMonth + 1;
        } else {
            curYear = curMonth - 1 ? curYear : curYear - 1;
            curMonth = curMonth - 1 ? curMonth - 1 : 12;
        }

        this.setData({
            curYear: curYear,
            curMonth: curMonth
        });

        this.setDateList(curYear, curMonth);
    },

    onToThisMonth: function () {
        var now = new Date();
        var curYear = now.getFullYear();
        var curMonth = now.getMonth() + 1;
        var curDate = now.getDate();

        this.setData({
            selectedDate: util.formatDateToString(new Date()),
            curYear: curYear,
            curMonth: curMonth,
            curDate: curDate
        });

        this.setDateList(curYear, curMonth);

        this.selectDate(util.formatDateToString(new Date()));
    },

    onToCheckPlan: function () {
        // this.selectDate(util.formatDateToString(new Date()));
        //传回全局变量，以便下次进入日期选择，还是当时选的。

        wx.switchTab({
            url: '../../listplan/plan',
        });
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

    },

    /**
     * 退出，相当于返回
     * @param e
     */
    onCancel: function (e) {
        wx.switchTab({
            url: '../../records/records',
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var today = util.formatDateToString(new Date());

        this.setData({
            today: today,
        });
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

        var curRecords = CONTROLLER.loadData(util.formatStringDate(year, month, day), DATATYPE.DailyRecords);

        this.setData({
            curYear: year,
            curMonth: month,
            curDate: day,
            curRecords: curRecords,
            selectedDate: util.formatStringDate(year, month, day),
            selectedWeek: this.data.weekArr[idx]
        });


        this.prepareData();

        this.setDateList(year, month);

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log("hide");
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
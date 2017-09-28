// pages/plan/user_define/preview_plan.js

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
        todayMonth: '',
        todayYear: '',
        selectedDate: '',
        selectedWeek: '',
        curYear: 2017,
        curMonth: 0,
        curDate: '',
        daysCountArr: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        weekArr: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        weekList: [
            {id: 0, value: '日', checked: false},
            {id: 1, value: '一', checked: false},
            {id: 2, value: '二', checked: false},
            {id: 3, value: '三', checked: false},
            {id: 4, value: '四', checked: false},
            {id: 5, value: '五', checked: false},
            {id: 6, value: '六', checked: false}
        ],
        // 保存当月的日期
        dateList: [],
        // 保存有计划的日期
        dateListWithPlan: [],
        // 保存有锻炼的日期
        dateListWithTraining: [],

        showPlanDetail: false,

        calendars: [1, 2, 3],
        lastCalendarId: 0,
        duration: 1000,

        selectedMovementId: -1,
        showDateLongPress: false,

    },

    /**
     * 读取数据
     * @param key
     */
    loadData: function (key) {
        return app.Controller.loadData(key, app.StorageType.DailyRecords);
    },

    /**
     * 准备需要标注的数据
     */
    prepareData: function () {
        //同步获取
        let userInfo = app.Controller.loadData(app.StorageType.UserInfo.value, app.StorageType.UserInfo);

        let dateListWithPlan = userInfo.hasPlanDateList;
        let dateListWithTraining = userInfo.hasTrainedDateList;

        this.setData({
            dateListWithPlan: dateListWithPlan,
            dateListWithTraining: dateListWithTraining
        });
    },

    /**
     * 最核心的函数
     * 1、获取每个的显示列表
     * 2、搜索、标记日期状态
     */
    setDateList: function (year, month) {
        let week;
        // 如果是闰年，则2月有29天
        this.data.daysCountArr[1] = 28;
        if (parseInt(year) % 4 === 0 && parseInt(year) % 100 !== 0) {
            console.log(parseInt(year) % 4, "and ", parseInt(year) % 100);
            this.data.daysCountArr[1] = 29;
        }

        //第几个月；下标从0开始，实际月份需要加1
        let dateList = [];
        dateList[0] = [];

        //第几个星期
        let weekIndex = 0;
        let firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getDay();
        let hasDoneFirstWeek = false;
        // console.log(firstDayOfWeek);
        let lastYear = month - 1 > 0 ? year : year - 1;
        let lastMonth = month - 1 > 0 ? month - 1 : 12;
        let nextYear = month + 1 === 13 ? year + 1 : year;
        let nextMonth = month + 1 === 13 ? 1 : month + 1;
        for (let idx = 0; idx < this.data.daysCountArr[month - 1]; idx++) {
            week = new Date(Date.UTC(year, month - 1, idx + 1)).getDay();
            // 补齐每个月前面的日子，计算上个月的尾巴
            if (firstDayOfWeek === 0 && !hasDoneFirstWeek) {
                for (let i = 0; i < 7; i++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(lastYear, lastMonth, (this.data.daysCountArr[lastMonth - 1] + i - 6)),
                        date: this.data.daysCountArr[lastMonth - 1] + i - 6,
                        week: i,
                        selected: false,
                        hasPlan: false,
                        hasTrained: false,
                        inThisMonth: false
                    });
                }
                weekIndex++;
                dateList[weekIndex] = [];
                hasDoneFirstWeek = true;

            } else if (!hasDoneFirstWeek) {
                for (let blank = 0; blank < firstDayOfWeek; blank++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(lastYear, lastMonth, this.data.daysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek),
                        date: this.data.daysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek,
                        week: week + blank - firstDayOfWeek,
                        selected: false,
                        hasPlan: false,
                        hasTrained: false,
                        inThisMonth: false
                    });
                }
                hasDoneFirstWeek = true;
            }

            // 每个月的日子
            dateList[weekIndex].push({
                value: app.Util.formatStringDate(year, month, (idx + 1)),
                date: idx + 1,
                week: week,
                selected: false,
                hasPlan: false,
                hasTrained: false,
                inThisMonth: true
            });


            if (week === 6) {
                weekIndex++;
                dateList[weekIndex] = [];
            }

            // 补齐每个月最后面的日子，计算下个月的头
            if (idx === this.data.daysCountArr[month - 1] - 1) {
                let rest = 7 - dateList[weekIndex].length;
                for (let i = 0; i < rest; i++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(nextYear, nextMonth, (i + 1)),
                        date: i + 1,
                        week: week + i + 1 <= 6 ? week + i + 1 : i,
                        selected: false,
                        hasPlan: false,
                        hasTrained: false,
                        inThisMonth: false
                    });
                }

                if (weekIndex !== 5) {
                    weekIndex = 5;
                    dateList[weekIndex] = [];
                    for (let i = 0; i < 7; i++) {
                        dateList[weekIndex].push({
                            value: app.Util.formatStringDate(nextYear, nextMonth, (rest + i + 1)),
                            date: rest + i + 1,
                            week: i,
                            selected: false,
                            hasPlan: false,
                            hasTrained: false,
                            inThisMonth: false
                        });
                    }
                }
            }
        }

        // 准备有计划的数据
        console.log(app.plan);
        for (let week = 0; week < dateList.length; week++) {
            for (let day = 0; day < dateList[week].length; day++) {
                if (this.data.dateListWithPlan.includes(dateList[week][day].value)) {
                    dateList[week][day].hasPlan = true;
                }

            }
        }

        this.setData({
            dateList: dateList
        });
    },

    /**
     * 移动月的操作
     */
    moveMonth: function (isNext) {
        let curYear = this.data.curYear;
        let curMonth = this.data.curMonth;
        let curDate = this.data.curDate;

        if (isNext === "next") {
            curYear = curMonth + 1 === 13 ? curYear + 1 : curYear;
            curMonth = curMonth + 1 === 13 ? 1 : curMonth + 1;
            curDate = 1;
        } else if (isNext === "last") {
            curYear = curMonth - 1 ? curYear : curYear - 1;
            curMonth = curMonth - 1 ? curMonth - 1 : 12;
            curDate = 1;
        } else if (isNext === "now") {
            let now = new Date();
            curYear = now.getFullYear();
            curMonth = now.getMonth() + 1;
            curDate = now.getDate();
        } else if (isNext === "selected") {

        }

        console.log("here: ", curYear, curMonth, curDate);
        this.setData({
            curYear: curYear,
            curMonth: curMonth,
            curDate: curDate,
            showPlanDetail: false
        });

        this.setDateList(curYear, curMonth);
        if (isNext === "now")
            this.selectDate(app.Util.formatDateToString(new Date()));

    },

    /**
     *
     * @param e
     */
    selectDate: function (e) {
        let selectedDate = e.currentTarget.dataset.date.value;
        let selectedWeek = [];

        for (let week of this.data.dateList) {
            for (let day of week) {
                if (day.value === selectedDate) {
                    selectedWeek = week;
                    break;
                }
            }
        }

        let curRecords = app.Controller.loadData(selectedDate, app.StorageType.DailyRecords);

        this.setData({
            curRecords: curRecords,
            selectedDate: selectedDate,
            selectedWeek: selectedWeek,
            showPlanDetail: true
        });

        app.globalData.selectedDate = app.Util.getDateFromString(selectedDate, '-');
        console.log(app.globalData.selectedDate);

    },

    /**
     * 响应日历上选中日期
     * @param e
     */
    onDateSelected: function (e) {
        this.selectDate(e);

    },

    /**
     * 响应日期选择器，跳转到选择的月份
     * @param e
     */
    onSelectMonthYear: function (e) {
        console.log(e);

        let dateArr = e.detail.value.split("-");

        this.setData({
            curYear: parseInt(dateArr[0]),
            curMonth: parseInt(dateArr[1]),
            curDate: parseInt(dateArr[2]),
            showPlanDetail: false
        });
        this.moveMonth("selected");
    },

    /**
     * 响应到今天按钮
     */
    onToThisMounth: function (e) {
        this.moveMonth("now");

    },

    /**
     * 响应日历头部点击，重新显示日历
     * @param e
     */
    onCalendarHeader: function (e) {
        this.setData({
            showPlanDetail: false
        });

    },

    /**
     * 响应日历上下滑动
     */
    onVerticalSwiperChange: function (e) {
        let current = parseInt(e.detail.current);
        let lastCalenderId = this.data.lastCalendarId;

        // console.log("current: ", current, " lastCalenderId: ", lastCalenderId);

        let isNextMonth = false;

        // 判断是左滑还是右划，左滑表示上个月
        switch (lastCalenderId) {
            case 0:
                if (current === 1)
                    isNextMonth = true;
                else if (current === 2)
                    isNextMonth = false;
                break;
            case 1:
                if (current === 0)
                    isNextMonth = false;
                else if (current === 2)
                    isNextMonth = true;
                break;
            case 2:
                if (current === 0)
                    isNextMonth = true;
                else if (current === 1)
                    isNextMonth = false;
                break;
            default:
                console.log("what the fuck!!!!!");
                break;
        }

        if (isNextMonth) {
            this.moveMonth("next");
        } else {
            this.moveMonth("last");
        }

        this.setData({
            lastCalendarId: current
        });
    },

    /**
     * 点击确定返回上一个界面
     * @param e
     */
    onNext: function (e) {

        wx.showActionSheet({
            itemList: ['继续其他日期和部位', '开始锻炼', '回到首页'],
            success: function (res) {
                console.log(res.tapIndex);
                switch (res.tapIndex) {
                    case 0:
                        wx.navigateBack({
                            delta: 2,
                        });
                        break;
                    case 1:
                        wx.switchTab({
                            url: '../../training/training',
                        });
                        break;
                    case 2:
                        wx.switchTab({
                            url: '../../index/index',
                        });
                        break;
                }
            },
            fail: function (res) {
                console.log(res.errMsg);
            }
        });
        // wx.navigateBack({});
    },

    /**
     * 生命周期函数--监听页面加载
     * 每次进入，必然加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '计划预览',
        });
        let today = app.Util.formatDateToString(new Date());

        this.setData({
            today: today,
            todayMonth: parseInt(today.split('-')[1]),
            todayYear: parseInt(today.split('-')[0]),

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
        let year = app.globalData.selectedDate.getFullYear();
        let month = app.globalData.selectedDate.getMonth() + 1;
        let day = app.globalData.selectedDate.getDate();

        let curRecords = this.loadData(app.Util.formatStringDate(year, month, day));

        this.setData({
            curYear: year,
            curMonth: month,
            curDate: day,
            curRecords: curRecords,
            selectedDate: app.Util.formatStringDate(year, month, day),
        });

        this.prepareData();

        this.setDateList(year, month);
    },

    /**
     * 生命周期函数--监听页面隐藏
     * 做一些清理工作
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        console.log("Preview page Unload");
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
        this.setData({
            showPlanDetail: false
        });
        console.log("onReachBottom called");
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
// pages/plan/user_define/preview_plan.js

//全局变量
const app = getApp();

Page({

    /**
     * 页面的初始数据
     * 只放页面的显示数据及控制显示的开关值
     */
    data: {

        selectedDatePlan: '',
        today: '',
        todayMonth: '',
        todayYear: '',
        selectedDate: '',
        selectedWeek: '',
        currentYear: 2017,
        currentMonth: 0,
        currentDate: '',
        monthDaysCountArr: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        // 保存当月的日期
        dateList: [],

        showPlanDetail: false,

        // 日历滑动
        calendars: [1, 2, 3],
        lastCalendarId: 0,
        duration: 1000,

        options: '',

    },

    /**
     * 最核心的函数
     * 1、获取每个的显示列表
     * 2、搜索、标记日期状态
     */
    setDateList: function (year, month) {
        let week;
        // 如果是闰年，则2月有29天
        this.data.monthDaysCountArr[1] = 28;
        if (parseInt(year) % 4 === 0 && parseInt(year) % 100 !== 0) {
            console.log(parseInt(year) % 4, "and ", parseInt(year) % 100);
            this.data.monthDaysCountArr[1] = 29;
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
        for (let idx = 0; idx < this.data.monthDaysCountArr[month - 1]; idx++) {
            week = new Date(Date.UTC(year, month - 1, idx + 1)).getDay();
            // 补齐每个月前面的日子，计算上个月的尾巴
            if (firstDayOfWeek === 0 && !hasDoneFirstWeek) {
                for (let idx = 0; idx < 7; idx++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(lastYear,
                            lastMonth,
                            this.data.monthDaysCountArr[lastMonth - 1] + idx - 6),
                        date: this.data.monthDaysCountArr[lastMonth - 1] + idx - 6,
                        week: idx,
                        selected: false,
                        hasPlan: false,
                        planPartsArr: [],
                        planPartsStr: '',
                        inThisMonth: false
                    });
                }
                weekIndex++;
                dateList[weekIndex] = [];
                hasDoneFirstWeek = true;

            } else if (!hasDoneFirstWeek) {
                for (let blank = 0; blank < firstDayOfWeek; blank++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(lastYear,
                            lastMonth,
                            this.data.monthDaysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek),
                        date: this.data.monthDaysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek,
                        week: week + blank - firstDayOfWeek,
                        selected: false,
                        hasPlan: false,
                        planPartsArr: [],
                        planPartsStr: '',
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
                planPartsArr: [],
                planPartsStr: '',
                inThisMonth: true
            });


            if (week === 6) {
                weekIndex++;
                dateList[weekIndex] = [];
            }

            // 补齐每个月最后面的日子，计算下个月的头
            if (idx === this.data.monthDaysCountArr[month - 1] - 1) {
                let rest = 7 - dateList[weekIndex].length;
                for (let i = 0; i < rest; i++) {
                    dateList[weekIndex].push({
                        value: app.Util.formatStringDate(nextYear, nextMonth, (i + 1)),
                        date: i + 1,
                        week: week + i + 1 <= 6 ? week + i + 1 : i,
                        selected: false,
                        hasPlan: false,
                        planPartsArr: [],
                        planPartsStr: '',
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
                            planPartsArr: [],
                            planPartsStr: '',
                            inThisMonth: false
                        });
                    }
                }
            }
        }

        // 准备有计划的标注数据
        // console.log(app.currentPlan);
        for (let week = 0; week < dateList.length; week++) {
            for (let day = 0; day < dateList[week].length; day++) {
                // 先判断这天是否在周期内
                if (app.Util.inPeriod(app.currentPlan.startDate, dateList[week][day].value, app.currentPlan.endDate)) {
                    let partArr = [];
                    for (let partSet of app.currentPlan.partSet) {
                        if (partSet.trainDate.includes(dateList[week][day].week)) {
                            dateList[week][day].hasPlan = true;
                            dateList[week][day].planPartsArr.push(partSet.name);
                            partArr.push(partSet.name);
                        }
                    }
                    dateList[week][day].planPartsStr = app.Util.makePartString(partArr);
                }
            }
        }

        // 打印检验
        // console.log("log begins here~~~~~~~~~~~~~~~~~~~~~");
        // for (let week = 0; week < dateList.length; week++) {
        //     for (let day = 0; day < dateList[week].length; day++) {
        //         console.log("dateList[", week, "][", day, "], is: ", dateList[week][day].value
        //             , ", ", dateList[week][day].date
        //             , ", ", dateList[week][day].week
        //             , ", selected", dateList[week][day].selected
        //             , ", hasPlan", dateList[week][day].hasPlan
        //             , ", planPartsStr", dateList[week][day].planPartsStr.toString()
        //             , ", inThisMonth", dateList[week][day].inThisMonth);
        //     }
        // }

        this.setData({
            dateList: dateList
        });
    },

    /**
     * 移动月的操作，整月移动
     */
    moveMonth: function (isNext) {
        let currentYear = this.data.currentYear;
        let currentMonth = this.data.currentMonth;
        let currentDate = this.data.currentDate;

        if (isNext === "next") {
            currentYear = currentMonth + 1 === 13 ? currentYear + 1 : currentYear;
            currentMonth = currentMonth + 1 === 13 ? 1 : currentMonth + 1;
            currentDate = 1;
        } else if (isNext === "last") {
            currentYear = currentMonth - 1 ? currentYear : currentYear - 1;
            currentMonth = currentMonth - 1 ? currentMonth - 1 : 12;
            currentDate = 1;
        } else if (isNext === "now") {
            let now = new Date();
            currentYear = now.getFullYear();
            currentMonth = now.getMonth() + 1;
            currentDate = now.getDate();
        }

        console.log("move to: ", currentYear, "年", currentMonth, "月", currentDate, "日");
        this.setData({
            currentYear: currentYear,
            currentMonth: currentMonth,
            currentDate: currentDate,
            showPlanDetail: false,
            selectedDate: app.Util.formatDateToString(new Date())
        });

        this.setDateList(currentYear, currentMonth);

    },

    /**
     * 日历控制的核心函数
     * @param e
     */
    selectDate: function (e) {
        console.log(e.currentTarget.dataset.date);

        let selectedDate = e.currentTarget.dataset.date;
        let selectedWeek = [];

        for (let week of this.data.dateList) {
            for (let day of week) {
                if (day.value === selectedDate.value) {
                    selectedWeek = week;
                    break;
                }
            }
        }

        let selectedDatePlan = [];

        // 先判断这天是否在周期内，然后判断这天动作的重复次数里，有没有这个周期
        if (app.Util.inPeriod(app.currentPlan.startDate, selectedDate.value, app.currentPlan.endDate)) {
            for (let partSet of app.currentPlan.partSet) {
                if (partSet.trainDate.includes(selectedDate.week)) {
                    selectedDatePlan.push(partSet);
                }
            }
        }

        console.log("Selected Date's PlanSet: ", selectedDatePlan);

        this.setData({
            selectedDatePlan: selectedDatePlan,
            selectedDate: selectedDate.value,
            selectedWeek: selectedWeek,
            showPlanDetail: selectedDatePlan.length > 0
        });

        app.globalData.selectedDate = app.Util.getDateFromString(selectedDate.value, '-');
        console.log(app.globalData.selectedDate);

    },

    /**
     * 响应日历上选中日期
     * @param e
     */
    onSelectDateItem: function (e) {
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
            currentYear: parseInt(dateArr[0]),
            currentMonth: parseInt(dateArr[1]),
            currentDate: parseInt(dateArr[2]),
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
     * 保存数据
     */
    savePlanData: function () {

        app.currentPlan.currentUse = true;

        if (app.planSet.length === 0) {
            app.planSet.push(app.currentPlan);
        } else {
            // 暂时不考虑删除计划，隐藏即可，这里就需要判断是否有激活的计划，有的话直接替换，没有的话，直接添加
            var hasUsingPlan = false;
            for (let idx = 0; idx < app.planSet.length; idx++) {
                if (app.planSet[idx].currentUse) {
                    hasUsingPlan = true;
                    app.planSet.splice(idx, 1, app.currentPlan);
                }
            }
            if (!hasUsingPlan) {
                app.planSet.push(app.currentPlan);
            }
        }
        app.Controller.saveData(app.StorageType.PlanSet, app.planSet);
        console.log(app.planSet);
    },

    /**
     * 点击确定返回上一个界面
     * @param e
     */
    onConfirmSave: function (e) {
        var host = this;
        wx.showActionSheet({
            itemList: ['继续其他日期和部位', '开始锻炼', '回到首页'],
            success: function (res) {
                console.log(res.tapIndex);
                switch (res.tapIndex) {
                    case 0:
                        app.lastPlanSaved = true;
                        wx.navigateBack({
                            delta: 1,
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
                // 离开页面，保存工作
                host.savePlanData();
            },
            fail: function (res) {
                console.log(res.errMsg);
            }
        });

    },

    onDeletePlan: function () {
        wx.showModal({
            title: '提醒',
            content: '确定删除？',
            success: function (res) {
                if (res.confirm) {
                    let planSet = app.Controller.loadData(app.StorageType.PlanSet);
                    for (let idx = 0; idx < planSet.length; idx++) {
                        planSet[idx].currentUse = false;
                    }

                    app.Controller.saveData(app.StorageType.PlanSet, planSet);

                    wx.switchTab({
                        url: '../../index/index',
                    });
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },

    onModifyPlan: function () {
        wx.navigateTo({
            url: './select_part',
        });
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
            options: options,
            today: today,
            todayMonth: parseInt(today.split('-')[1]),
            todayYear: parseInt(today.split('-')[0]),

        });
        console.log("Preview page onLoad call, this.data.today: ", this.data.today);
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

        this.setData({
            currentYear: year,
            currentMonth: month,
            currentDate: day,
            selectedDate: app.Util.formatStringDate(year, month, day),
        });

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
        // this.setData({
        //     showPlanDetail: false
        // });
        // console.log("onReachBottom called");
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
});
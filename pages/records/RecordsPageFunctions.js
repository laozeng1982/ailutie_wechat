/**
 * Records页面的事件逻辑具体的操作函数
 * 每个函数都要给参数host，代表对主控页面的操作
 */
import util from '../../utils/util.js'

import Controller from '../../utils/Controller.js'
import DataType from '../../datamodel/StorageType.js'
import DailyRecords from '../../datamodel/DailyRecords.js'

//全局变量
var app = getApp();
const DATATYPE = new DataType.StorageType();
const CONTROLLER = new Controller.Controller();

class RecordsPageFunctions {
    constructor() {
        this.daysCountArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        this.weekArr = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    }

    /**
     *
     * @param key
     */
    loadData(key) {
        return CONTROLLER.loadData(key, DATATYPE.DailyRecords);
    };

    prepareData(host) {
        // var
        //同步获取
        var userInfo = CONTROLLER.loadData(DATATYPE.UserInfo.value, DATATYPE.UserInfo);

        var dateListWithPlan = userInfo.hasPlanDateList;
        var dateListWithTraining = userInfo.hasTrainedDateList;

        host.setData({
            dateListWithPlan: dateListWithPlan,
            dateListWithTraining: dateListWithTraining
        });

        console.log("in records.prepareData, userInfo: ", userInfo);
        console.log("in records.prepareData, this.data.dateListWithPlan", host.data.dateListWithPlan);
        console.log("in records.prepareData, this.data.dateListWithTraining", host.data.dateListWithTraining);

    };

    /**
     * 最核心的函数
     * 1、获取每个的显示列表
     * 2、搜索、标记日期状态
     */
    setDateList(host, year, month) {
        //如果是闰年，则2月有29天
        if (year % 4 === 0 && year % 100 !== 0) {
            this.daysCountArr[1] = 29;
        }

        //第几个月；下标从0开始，实际月份需要加1
        var dateList = [];
        dateList[0] = [];

        //第几个星期
        var weekIndex = 0;
        var firstDayOfWeek = new Date(Date.UTC(year, month - 1, 1)).getDay();
        var hasDoneFirstWeek = false;
        // console.log(firstDayOfWeek);
        var lastYear = month - 1 > 0 ? year : year - 1;
        var lastMonth = month - 1 > 0 ? month - 1 : 12;
        var nextYear = month + 1 === 13 ? year + 1 : year;
        var nextMonth = month + 1 === 13 ? 1 : month + 1;
        for (var idx = 0; idx < this.daysCountArr[month - 1]; idx++) {
            var week = new Date(Date.UTC(year, month - 1, idx + 1)).getDay();
            // 补齐每个月前面的日子，计算上个月的尾巴
            if (firstDayOfWeek === 0 && !hasDoneFirstWeek) {
                for (var i = 0; i < 7; i++) {
                    dateList[weekIndex].push({
                        value: util.formatStringDate(lastYear, lastMonth, (this.daysCountArr[lastMonth] + i - 7)),
                        date: this.daysCountArr[lastMonth] + i - 7,
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
                for (var blank = 0; blank < firstDayOfWeek; blank++) {
                    dateList[weekIndex].push({
                        value: util.formatStringDate(lastYear, lastMonth, this.daysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek),
                        date: this.daysCountArr[lastMonth - 1] + blank + 1 - firstDayOfWeek,
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
                value: util.formatStringDate(year, month, (idx + 1)),
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
            if (idx === this.daysCountArr[month - 1] - 1) {
                var rest = 7 - dateList[weekIndex].length;
                for (var i = 0; i < rest; i++) {
                    dateList[weekIndex].push({
                        value: util.formatStringDate(nextYear, nextMonth, (i + 1)),
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
                    for (var i = 0; i < 7; i++) {
                        dateList[weekIndex].push({
                            value: util.formatStringDate(nextYear, nextMonth, (rest + i + 1)),
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

        // console.log("log begins here~~~~~~~~~~~~~~~~~~~~~");
        // for (var week = 0; week < dateList.length; week++) {
        //     for (var day = 0; day < dateList[week].length; day++) {
        //         console.log("dateList[", week, "][", day, "], is: ", dateList[week][day].value
        //             , ",", dateList[week][day].date
        //             , ",", dateList[week][day].week
        //             , ",selected", dateList[week][day].selected
        //             , ",hasPlan", dateList[week][day].hasPlan
        //             , ",hasTrained", dateList[week][day].hasTrained
        //             , ",inThisMonth", dateList[week][day].inThisMonth);
        //     }
        // }

        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++) {
                // 准备有计划的数据

                if (host.data.dateListWithPlan.includes(dateList[week][day].value)) {
                    dateList[week][day].hasPlan = true;
                }

                // 准备有锻炼的数据
                if (host.data.dateListWithTraining.includes(dateList[week][day].value)) {
                    dateList[week][day].hasTrained = true;
                }

                // 准备选中的数据
                if (host.data.dateListSelected.includes(dateList[week][day].value)) {
                    dateList[week][day].selected = true;
                }
            }
        }

        host.setData({
            dateList: dateList
        });
    }

    /**
     * 移动月的操作
     */
    moveMonth(host, isNext) {
        var curYear = host.data.curYear;
        var curMonth = host.data.curMonth;
        var curDate = host.data.curDate;

        if (isNext === "next") {
            curYear = curMonth + 1 === 13 ? curYear + 1 : curYear;
            curMonth = curMonth + 1 === 13 ? 1 : curMonth + 1;
            curDate= 1;
        } else if (isNext === "last") {
            curYear = curMonth - 1 ? curYear : curYear - 1;
            curMonth = curMonth - 1 ? curMonth - 1 : 12;
            curDate= 1;
        } else if (isNext === "now") {
            var now = new Date();
            curYear = now.getFullYear();
            curMonth = now.getMonth() + 1;
            curDate = now.getDate();
        } else if (isNext === "selected") {

        }

        console.log("here: ", curYear, curMonth, curDate);
        host.setData({
            // 每换一月，都选到1号
            selectedDate: util.formatStringDate(curYear, curMonth, curDate),
            curYear: curYear,
            curMonth: curMonth,
            curDate: curDate
        });

        this.setDateList(host, curYear, curMonth);
        if (isNext === "now")
            this.selectDate(host, util.formatDateToString(new Date()));

    };

    /**
     *
     * @param host
     * @param e
     */
    selectDate(host, e) {
        // 如果是拷贝模式，则启动日期多选方案
        switch (host.data.selectedModel) {
            case 1:
                // 拷贝到多天
                this.selectMuliDays(host, e);
                break;
            case 2:
                // 拷贝到每周固定日期
                // this.selectMuliDays(host, e);
                break;
            case 3:
                // 删除，只能删除将来的计划
                this.selectMuliDays(host, e);
                break;
            default:
                // 普通的选择日期
                var now;

                console.log(e);
                var date;
                if (typeof (e) === "string") {
                    now = util.formatDateToString(new Date()).split('-');
                    date = util.formatDateToString(new Date());
                }
                else {
                    if (e.type === "change") {
                        now = e.detail.value.split('-');
                        date = e.detail.value;
                    }
                    else {
                        now = e.currentTarget.dataset.date.value.split('-');
                        date = e.currentTarget.dataset.date.value;
                    }

                }

                var curYear = parseInt(now[0]);
                var curMonth = parseInt(now[1]);
                var curDate = parseInt(now[2]);

                var curRecords = CONTROLLER.loadData(date, DATATYPE.DailyRecords);

                host.setData({
                    curRecords: curRecords,
                    selectedDate: date,
                    // selectedWeek: e.currentTarget.dataset.date.week,
                    curYear: curYear,
                    curMonth: curMonth,
                    curDate: curDate
                });

                app.globalData.selectedDate = util.getDateFromString(date, '-');
                console.log(app.globalData.selectedDate);
        }
    };

    selectMuliDays(host, e) {
        var dateList = host.data.dateList;
        var dateListSelected = host.data.dateListSelected;

        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++) {
                // console.log(this.data.dateList[week][day]);
                // 判断的条件，选中的日子，必须是今天之后的
                if (dateList[week][day].value === e.currentTarget.dataset.date.value &&
                    util.dateDirection(e.currentTarget.dataset.date.value) !== -1) {
                    dateList[week][day].selected = !dateList[week][day].selected;
                    if (!dateListSelected.includes(e.currentTarget.dataset.date.value)) {
                        dateListSelected.push(e.currentTarget.dataset.date.value);
                    } else {
                        // 如果已经有了，表示这个日期已经取消掉了，移出他
                        for (var idx = 0; idx < dateListSelected.length; idx++) {
                            if (dateListSelected[idx] === e.currentTarget.dataset.date.value) {
                                dateListSelected.splice(idx, 1);
                            }
                        }
                    }
                }
            }
        }


        host.setData({
            dateList: dateList,
            dateListSelected: dateListSelected
        });

        console.log("selectedList: ", dateListSelected);
    }

    checkDate(host, e) {

        if (host.data.endDate === host.data.selectedDate) {
            util.showToast("请调整截止日期。", host, 2000);
            return;
        }

        var weekList = host.data.weekList;

        var dateListSelected = [];

        // 准备日期选择的状态
        for (var idx = 0; idx < weekList.length; idx++) {
            if (parseInt(weekList[idx].id) === parseInt(e.currentTarget.id)) {
                weekList[idx].checked = !weekList[idx].checked;
                break;
            }
        }

        // 得到选择的日期列表
        var checkedDateList = host.data.checkedDateList;
        for (var item of weekList) {
            if (item.checked) {
                if (!checkedDateList.includes(item.id))
                    checkedDateList.push(item.id);
            } else {
                for (var idx = 0; idx < checkedDateList.length; idx++) {
                    if (checkedDateList[idx] === (item.id)) {
                        checkedDateList.splice(idx, 1);
                    }
                }
            }
        }

        console.log("in checkDate, checkedList: ", checkedDateList);

        // 按截止日期，去搜索
        var endDate = util.getDateFromString(host.data.endDate, "-");
        var runDate = util.getDateFromString(host.data.selectedDate, "-");
        const aDayMills = 24 * 3600 * 1000;
        while (runDate.getTime() <= endDate.getTime()) {
            if (checkedDateList.includes(runDate.getDay())) {
                dateListSelected.push(util.formatDateToString(runDate));
            }

            runDate.setTime(runDate.getTime() + aDayMills);
        }

        console.log(dateListSelected);

        host.setData({
            weekList: weekList,
            checkedDateList: checkedDateList,
            dateListSelected: dateListSelected
        });
        console.log("in checkDate, host.data.dateListSelected: ", host.data.dateListSelected);
    }

    confirmOperation(host) {
        console.log("in onConfirm, this.data.curRecords, ", host.data.curRecords);

        var sucess = false;

        var copyRecords = new DailyRecords.DailyRecords();
        copyRecords.fullCopyFrom(host.data.curRecords);
        copyRecords.clearAllAcutalData();

        if (host.data.dateListSelected.length === 0) {
            util.showToast("哥，别闹，先选择目的日期", host, 2000);
            sucess = false;
        } else {
            for (var item of host.data.dateListSelected) {
                switch (host.data.selectedModel) {
                    case 1:
                        copyRecords.date = item;
                        CONTROLLER.saveData(item, DATATYPE.DailyRecords, copyRecords);
                        sucess = true;
                        break;
                    case 2:
                        copyRecords.date = item;
                        CONTROLLER.saveData(item, DATATYPE.DailyRecords, copyRecords);
                        sucess = true;
                        break;
                    case 3:
                        var emptyRecords = new DailyRecords.DailyRecords(item);
                        CONTROLLER.saveData(item, DATATYPE.DailyRecords, emptyRecords);
                        console.log("here, ", item);
                        sucess = true;
                        break;
                    default:
                        console.log("in confirmOperation, default case happened!");
                        break;
                }

            }

            // 刷新视图
            this.prepareData(host);
        }


        return sucess;
        console.log("in onConfirm, copyRecords, ", copyRecords);
    }

    clearSelected(host) {
        var dateList = host.data.dateList;
        var weekList = host.data.weekList;
        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++) {
                dateList[week][day].selected = false;
            }
        }

        for (var idx = 0; idx < weekList.length; idx++) {
            weekList[idx].checked = false;
        }

        // 重置主控界面的状态
        host.setData({
            selectedModel: -1,
            dateList: dateList,
            weekList: weekList,
            dateListSelected: []
        });

    }

}


module.exports = {
    RecordsPageFunctions: RecordsPageFunctions
}
/**
 * Records页面的事件逻辑具体的操作函数
 * 每个函数都要给参数host，代表对主控页面的操作
 */
import util from '../../utils/util.js'

import Controller from '../../utils/Controller.js'
import DataType from '../../datamodel/StorageType.js'

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

    };

    /**
     * 最核心的函数
     * 1、获取每个的显示列表
     * 2、搜索、标记日期状态
     */
    setDateList(host, year, month) {
        //如果是闰年，则2月有29天
        var daysCountArr = this.daysCountArr;
        if (year % 4 == 0 && year % 100 != 0) {
            this.daysCountArr[1] = 29;
            host.setData({
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
        for (var i = 0; i < this.daysCountArr[month - 1]; i++) {
            var week = new Date(Date.UTC(year, month - 1, i + 1)).getDay();
            if (!hasDoneFirstWeek) {
                for (var blank = 0; blank < firstDayOfWeek; blank++) {
                    dateList[weekIndex].push({
                        value: '',
                        date: '',
                        week: '',
                        selected: false,
                        hasPlan: false,
                        hasTrained: false
                    });
                }
                hasDoneFirstWeek = true;
            }

            dateList[weekIndex].push({
                value: util.formatStringDate(year, month, (i + 1)),
                date: i + 1,
                week: week,
                selected: false,
                hasPlan: false,
                hasTrained: false
            });

            if (week == 6) {
                weekIndex++;
                dateList[weekIndex] = [];
            }

        }

        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++) {
                // 准备有计划的数据
                for (var planDay of host.data.dateListWithPlan) {
                    //当有记录的标记
                    if (dateList[week][day].value === planDay) {
                        // console.log(dateList[week][day].value, planDay);
                        dateList[week][day].hasPlan = true;
                    }
                }
                // 准备有锻炼的数据
                for (var trainedDay of host.data.dateListWithTraining) {
                    //当有记录的标记
                    if (dateList[week][day].value === trainedDay) {
                        // console.log(dateList[week][day].value, planDay);
                        dateList[week][day].hasTrained = true;
                    }
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

        if (isNext !== "now") {
            if (isNext === "next") {
                curYear = curMonth + 1 == 13 ? curYear + 1 : curYear;
                curMonth = curMonth + 1 == 13 ? 1 : curMonth + 1;
            } else if (isNext === "last") {
                curYear = curMonth - 1 ? curYear : curYear - 1;
                curMonth = curMonth - 1 ? curMonth - 1 : 12;
            }
            host.setData({
                curYear: curYear,
                curMonth: curMonth
            });
            this.setDateList(host, curYear, curMonth);
        } else if (isNext === "now") {
            var now = new Date();
            curYear = now.getFullYear();
            curMonth = now.getMonth() + 1;
            curDate = now.getDate();

            host.setData({
                selectedDate: util.formatDateToString(new Date()),
                curYear: curYear,
                curMonth: curMonth,
                curDate: curDate
            });

            this.setDateList(host, curYear, curMonth);
            this.selectDate(host, util.formatDateToString(new Date()));
        }

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
                var dateList = host.data.dateList;
                for (var week = 0; week < dateList.length; week++) {
                    for (var day = 0; day < dateList[week].length; day++) {
                        // console.log(this.data.dateList[week][day]);
                        if (dateList[week][day].value === e.currentTarget.dataset.date.value &&
                            dateList[week][day].value !== host.data.selectedDate) {
                            dateList[week][day].selected = !dateList[week][day].selected;
                        }
                    }
                }

                host.setData({
                    dateList: dateList
                });

                var selectList = "";
                for (var week = 0; week < dateList.length; week++) {
                    for (var day = 0; day < dateList[week].length; day++) {
                        if (dateList[week][day].selected) {
                            selectList = selectList + " ," + (dateList[week][day].value);
                        }
                    }
                }
                console.log("selectedList: ", selectList);
                break;
            case 2:
                // 拷贝到每周固定日期
                break;
            case 3:
                // 删除，只能删除将来的计划
                break;
            default:
                // 普通的选择日期
                var now = e.currentTarget.dataset.date.value.split('-');
                var curYear = parseInt(now[0]);
                var curMonth = parseInt(now[1]);
                var curDate = parseInt(now[2]);

                var curRecords = CONTROLLER.loadData(e.currentTarget.dataset.date.value, DATATYPE.DailyRecords);

                host.setData({
                    curRecords: curRecords,
                    selectedDate: e.currentTarget.dataset.date.value,
                    selectedWeek: e.currentTarget.dataset.date.week,
                    curYear: curYear,
                    curMonth: curMonth,
                    curDate: curDate
                });

                app.globalData.selectedDate = util.getDateFromString(e.currentTarget.dataset.date.value, '-');
                console.log(app.globalData.selectedDate);
        }
    };

    clearSelected(host, exitCopyMode) {
        var dateList = host.data.dateList;
        for (var week = 0; week < dateList.length; week++) {
            for (var day = 0; day < dateList[week].length; day++) {
                dateList[week][day].selected = false;

            }
        }

        // 重置主控界面的状态
        if (exitCopyMode) {
            host.setData({
                selectedModel: -1,
                showDateLongPress: false,
                dateList: dateList
            });
        } else {
            host.setData({
                selectedModel: -1,
                dateList: dateList
            });
        }

    }

}


module.exports = {
    RecordsPageFunctions: RecordsPageFunctions
}
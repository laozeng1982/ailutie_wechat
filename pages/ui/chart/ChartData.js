/**
 * 创建canvas绘图数据的工具类
 */

import Util from '../../../utils/Util'

class ChartData {
    constructor() {
    }

    /**
     * 读取目前存储的Reality数据
     * @returns {*}
     */
    loadRealitySet() {
        let realitySet = wx.getStorageSync("RealitySet");
        console.log("RealitySet is:", realitySet);
        return realitySet;
    }

    loadTodayReality() {

    }

    static makeMonthArray(day) {
        // 如果是闰年，则2月有29天
        let year = day.getYear();
        let monthDaysCountArr = [];
        if (parseInt(year) % 4 === 0 && parseInt(year) % 100 !== 0) {
            monthDaysCountArr = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        } else {
            monthDaysCountArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        }

        return monthDaysCountArr;
    }

    /**
     *
     * @param dateList
     * @param dataType
     */
    makeActualData(dateList, dataType) {
        let realitySet = this.loadRealitySet();
        if (typeof realitySet=='undefined') {
          return [];
        }
        let data = [];

        let dateListWithReality = [];
        // 先获取有效锻炼数据的日期列表
        for (let reality of realitySet) {
            if (reality.exerciseSet.length > 0) {
                dateListWithReality.push(reality.date);
            }
        }

        for (let date of dateList) {
            if (dateListWithReality.includes(date)) {
                for (let reality of realitySet) {
                    if (date === reality.date) {
                        switch (dataType) {
                            case "GROUP_COUNT":
                                let group_count = 0;
                                for (let exercise of reality.exerciseSet) {
                                    group_count = group_count + exercise.groupSet.length;
                                }
                                data.push(group_count);
                                break;
                            case "WEIGHT":
                                let weight = 0;
                                for (let exercise of reality.exerciseSet) {
                                    for (let group of exercise.groupSet) {
                                        weight = weight + group.quantityPerGroup * group.quantityPerAction;
                                    }
                                }
                                data.push(weight);
                                break;
                            case "ENERGY":
                                let energy = 0;
                                for (let exercise of reality.exerciseSet) {
                                    energy = Util.calcEnergyCost(exercise, true);
                                }
                                data.push(energy);
                                break;
                            default:
                                data.push(0);
                                break;
                        }

                        break;
                    }
                }
            } else {
                data.push(0);
            }
        }

        return data;
    }

    /**
     * 创建线性图表数据
     * @returns {{categories: Array, data: Array}}
     */
    createLineData(isWeek) {
        let today = new Date(); // 今天，日期搜索的标准
        let monthDaysCountArr = ChartData.makeMonthArray(today);
        let categories = [];    // 日期，简写：月-日，用于显示，如：10-1
        let fullDate = [];       // 日期，全写：年-月-日，方便检索，如：2017-10-1
        let data = [];          // 锻炼数据
        let length;        // 数据长度

        if (isWeek) {
            // 本周
            length = 7;
            let startDay;
            // 1.1 寻找本周第一天
            if (today.getDay() === 0) {
                startDay = today;
            } else {
                let day = today;
                for (let i = 0; i < length; i++) {
                    day = Util.getMovedDate(day, false, 1);
                    if (day.getDay() === 0) {
                        startDay = day;
                        break;
                    }
                }
            }

            // 1.2 产生日期数据
            for (let dayIdx = 0; dayIdx < length; dayIdx++) {
                let date = Util.getMovedDate(startDay, true, dayIdx);
                categories.push(Util.formatNumber(date.getMonth() + 1) + "-" + (date.getDate()));
                fullDate.push(Util.formatDateToString(date));
            }
            // 1.3 产生锻炼的实际数据
            data = this.makeActualData(fullDate, "ENERGY");
        } else {
            // 整月，逻辑简单，从1号开始，到最后一天
            // 1.1 产生日期数据
            length = monthDaysCountArr[today.getMonth()];
            for (let dayIdx = 1; dayIdx <= length; dayIdx++) {
                categories.push(Util.formatNumber(today.getMonth() + 1) + "-" + dayIdx);
                fullDate.push(Util.formatStringDate(today.getFullYear(), (today.getMonth() + 1), dayIdx));
            }
            // 1.2 产生锻炼的实际数据
            data = this.makeActualData(fullDate, "ENERGY");
        }

        return {
            categories: categories,
            fullDate: fullDate,
            max: Math.max.apply(Math, data),
            min: Math.min.apply(Math, data),
            data: data
        }
    }

    /**
     *
     * @returns
     */
    createPieData() {
        let pieData = [
            {
                name: '有氧',
                data: 0,
            }, {
                name: '胸',
                data: 0,
            }, {
                name: '肩',
                data: 0,
            }, {
                name: '臂',
                data: 0,
            }, {
                name: '背',
                data: 0,
            }, {
                name: '腰',
                data: 0,
            }, {
                name: '腹',
                data: 0,
            }, {
                name: '腿',
                data: 0,
            }
        ];

        let realitySet = this.loadRealitySet();

        // 这里还需要想想以完成的组数，重量，次数中哪一种为计算标准
        for (let dataItem of pieData) {
            for (let reality of realitySet) {
                if (reality.exerciseSet.length > 0) {
                    for (let exercise of reality.exerciseSet) {
                        if (exercise.action.target[0].includes(dataItem.name)) {
                            dataItem.data++;
                        }
                    }
                }
            }
        }

        return pieData;
    }

    /**
     *
     * @returns {[null,null]}
     */
    createRingData() {
        let ringData = [{
            name: 'finished',
            data: 0,
            color: '#7cb5ec',
            stroke: false
        }, {
            name: 'unfinished',
            data: 100,
            color: '#888888',
            stroke: false
        }];

        return ringData;
    }

    /**
     * 创建柱状图表数据
     * @returns
     */
    createColumnData() {
        let chartData = {
            main: {
                title: '总成交量',
                data: [15, 20, 45, 37],
                categories: ['2012', '2013', '2014', '2015']
            },
            sub: [{
                title: '2012年度成交量',
                data: [70, 40, 65, 100, 34, 18],
                categories: ['1', '2', '3', '4', '5', '6']
            }, {
                title: '2013年度成交量',
                data: [55, 30, 45, 36, 56, 13],
                categories: ['1', '2', '3', '4', '5', '6']
            }, {
                title: '2014年度成交量',
                data: [76, 45, 32, 74, 54, 35],
                categories: ['1', '2', '3', '4', '5', '6']
            }, {
                title: '2015年度成交量',
                data: [76, 54, 23, 12, 45, 65],
                categories: ['1', '2', '3', '4', '5', '6']
            }]
        };
        return chartData;
    }

}

module.exports = {
    ChartData: ChartData
}
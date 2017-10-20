/**
 * 生成图表的工具
 */

import wxCharts from './wxcharts-min'

class ChartMaker {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.drawType = "line";
        this.seriesName = "Unknown";
        this.scrollable = false;
        this.categories = [];

        this.windowWidth = 320;
        this.height = 220;
        try {
            let res = wx.getSystemInfoSync();
            this.windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
    }

    setDrawType(drawType) {
        this.drawType = drawType;
    }

    setSeriesName(seriesName) {
        this.seriesName = seriesName;
    }

    setCategories(categories) {
        this.categories = categories;
    }

    /**
     * 创建数据
     * @returns {{categories: Array, data: Array}}
     */
    createLineData() {
        let categories = [];
        let data = [];
        let length = this.scrollable ? 30 : 7;

        for (let i = 0; i < length; i++) {
            categories.push('09-' + (i + 1));
            data.push(Math.random() * (1000 - 100) + 100);
        }

        return {
            categories: categories,
            data: data
        }
    }

    /**
     *
     * @returns
     */
    createPieData() {
        let pieData = [{
            name: '有氧',
            data: 15,
        }, {
            name: '胸',
            data: 35,
        }, {
            name: '肩',
            data: 78,
        }, {
            name: '臂',
            data: 63,
        }, {
            name: '背',
            data: 63,
        }, {
            name: '腰',
            data: 35,
        }, {
            name: '腹',
            data: 78,
        }, {
            name: '腿',
            data: 35,
        }];

        return pieData;
    }

    /**
     *
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

    makeChart() {
        switch (this.drawType) {
            case "line":
                this.scrollable = false;
                return this.makeLineChart();
            case "scroll":
                this.scrollable = true;
                return this.makeLineChart();
            case "pie" :
                return this.makePieChart();
            case "bar" :
                return this.makeColumnChart();
            case "ring":
                return this.makeRingChart();
            default:
                return;
        }
    }

    /**
     * 生成线型图表
     * @returns {Charts}
     */
    makeLineChart() {
        let simulationData = this.createLineData();
        let lineChart = new wxCharts({
            canvasId: this.canvasId,
            type: "line",
            categories: simulationData.categories,
            animation: true,
            series: [{
                name: "消耗热量",
                data: simulationData.data,
                format: function (val, name) {
                    return val.toFixed(0) + 'kCal';
                }
            }],
            xAxis: {
                disableGrid: true
            },
            yAxis: {
                title: '消耗热量 (kCal)',
                format: function (val) {
                    return val.toFixed(0);
                },
                min: 100,
                max: 1000
            },
            width: this.windowWidth,
            height: this.height,
            dataLabel: true,
            dataPointShape: true,
            enableScroll: this.scrollable,
            extra: {
                lineStyle: 'curve'
            }
        });

        return lineChart;
    }

    /**
     *
     * @returns {Charts}
     */
    makeColumnChart() {
        let chartData = this.createColumnData();
        let columnChart = new wxCharts({
            canvasId: this.canvasId,
            type: 'column',
            animation: true,
            categories: chartData.main.categories,
            series: [{
                name: '成交量',
                data: chartData.main.data,
                format: function (val, name) {
                    return val.toFixed(2) + '万';
                }
            }],
            yAxis: {
                format: function (val) {
                    return val + '万';
                },
                title: 'hello',
                min: 0
            },
            xAxis: {
                disableGrid: false,
                type: 'calibration'
            },
            extra: {
                column: {
                    width: 15
                }
            },
            width: this.windowWidth,
            height: this.height,
        });

        return columnChart;
    }

    makePieChart() {
        let pieData = this.createPieData();
        let pieChart = new wxCharts({
            animation: true,
            canvasId: this.canvasId,
            type: 'pie',
            series: pieData,
            width: this.windowWidth,
            height: this.height,
            dataLabel: true,
        });
    }

    makeRingChart() {
        let ringChart = new wxCharts({
            animation: false,
            canvasId: this.canvasId,
            type: 'ring',
            extra: {
                ringWidth: 18,
                pie: {
                    offsetAngle: -45
                }
            },
            title: {
                name: '0'+'%',
                color: '#7cb5ec',
                fontSize: 22
            },
            subtitle: {
                name: '完成',
                color: '#666666',
                fontSize: 15
            },
            series: [{
                name: 'finished',
                data: 0,
                color: '#7cb5ec',
                stroke: false
            }, {
                name: 'unfinished',
                data: 100,
                color: '#888888',
                stroke: false
            }],
            disablePieStroke: true,
            width: 150,
            height: 150,
            dataLabel: false,
            legend: false,
            background: '#f5f5f5',
            padding: 0
        });

        return ringChart;
    }
}

module.exports = {
    ChartMaker: ChartMaker
}
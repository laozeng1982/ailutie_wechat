/**
 * 生成图表的工具
 */

import wxCharts from './wxcharts'

class ChartMaker {
    constructor(canvasId) {
        this.canvasId = canvasId;

        this.windowWidth = 320;
        this.height = 220;
        try {
            let res = wx.getSystemInfoSync();
            this.windowWidth = res.windowWidth;
        } catch (e) {
            console.error('getSystemInfoSync failed!');
        }
    }

    /**
     * 生成线型图表
     * @returns {Charts}
     */
    makeLineChart(chartData) {
        let scrollable = chartData.categories.length > 7;
        let lineChart = new wxCharts({
            canvasId: this.canvasId,
            type: "line",
            categories: chartData.categories,
            animation: true,
            series: [{
                name: "消耗热量",
                data: chartData.data,
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
                min: chartData.min,
                max: chartData.max
            },
            width: this.windowWidth,
            height: this.height,
            dataLabel: true,
            dataPointShape: true,
            enableScroll: scrollable,
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
    makeColumnChart(chartData) {
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

    makePieChart(chartData) {
        let pieChart = new wxCharts({
            animation: true,
            canvasId: this.canvasId,
            type: 'pie',
            series: chartData,
            width: this.windowWidth,
            height: this.height,
            dataLabel: true,
        });

        return pieChart;
    }

    makeRingChart(chartData) {
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
                name: '0' + '%',
                color: '#7cb5ec',
                fontSize: 22
            },
            subtitle: {
                name: '完成',
                color: '#666666',
                fontSize: 15
            },
            series: chartData,
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
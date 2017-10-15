/**
 * 锻炼计划记录页面
 */
import util from '../../utils/Util.js'
import DataType from '../../datamodel/StorageType.js'

//获取应用实例
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedDate: '',
        showDate: '',
        todayPlan: [],
        curMovementName: '',
        // 当前选中的动作，初始选中第一个
        currentActionId: 0,
        currentPartId: 0,
        // 当前锻炼的组数，初始为第一个
        curSelectedRecordId: 0,

        // 控件关联值，输入框里的次数和重量
        actualCount: '',
        actualWeight: '',
        actualGpFeeling: '',
        actualMvFeeling: 3, // 默认给5分，免得用户忘了选

        totalScoreStarArray: [
            {id: 1, src: "../image/start_checked.png", checked: true},
            {id: 2, src: "../image/start_unchecked.png", checked: false},
            {id: 3, src: "../image/start_unchecked.png", checked: false},
            {id: 4, src: "../image/start_unchecked.png", checked: false},
            {id: 5, src: "../image/start_unchecked.png", checked: false},
        ],

        playSwitch: false,

        countSelector: [],
        weightSelector: [],

        // 3D 数组，用来存放动作次数、重量和评分
        groupScoreMultiArray: '',
        // 数量选择索引
        groupScoreIndex: [7, 4, 3],

        actionTips: '',

        Controller: '',
        scrollY: true,
        planScrollHeight: 300,  //计划的scroll高度
        trainScrollHeight: 600,  //动作列表的scroll高度
        showDetails: false,

        disableRemoveBtn: true,
        disableModifyBtn: true,
    },

    onShowDetails: function (e) {
        this.setData({
            showDetails: !this.data.showDetails
        });
        console.log(this.data.showDetails);
    },

    onControl: function (e) {
        let playSwitch = !this.data.playSwitch;
        this.setData({
            playSwitch: playSwitch
        });
    },

    /**
     * 响应用户点击动作评分
     * @param e，点击事件，携带id，即为分数
     */
    onActionScore: function (e) {
        console.log(e.currentTarget.id);
        // 实际分数
        let index = parseInt(e.currentTarget.id);
        let totalStars = this.data.totalScoreStarArray;

        // 清零，否则不能由大分数改为小分数
        for (let idx = 0; idx < 5; idx++) {
            totalStars[idx].src = "../image/start_unchecked.png";
            totalStars[idx].checked = false;
        }

        this.setData({
            totalScoreStarArray: totalStars
        });

        // 点选
        for (let idx = 0; idx < index; idx++) {
            totalStars[idx].src = "../image/start_checked.png";
            totalStars[idx].checked = true;
        }

        console.log("in onActionScore,e", e);
        let todayPlan = this.data.todayPlan;
        // todayPlan.movementList[this.data.currentActionId - 1].contents.mvFeeling = index;

        this.setData({
            todayPlan: todayPlan,
            actualMvFeeling: index,
            totalScoreStarArray: totalStars
        });
    },

    /**
     * 将动作评分的初始值设为计划的值，方便用户选取
     */
    setPickerIndex: function () {
        if (this.data.todayPlan.movementList.length === 0) {
            console.log("in setPickerIndex, today has no currentPlan");
            return;
        }

        let selectedMovement = this.data.todayPlan.movementList[this.data.currentActionId - 1];
        // 获取当前计划的计划数据
        let planCount = selectedMovement.contents.details[0].planCount;
        let planWeight = selectedMovement.contents.details[0].planWeight;

        let groupScoreIndex = [
            this.getArrayIndex(planCount, this.data.groupScoreMultiArray[0]),
            this.getArrayIndex(planWeight, this.data.groupScoreMultiArray[1]),
            2
        ];
        // console.log("in setPickerIndex, ", planCount, planWeight);
        // 重置索引
        this.setData({
            actualCount: planCount,
            actualWeight: planWeight,
            actualGpFeeling: 3,
            groupScoreIndex: groupScoreIndex
        })
    },

    /**
     *
     * @param element
     * @param array，单调递增的数组
     * @returns {number}
     */
    getArrayIndex: function (element, array) {
        let indexOfElement = -1;
        if (element <= array[0]) {
            indexOfElement = 0;
        } else if (element >= array[array.length - 1]) {
            indexOfElement = array.length - 1;
        } else {
            for (let idx = 1; idx < array.length - 1; idx++) {
                if (element >= array[idx] && element <= array[idx + 1])
                    indexOfElement = idx;
            }
        }

        return indexOfElement;
    },

    /**
     * 根据选择的星数，获取动作感觉评分
     * @returns {number}
     */
    getMvFeeling: function () {
        let feeling = 0;
        for (let item of this.data.totalScoreStarArray) {
            if (item.checked)
                feeling++;
        }
        return feeling;
    },

    /**
     * 没有计划的情况下，跳转去制定计划
     */
    onMakePlan: function () {
        app.makingNewPlan = true;
        wx.navigateTo({
            url: '../plan/select_goal/select_goal',
        })
    },

    /**
     * 跳转到上一个动作
     */
    onLastAction: function () {
        let currentPartId = this.data.currentPartId;
        let currentActionId;
        // let currentActionId = this.data.currentActionId - 1 < 0 ? 0 : this.data.currentActionId - 1;

        if (this.data.currentActionId - 1 < 0) {
            currentPartId = currentPartId - 1 < 0 ? 0 : currentPartId - 1;
            currentActionId = currentPartId === 0 ? 0 : this.data.todayPlan[currentPartId].data.length - 1;
        } else {
            currentActionId = this.data.currentActionId - 1;
        }

        console.log("currentPartId:", currentPartId, "currentActionId:", currentActionId);

        this.setData({
            currentPartId: currentPartId,
            currentActionId: currentActionId
        });
    },

    /**
     * 跳转到上一个动作
     */
    onNextAction: function () {
        let currentPartId = this.data.currentPartId;
        let currentActionId;
        // = this.data.currentActionId + 1 >= this.data.todayPlan[currentPartId].data.length
        // ? this.data.todayPlan[currentPartId].data.length - 1 : this.data.currentActionId + 1;

        if (this.data.currentActionId + 1 >= this.data.todayPlan[currentPartId].data.length) {
            currentPartId = currentPartId + 1 >= this.data.todayPlan.length
                ? this.data.todayPlan.length - 1 : currentPartId + 1;
            currentActionId = 0;

        } else {
            currentActionId = this.data.currentActionId + 1;
        }

        console.log("currentPartId:", currentPartId, "currentActionId:", currentActionId);

        this.setData({
            currentPartId: currentPartId,
            currentActionId: currentActionId
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化

        let countSelector = [];
        let weightSelector = [];
        let groupScoreSelector = [];
        for (let idx = 1; idx <= 150; idx++) {
            countSelector.push(idx);
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightSelector.push(idx);
        }

        for (let idx = 1; idx <= 5; idx++) {
            groupScoreSelector.push(idx);

        }

        let groupScoreMultiArray = [countSelector, weightSelector, groupScoreSelector];

        this.setData({
            selectedDate: util.formatDateToString(new Date()),
            countSelector: countSelector,
            weightSelector: weightSelector,
            groupScoreMultiArray: groupScoreMultiArray,
            Controller: app.Controller,

        });

        console.log("Training page onLoad call, this.data.selectedDate: ", this.data.selectedDate);

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     * 页面Load以后，动态加载和初始化信息
     */
    onShow: function () {
        let today = new Date();
        let showDate = today.getMonth() + 1 + "月" + util.formatNumber(today.getDate()) + "日";

        let todayPlan = [];
        let todayHasPlan = false;
        let hasActivePlan = false;
        let actionTips;
        // 先读取，如果不存在，则新建一个

        app.currentPlan.cloneDataFrom(app.Controller.loadPlan());
        console.log("in Training, app.currentPlan:", app.currentPlan);
        let currentPlan = app.currentPlan;

        if (currentPlan.currentUse) {
            hasActivePlan = true;
            // 先判断这天是否在周期内，然后判断这天动作的重复次数里，有没有这个周期
            if (app.Util.inPeriod(currentPlan.fromDate, app.Util.formatDateToString(today), currentPlan.toDate)) {
                todayPlan = app.currentPlan.getReGroupExerciseSetByDay(today.getDay());
                if (app.currentPlan.cycleLength === 7) {
                    if (todayPlan.length > 0) {
                        todayHasPlan = true;
                    } else {
                        todayHasPlan = false;
                        actionTips = "今天休息";
                    }
                } else {

                }
            } else {
                todayHasPlan = false;
                actionTips = "今天休息";
            }
        } else {
            hasActivePlan = false;
            actionTips = "还未创建计划";
        }

        console.log("hasActivePlan:", hasActivePlan);
        console.log("todayHasPlan:", todayHasPlan);
        console.log("actionTips: ", actionTips);

        this.setData({
            showDate: showDate,
            todayPlan: todayPlan,
            todayHasPlan: todayHasPlan,
            actionTips: actionTips,
            hasActivePlan: hasActivePlan,
        });


        // 重置全局变量，保证翻回Training页面时，能记住上次的位置
        console.log("Training page onShow call, this.data.todayPlan: ", this.data.todayPlan);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        app.Controller.saveData(app.StorageType.RealitySet, this.data.todayPlan);
        // 如果直接由此界面通过Tab跳到了计划界面，那么将选中的动作置为当前动作，方便修改。
        app.globalData.selectedDate = new Date();

        console.log("Training page onHide call: data saved");
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
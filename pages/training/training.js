/**
 * 锻炼计划记录页面
 */

import DataType from '../../datamodel/StorageType'
import Reality from '../../datamodel/RealitySet'
import Timer from '../../utils/Timer'

//获取应用实例
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedDate: '',
        showDate: '',
        todayPlan: [],  // 今天的计划
        todayReality: new Reality.Reality(),    // 今天完成的内容

        // 当前选中的部位和动作索引，初始选中第一个
        currentPartId: 0,
        currentActionId: 0,
        currentGroupId: 0,

        // 控件关联值，输入框里的次数和重量
        actualCount: '',
        actualWeight: '',
        actualGpFeeling: '',
        actualMvFeeling: 3, // 默认给5分，免得用户忘了选

        // 只给每个动作最后做完以后打分
        actionScoreStarArray: [
            {id: 1, src: "../image/start_checked.png", checked: true},
            {id: 2, src: "../image/start_unchecked.png", checked: false},
            {id: 3, src: "../image/start_unchecked.png", checked: false},
            {id: 4, src: "../image/start_unchecked.png", checked: false},
            {id: 5, src: "../image/start_unchecked.png", checked: false},
        ],

        enablePause: true,
        firstAction: true,
        lastAction: false,
        lastGroup: false,

        partArray: [],   // 今天计划的部位列表，一维数组
        actionArray: [], // 今天计划的动作列表，二维数组，序号与partArray对应
        partActionArray: [], // 动作选择Picker的数据池，二维数组，第一列始终是partArray，第二列是actionArray中的一个元素
        multiIndex: [0, 0], // 动作选择Picker的索引

        countSelector: [],
        weightSelector: [],

        // 3D 数组，用来存放动作次数、重量和评分
        realityDataArray: [],
        // 数量选择索引
        realityIndex: [7, 15],

        actionTips: '',

        showDetails: false,

    },

    onShowDetails: function (e) {
        this.setData({
            showDetails: !this.data.showDetails
        });
    },

    /**
     * 响应动作选择的变化
     * @param e
     */
    onActionChange: function (e) {
        let currentPartId = e.detail.value[0];
        let currentActionId = e.detail.value[1];
        this.setData({
            multiIndex: e.detail.value,
            currentPartId: currentPartId,
            currentActionId: currentActionId
        });
    },

    /**
     * 响应部位列改变，动作列跟着改变
     * @param e
     */
    onPartChange: function (e) {
        console.log('修改的列为', e.detail.column, '，值为', e.detail.value);

        let partActionArray = this.data.partActionArray;
        let multiIndex = this.data.multiIndex;

        multiIndex[e.detail.column] = e.detail.value;

        if (e.detail.column === 0)
            partActionArray[1] = this.data.actionArray[e.detail.value];

        // console.log(partActionArray);
        this.setData({
            partActionArray: partActionArray,
            multiIndex: multiIndex
        });
    },

    /**
     *
     * @param e
     */
    onRealityChange: function (e) {
        console.log('picker发送选择改变，携带值为', e.detail.value);
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        todayPlan[currentPartId].exerciseSet[currentActionId].groupSet[currentGroupId].executedQuantity =
            parseInt(this.data.realityDataArray[0][e.detail.value[0]]);
        todayPlan[currentPartId].exerciseSet[currentActionId].groupSet[currentGroupId].executedWeight =
            parseInt(this.data.realityDataArray[1][e.detail.value[1]]);

        this.setData({
            todayPlan
        });

    },

    onFinishAction: function (e) {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;
        todayPlan[currentPartId].exerciseSet[currentActionId].groupSet[currentGroupId].finished = true;
        todayPlan[currentPartId].exerciseSet[currentActionId].current++;
        todayPlan[currentPartId].exerciseSet[currentActionId].finishedCount++;
        todayPlan[currentPartId].exerciseSet[currentActionId].finished =
            todayPlan[currentPartId].exerciseSet[currentActionId].finishedCount >= todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length;



        this.setData({
            todayPlan: todayPlan,
            firstAction: currentActionId === 0 && currentPartId === 0,
            lastAction: currentPartId === this.data.todayPlan.length - 1 && currentActionId === this.data.todayPlan[currentPartId].exerciseSet.l
        });

        console.log("Training page onShow call, this.data.todayPlan: ", this.data.todayPlan);

        Timer.setCountDownSeconds(10);
        this.timer = new Timer.Timer(this);
        this.timer.start();
    },

    onControl: function (e) {
        let enablePause = this.data.enablePause;
        if (enablePause)
            this.timer.stop();
        else
            this.timer.start();

        this.setData({
            enablePause: !enablePause
        });
    },

    onLastGroup() {
        this.lastGroup();
    },

    /**
     * 跳到下一组
     * 两个入口，一个是倒计时结束，自动跳转到这里，一个是用户手动操作略过休息时间
     */
    lastGroup: function () {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        this.setData({
            currentGroupId: currentGroupId,
            currentActionId: currentActionId,
            currentPartId: currentPartId
        });
    },

    onNextGroup: function () {
        this.timer.stop();
        this.nextGroup();
    },

    /**
     * 跳到下一组
     * 两个入口，一个是倒计时结束，自动跳转到这里，一个是用户手动操作略过休息时间
     */
    nextGroup: function () {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        if (currentGroupId + 1 < todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length) {
            currentGroupId++;
        } else {
            if (currentActionId + 1 < todayPlan[currentPartId].exerciseSet.length) {
                currentGroupId = 0;
                currentActionId++;
            } else {
                if (currentPartId + 1 < todayPlan.length) {
                    currentGroupId = 0;
                    currentActionId = 0;
                    currentPartId++;
                } else {
                    // 这已经到最后了
                    this.setData({
                        lastGroup: true
                    });
                    console.log("It's the last action~~");
                }
            }
        }

        console.log("currentGroupId", currentGroupId, "currentActionId", currentActionId, "currentPartId", currentPartId);

        this.setData({
            currentGroupId: currentGroupId,
            currentActionId: currentActionId,
            currentPartId: currentPartId,
            enablePause: true,  //无论是哪里跳转来的，都要把暂停复位

        });
    },

    /**
     * 响应用户点击动作评分
     * @param e，点击事件，携带id，即为分数
     */
    onActionScore: function (e) {
        // 实际分数
        let index = parseInt(e.currentTarget.id);
        let actionStars = this.data.actionScoreStarArray;

        // 清零，否则不能由大分数改为小分数
        for (let idx = 0; idx < 5; idx++) {
            actionStars[idx].src = "../image/start_unchecked.png";
            actionStars[idx].checked = false;
        }

        this.setData({
            totalScoreStarArray: actionStars
        });

        // 点选
        for (let idx = 0; idx < index; idx++) {
            actionStars[idx].src = "../image/start_checked.png";
            actionStars[idx].checked = true;
        }

        console.log("in onActionScore, score is: ", e.currentTarget.id);
        let todayPlan = this.data.todayPlan;

        this.setData({
            todayPlan: todayPlan,
            actualMvFeeling: index,
            actionScoreStarArray: actionStars
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

        let RealityIndex = [
            this.getArrayIndex(planCount, this.data.realityDataArray[0]),
            this.getArrayIndex(planWeight, this.data.realityDataArray[1]),
            2
        ];
        // console.log("in setPickerIndex, ", planCount, planWeight);
        // 重置索引
        this.setData({
            actualCount: planCount,
            actualWeight: planWeight,
            actualGpFeeling: 3,
            RealityIndex: RealityIndex
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
        for (let item of this.data.actionScoreStarArray) {
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

        if (this.data.currentActionId - 1 < 0) {
            currentPartId = currentPartId - 1 < 0 ? 0 : currentPartId - 1;
            currentActionId = currentPartId === 0 ? 0 : this.data.todayPlan[currentPartId].exerciseSet.length - 1;
        } else {
            currentActionId = this.data.currentActionId - 1;
        }

        // console.log("currentPartId:", currentPartId, "currentActionId:", currentActionId);

        this.setData({
            currentPartId: currentPartId,
            currentActionId: currentActionId,
            multiIndex: [currentPartId, currentActionId],
            firstAction: currentActionId === 0 && currentPartId === 0,
            lastAction: currentPartId === this.data.todayPlan.length - 1 && currentActionId === this.data.todayPlan[currentPartId].exerciseSet.length - 1
        });
    },

    /**
     * 跳转到上一个动作
     */
    onNextAction: function () {
        let currentPartId = this.data.currentPartId;
        let currentActionId;

        if (this.data.currentActionId + 1 >= this.data.todayPlan[currentPartId].exerciseSet.length) {
            currentPartId = currentPartId + 1 >= this.data.todayPlan.length
                ? this.data.todayPlan.length - 1 : currentPartId + 1;
            currentActionId = 0;

        } else {
            currentActionId = this.data.currentActionId + 1;
        }

        // console.log("currentPartId:", currentPartId, "currentActionId:", currentActionId);

        this.setData({
            currentPartId: currentPartId,
            currentActionId: currentActionId,
            multiIndex: [currentPartId, currentActionId],
            firstAction: currentActionId === 0 && currentPartId === 0,
            lastAction: currentPartId === this.data.todayPlan.length - 1 && currentActionId === this.data.todayPlan[currentPartId].exerciseSet.length - 1
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化

        let countSelector = [];
        let weightSelector = [];
        for (let idx = 1; idx <= 150; idx++) {
            countSelector.push(idx + "次");
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightSelector.push(idx + "Kg");
        }

        let realityDataArray = [countSelector, weightSelector];

        this.setData({
            selectedDate: app.Util.formatDateToString(new Date()),
            countSelector: countSelector,
            weightSelector: weightSelector,
            realityDataArray: realityDataArray,
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
        let showDate = today.getMonth() + 1 + "月" + app.Util.formatNumber(today.getDate()) + "日";

        let todayPlan = [];
        let todayHasPlan = false;
        let hasActivePlan = false;
        let actionTips;
        // 先读取，如果不存在，则新建一个

        app.currentPlan.cloneDataFrom(app.Controller.loadPlan());
        console.log("in Training, app.currentPlan:", app.currentPlan);
        let currentPlan = app.currentPlan;
        let partArray = [];
        let actionArray = [];
        let partActionArray = [];

        if (currentPlan.currentUse) {
            hasActivePlan = true;
            // 先判断这天是否在周期内，然后判断这天动作的重复次数里，有没有这个周期
            if (app.Util.inPeriod(currentPlan.fromDate, app.Util.formatDateToString(today), currentPlan.toDate)) {
                todayPlan = app.currentPlan.getReGroupExerciseSetByDay(today.getDay());
                if (app.currentPlan.cycleLength === 7) {
                    // 今天有计划
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

        // 准备部位列表
        if (todayPlan.length > 0) {
            for (let plan of todayPlan) {
                partArray.push(plan.name);
                let array = [];
                for (let item of plan.exerciseSet) {
                    array.push(item.action.name);
                }
                actionArray.push(array);
            }

            partActionArray.push(partArray);
            partActionArray.push(actionArray[0]);

            console.log("partArray:", partArray);
            console.log("actionArray:", actionArray);
            console.log("actionArray:", partActionArray);
        }

        // 准备执行数据
        if (todayPlan.length > 0) {
            for (let plan of todayPlan) {
                for (let item of plan.exerciseSet) {
                    for (let group of item.groupSet) {
                        group.executedQuantity = group.quantity;
                        group.executedWeight = group.weight;
                        group.finished = false;
                    }
                    item.current = 1;
                    item.finishedCount = 0;
                    for (let group of item.groupSet) {
                        if (group.finished)
                            item.finishedCount++;
                    }
                    item.finished = item.groupSet.length === item.finishedCount;
                }
            }
        }


        console.log("hasActivePlan:", hasActivePlan);
        console.log("todayHasPlan:", todayHasPlan);
        console.log("actionTips: ", actionTips);

        this.setData({
            showDate: showDate,
            todayPlan: todayPlan,
            todayHasPlan: todayHasPlan,
            partArray: partArray,
            actionArray: actionArray,
            partActionArray: partActionArray,
            actionTips: actionTips,
            hasActivePlan: hasActivePlan,
            lastGroup: false
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
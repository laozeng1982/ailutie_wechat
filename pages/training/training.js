/**
 * 锻炼计划记录页面
 */

import DataType from '../../datamodel/StorageType'
import Reality from '../../datamodel/RealitySet'
import Timer from '../../utils/Timer'
import ChartMaker from '../ui/canvas/ChartMaker'

//获取应用实例
const app = getApp();
const chartMaker = new ChartMaker.ChartMaker('trainingCanvas');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showDate: '',
        todayPlan: [],  // 今天的计划
        todayReality: new Reality.Reality(),    // 今天完成的内容
        // todayHasPlan: false,

        currentChart: {},
        // 当前选中的部位和动作索引，初始选中第一个
        currentPartId: 0,
        currentActionId: 0,
        currentGroupId: 0,
        totalFinishedGroups: 0, // 小程序诡异，通过todayPlan.totalFinishedGroups不能控制控件，不得已，多加这个变量

        // 控件关联值，输入框里的次数和重量
        actualCount: '',
        actualWeight: '',
        actualMvFeeling: 3, // 默认给3分，免得用户忘了选

        // 只给每个动作最后做完以后打分
        actionScoreStarArray: [
            {id: 1, checked: true},
            {id: 2, checked: false},
            {id: 3, checked: false},
            {id: 4, checked: false},
            {id: 5, checked: false},
        ],

        enablePause: true,
        firstAction: true,
        lastAction: false,
        paused: false,

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
     * 响应实际完成数据的改变
     * 默认就是计划数据
     * @param e
     */
    onChangeRealityData: function (e) {
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

    /**
     * 响应健身进行中，点击完成按钮，记录相应的数据
     * 组数、动作和部位的跳转分两种情况
     * 1、倒计时完成，自动跳转
     * 2、用户手动跳转
     * @param e
     */
    onFinishAction: function (e) {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;
        todayPlan[currentPartId].exerciseSet[currentActionId].groupSet[currentGroupId].finished = true;

        if (todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId + 1 >= todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length)
            todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId = todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length - 1;
        else
            todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId++;

        todayPlan[currentPartId].exerciseSet[currentActionId].finishedCount++;
        todayPlan[currentPartId].exerciseSet[currentActionId].finished =
            todayPlan[currentPartId].exerciseSet[currentActionId].finishedCount >= todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length;

        todayPlan.totalFinishedGroups++;

        this.setData({
            todayPlan: todayPlan,
            totalFinishedGroups: todayPlan.totalFinishedGroups,
            paused: true
        });


        // 更新完成比例视图
        this.updateFinishedChart();

        // 启动倒计时
        Timer.setCountDownSeconds(30);
        this.timer = new Timer.Timer(this);
        this.timer.start();

    },

    /**
     * 根据完成情况，计算完成比例
     * 计算方法，计算出已经完成的组数，除以总的组数
     * 两种入口：
     * 1、健身过程中，点击完成，更新完成比例
     * 2、初始化健身记录页面时，根据当天已经记录的数据（如果有），更新比例
     *
     */
    updateFinishedChart: function () {
        let percentFinished = 0;
        let todayPlan = this.data.todayPlan;
        let totalGroups = todayPlan.totalGroups;
        let totalFinishedGroups = todayPlan.totalFinishedGroups;

        if (totalGroups !== 0 && totalFinishedGroups <= totalGroups)
            percentFinished = Math.ceil(totalFinishedGroups * 100 / totalGroups);

        console.log("finishedGroup:", totalFinishedGroups, ", totalGroups:", totalGroups, ", percent:", percentFinished, "%");

        this.data.currentChart.updateData({
            title: {
                name: percentFinished + "%"
            },
            series: [{
                name: 'finished',
                data: percentFinished,
                color: '#7cb5ec',
                stroke: false
            }, {
                name: 'unfinished',
                data: 100 - percentFinished,
                color: '#888888',
                stroke: false
            }],
        });
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

    /**
     * 向前跳转组，仅用于浏览，不做任何数据操作
     */
    onLastGroup() {
        this.lastGroup();
    },

    /**
     * 跳到上一组
     *
     */
    lastGroup: function () {
        this.changeGroup(false);
    },

    /**
     * 向后跳转组，用于用户取消休息时间
     * 1、取消倒计时
     * 2、跳转组，
     */
    onNextGroup: function () {
        console.log(typeof this.timer);
        if (typeof this.timer !== "undefined")
            this.timer.stop();
        this.nextGroup();
    },

    /**
     * 跳到下一组
     * 两个入口，一个是倒计时结束，自动跳转到这里，一个是用户手动操作略过休息时间
     */
    nextGroup: function () {
        this.changeGroup(true);
    },

    /**
     * 更新动作得分的视图
     * @param score
     */
    updateActionScore: function (score) {
        let actionScoreStarArray = this.data.actionScoreStarArray;

        // 清零，否则不能由大分数改为小分数
        for (let idx = 0; idx < 5; idx++) {
            actionScoreStarArray[idx].checked = false;
        }

        // 点选
        for (let idx = 0; idx < score; idx++) {
            actionScoreStarArray[idx].checked = true;
        }

        this.setData({
            actionScoreStarArray: actionScoreStarArray
        });
    },

    /**
     * 响应用户点击动作评分
     * @param e，点击事件，携带id，即为分数
     */
    onActionScore: function (e) {
        // 实际分数
        let score = parseInt(e.currentTarget.id);
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;

        console.log("in onActionScore, score is: ", e.currentTarget.id);

        todayPlan[currentPartId].exerciseSet[currentActionId].actionScore = score;

        this.setData({
            todayPlan: todayPlan,
        });

        // 更新视图
        this.updateActionScore(score);
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
     * 根据选中动作的状态，将组的状态更改到实际的状态，只需要设置currentGroupId
     * 这里有两种入口
     */
    changeGroup: function (isNext) {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        if (isNext) {
            // 向后翻
            if (currentGroupId + 1 < todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length) {
                currentGroupId++;
            } else {
                if (currentActionId + 1 < todayPlan[currentPartId].exerciseSet.length) {
                    currentActionId++;
                    currentGroupId = 0;
                } else {
                    if (currentPartId + 1 < todayPlan.length) {
                        currentPartId++;
                        currentActionId = 0;
                        currentGroupId = 0;
                    } else {
                        // 这已经到最后了
                        this.setData({
                            paused: false
                        });
                        console.log("It's the last action~~");
                    }
                }
            }
        } else {
            // 向前翻
            if (currentGroupId - 1 >= 0) {
                currentGroupId--;
            } else {
                if (currentActionId - 1 >= 0) {
                    currentActionId--;
                    currentGroupId = todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length - 1;
                } else {
                    if (currentPartId - 1 >= 0) {
                        currentPartId--;
                        currentActionId = todayPlan[currentPartId].exerciseSet.length - 1;
                        currentGroupId = todayPlan[currentPartId].exerciseSet[currentActionId].groupSet.length - 1;
                    } else {
                        // 这已经到最前面了
                        this.setData({
                            paused: false
                        });
                        console.log("It's the first action~~");
                    }
                }
            }
        }

        this.changeAction(currentPartId, currentActionId, currentGroupId);

    },

    /**
     * 动作跳转具体处理函数
     * 1、先根据索引跳转动作
     * 2、设置Picker状态
     * 3、设置动作导航imageButton的状态
     * 4、设置当前组，跳转当前动作对应的组
     * @param currentPartId
     * @param currentActionId
     * @param currentGroupId
     */
    changeAction: function (currentPartId, currentActionId, currentGroupId) {
        let todayPlan = this.data.todayPlan;
        let partActionArray = this.data.partActionArray;

        partActionArray[1] = this.data.actionArray[currentPartId];

        if (todayPlan[currentPartId].exerciseSet[currentActionId].finished) {
            console.log("score:", todayPlan[currentPartId].exerciseSet[currentActionId].actionScore);
            this.updateActionScore(todayPlan[currentPartId].exerciseSet[currentActionId].actionScore);
        }

        todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId = currentGroupId;

        this.setData({
            currentPartId: currentPartId,
            currentActionId: currentActionId,
            currentGroupId: currentGroupId,
            partActionArray: partActionArray,
            multiIndex: [currentPartId, currentActionId],
            firstAction: currentActionId === 0 && currentPartId === 0,
            lastAction: currentPartId === todayPlan.length - 1 && currentActionId === todayPlan[currentPartId].exerciseSet.length - 1,
            enablePause: true,  //无论是哪里跳转来的，都要把暂停复位
            paused: false
        });

        console.log("currentGroupId", currentGroupId, "currentActionId", currentActionId, "currentPartId", currentPartId);
        console.log("Training page onShow call, this.data.todayPlan: ", this.data.todayPlan);
    },

    /**
     * 响应部位列改变，动作列跟着改变
     * @param e
     */
    onPartPickerChange: function (e) {

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
     * 响应动作选择的变化
     * 1、先处理所要跳转到的部位和动作索引
     * 2、调用跳转方法changeAction
     * @param e
     */
    onActionPickerChange: function (e) {
        let todayPlan = this.data.todayPlan;
        let currentPartId = e.detail.value[0];
        let currentActionId = e.detail.value[1];
        let currentGroupId = todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId;
        this.changeAction(currentPartId, currentActionId, currentGroupId);
    },

    /**
     * 跳转动作
     * 1、判断跳转方向
     * 2、处理所要跳转到的部位和动作索引
     * 3、调用跳转方法changeAction
     */
    onActionChange: function (e) {
        let todayPlan = this.data.todayPlan;
        let currentPartId = this.data.currentPartId;
        let currentActionId = this.data.currentActionId;


        if (e.currentTarget.id === "next") {
            // 向后跳转，如果越界，需要判断部位的状态，否则直接变
            if (currentActionId + 1 >= todayPlan[currentPartId].exerciseSet.length) {
                if (currentPartId + 1 >= todayPlan.length) {
                    currentPartId = todayPlan.length - 1;
                } else {
                    currentPartId++;
                    currentActionId = 0;
                }
            } else {
                currentActionId = currentActionId + 1;
            }
        } else {
            // 向前跳转，如果越界，需要判断部位的状态，否则直接变
            if (currentActionId - 1 < 0) {
                if (currentPartId - 1 < 0) {
                    currentPartId = 0;
                    currentActionId = 0;
                } else {
                    currentPartId--;
                    currentActionId = todayPlan[currentPartId].exerciseSet.length - 1;
                }
            } else {
                currentActionId = currentActionId - 1;
            }
        }
        // 将切换后的动作currentGroupId传过来
        let currentGroupId = todayPlan[currentPartId].exerciseSet[currentActionId].currentGroupId;

        this.changeAction(currentPartId, currentActionId, currentGroupId);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        //初始化
        let today = new Date();
        let showDate = today.getMonth() + 1 + "月" + app.Util.formatNumber(today.getDate()) + "日";

        let countSelector = [];
        let weightSelector = [];
        for (let idx = 1; idx <= 150; idx++) {
            countSelector.push(idx + "次");
        }

        for (let idx = 1; idx <= 200; idx++) {
            weightSelector.push(idx + "Kg");
        }

        let realityDataArray = [countSelector, weightSelector];

        chartMaker.setDrawType("ring");
        let currentChart = chartMaker.makeChart();

        this.setData({
            showDate: showDate,
            countSelector: countSelector,
            weightSelector: weightSelector,
            realityDataArray: realityDataArray,
            currentChart: currentChart
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 将Plan数据转成Reality数据，方便存储和传输
     * 需要处理一些事物，如果计划有变，之前保存的数据需要去更新，需要判断todayPlan中完成的数据与现有的冲突关系
     */
    planToRealityData: function () {
        let todayReality = this.data.todayReality;
        todayReality.date = app.Util.formatDateToString(new Date());

        this.setData({
            todayReality: todayReality
        });
    },

    /**
     * 根据计划和已经保存的todayPlan数据来初始化当前的todayPlan
     */
    initTodayPlan: function () {
        let today = new Date();
        let todayPlan = [];
        let todayHasPlan = false;
        let hasActivePlan = false;
        let currentPlan = app.currentPlan;
        let partArray = [];
        let actionArray = [];
        let partActionArray = [];
        let actionTips;

        // 先读取计划，如果不存在，则新建一个
        app.currentPlan.cloneDataFrom(app.Controller.loadPlan());
        console.log("in Training, app.currentPlan:", app.currentPlan);

        // 先读取计划，如果有，则创建todayPlan，然后去初始化
        // 初始化放在另外的代码中，免得这步结构太复杂
        if (currentPlan.currentUse) {
            hasActivePlan = true;
            // 先判断这天是否在周期内，然后判断这天动作的重复次数里，有没有这个周期
            if (app.Util.inPeriod(currentPlan.fromDate, app.Util.formatDateToString(today), currentPlan.toDate)) {
                todayPlan = app.currentPlan.getReGroupExerciseSetByDay(today.getDay());
                // 今天有计划
                if (todayPlan.length > 0) {
                    todayHasPlan = true;
                } else {
                    todayHasPlan = false;
                    actionTips = "今天休息";
                }
            } else {
                todayHasPlan = false;
                actionTips = "今天休息";
            }
        } else {
            hasActivePlan = false;
            actionTips = "还未创建计划";
        }

        // 根据初始化的todayPlan，准备执行数据
        // 先读取一个之前由于切换Tab保存的计划数据，existPlan
        // 1、如果existPlan为空，则是第一次进入该计划，直接使用默认初始化
        // 2、如果existPlan不为空，则需要根据保存的数据，初始化todayPlan
        let existPlan = app.Controller.loadData(app.StorageType.TodayPlan);

        if (todayPlan.length > 0) {
            // 每次进入时，都默认统一初始化，以防保存的数据里没有这些项
            for (let plan of todayPlan) {
                for (let exercise of plan.exerciseSet) {
                    for (let group of exercise.groupSet) {
                        group.executedQuantity = group.quantity;
                        group.executedWeight = group.weight;
                        group.finished = false;
                    }
                    exercise.currentGroupId = 0;
                    exercise.finishedCount = 0;
                    exercise.finished = false;
                    exercise.actionScore = 3;
                }
            }

            if (existPlan.length > 0) {
                // 之前有保存的内容
                console.log("existPlan is not empty!");
                for (let plan of todayPlan) {
                    for (let exist of existPlan) {
                        // 当部位相同时，搜索动作
                        if (exist.name === plan.name) {
                            for (let planExercise of plan.exerciseSet) {
                                for (let existExercise of exist.exerciseSet) {
                                    // 当动作相同的时候
                                    if (existExercise.action.name === planExercise.action.name) {
                                        let length = existExercise.groupSet.length;
                                        planExercise.groupSet.splice(0, length);
                                        planExercise.groupSet = existExercise.groupSet.concat(planExercise.groupSet);
                                        planExercise.actionScore = existExercise.actionScore;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 再次整理数据，置状态
            for (let plan of todayPlan) {
                for (let exercise of plan.exerciseSet) {
                    for (let group of exercise.groupSet) {
                        if (group.finished)
                            exercise.finishedCount++;
                    }
                    exercise.currentGroupId = exercise.finishedCount >= exercise.groupSet.length
                        ? exercise.groupSet.length - 1 : exercise.finishedCount;

                    exercise.finished = (exercise.finishedCount === exercise.groupSet.length);
                }
            }
        }

        console.log("after init, todayPlan:", todayPlan);

        // 根据初始化的todayPlan，准备数据
        // 1、准备部位列表
        // 2、初始化总组数和已完成的组数
        if (todayPlan.length > 0) {
            todayPlan.totalGroups = 0;
            todayPlan.totalFinishedGroups = 0;
            for (let plan of todayPlan) {
                partArray.push(plan.name);
                let array = [];
                for (let exercise of plan.exerciseSet) {
                    array.push(exercise.action.name);

                    todayPlan.totalGroups = todayPlan.totalGroups + exercise.groupSet.length;
                    
                    for (let group of exercise.groupSet) {
                        if (group.finished) {
                            todayPlan.totalFinishedGroups++;
                        }
                    }
                }
                actionArray.push(array);
            }

            partActionArray.push(partArray);
            partActionArray.push(actionArray[0]);

            console.log("partArray:", partArray);
            console.log("actionArray:", actionArray);
            console.log("partActionArray:", partActionArray);
        }

        this.setData({
            todayPlan: todayPlan,
            hasActivePlan: hasActivePlan,
            todayHasPlan: todayHasPlan,
            totalFinishedGroups: todayPlan.totalFinishedGroups,
            partArray: partArray,
            actionArray: actionArray,
            partActionArray: partActionArray,
            actionTips: actionTips,
        });

        console.log("hasActivePlan:", hasActivePlan);
        console.log("todayHasPlan:", todayHasPlan);
        console.log("actionTips: ", actionTips);
    },

    /**
     * 生命周期函数--监听页面显示
     * 页面Load以后，动态加载和初始化信息
     * 每次进入，初始化数据就在这里
     */
    onShow: function () {
        // 初始化数据
        this.initTodayPlan();
        // 更新图表
        this.updateFinishedChart();

        this.setData({
            paused: false
        });

        // 重置全局变量，保证翻回Training页面时，能记住上次的位置
        console.log("Training page onShow call, this.data.todayPlan: ", this.data.todayPlan);
    },

    /**
     * 生命周期函数--监听页面隐藏
     * 保存两份数据，一份今天的todayPlan，一份用于传输的todayReality
     */
    onHide: function () {
        app.Controller.saveData(app.StorageType.TodayPlan, this.data.todayPlan);

        this.planToRealityData();

        let todayReality = this.data.todayReality;

        let RealitySet = app.Controller.loadData(app.StorageType.RealitySet);

        let hasThisRealityIndex = -1;
        if (RealitySet.length > 0) {

            // 先寻找是否有当天Reality，如果有，则记下位置
            for (let idx = 0; idx < RealitySet.length; idx++) {
                if (RealitySet[idx].date === todayReality.date) {
                    hasThisRealityIndex = idx;
                    break;
                }
            }
        }

        // 如果有这天的记录则替换，否则直接插入
        if (hasThisRealityIndex !== -1) {
            RealitySet.splice(hasThisRealityIndex, 1, todayReality);
        } else {
            RealitySet.push(todayReality);
        }

        app.Controller.saveData(app.StorageType.RealitySet, RealitySet);

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
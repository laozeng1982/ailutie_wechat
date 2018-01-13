/**
 * 锻炼计划记录页面
 */

import PlanReality from '../../datamodel/PlanReality'
import Timer from '../../utils/Timer'
import ChartMaker from '../ui/chart/ChartMaker'
import ChartData from '../ui/chart/ChartData'

//获取应用实例
const app = getApp();
const chartMaker = new ChartMaker.ChartMaker('trainingCanvas');
const chartData = new ChartData.ChartData();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        showDate: '',
        todayReality: {},    // 今天完成的内容
        todayHasPlan: true,

        currentChart: {},
        // 当前选中的部位和动作索引，初始选中第一个
        currentActionId: 0,
        currentGroupId: 0,

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

        displayPartArray: [],   // 今天计划的部位列表，一维数组
        actionArray: [], // 今天计划的动作列表，二维数组，序号与partArray对应
        partActionArray: [], // 动作选择Picker的数据池，二维数组，第一列始终是partArray，第二列是actionArray中的一个元素
        multiIndex: [0, 0], // 动作选择Picker的索引

        // 二维数组，用来存放动作次数、重量
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
        let todayReality = this.data.todayReality;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        todayReality.exerciseSet[currentActionId].groupSet[currentGroupId].executedQuantityPerGroup =
            parseInt(this.data.realityDataArray[0][e.detail.value[0]]);
        todayReality.exerciseSet[currentActionId].groupSet[currentGroupId].executedQuantityPerAction =
            parseInt(this.data.realityDataArray[1][e.detail.value[1]]);

        this.setData({
            todayReality
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
        let todayReality = this.data.todayReality;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;
        todayReality.exerciseSet[currentActionId].groupSet[currentGroupId].finished = true;

        if (todayReality.exerciseSet[currentActionId].currentGroupId + 1 >= todayReality.exerciseSet[currentActionId].groupSet.length)
            todayReality.exerciseSet[currentActionId].currentGroupId = todayReality.exerciseSet[currentActionId].groupSet.length - 1;
        else
            todayReality.exerciseSet[currentActionId].currentGroupId++;

        todayReality.exerciseSet[currentActionId].finishedCount++;
        todayReality.exerciseSet[currentActionId].finished =
            todayReality.exerciseSet[currentActionId].finishedCount >= todayReality.exerciseSet[currentActionId].groupSet.length;

        todayReality.totalFinishedGroups++;

        this.setData({
            todayReality: todayReality,
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
        let todayReality = this.data.todayReality;
        let totalGroups = todayReality.totalGroups;
        let totalFinishedGroups = todayReality.totalFinishedGroups;

        if (totalGroups !== 0 && totalFinishedGroups <= totalGroups) {
            percentFinished = Math.ceil(totalFinishedGroups * 100 / totalGroups);
        }

        // console.log("finishedGroup:", totalFinishedGroups, ", totalGroups:", totalGroups, ", percent:", percentFinished, "%");

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
        // console.log(typeof this.timer);
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
        let todayReality = this.data.todayReality;
        let currentActionId = this.data.currentActionId;

        // console.log("in onActionScore, score is: ", e.currentTarget.id);

        todayReality.exerciseSet[currentActionId].actionScore = score;

        this.setData({
            todayReality: todayReality,
        });

        // 更新视图
        this.updateActionScore(score);
    },

    /**
     * 将动作评分的初始值设为计划的值，方便用户选取
     */
    initQuantityPickerIndex: function () {
        if (this.data.todayReality.movementList.length === 0) {
            console.log("in initQuantityPickerIndex, today has no currentPlan");
            return;
        }

        let selectedMovement = this.data.todayReality.movementList[this.data.currentActionId - 1];
        // 获取当前计划的计划数据
        let planCount = selectedMovement.contents.details[0].planCount;
        let planWeight = selectedMovement.contents.details[0].planWeight;

        let RealityIndex = [
            this.getArrayIndex(planCount, this.data.realityDataArray[0]),
            this.getArrayIndex(planWeight, this.data.realityDataArray[1]),
            2
        ];
        // console.log("in initQuantityPickerIndex, ", planCount, planWeight);
        // 重置索引
        this.setData({
            actualCount: planCount,
            actualWeight: planWeight,
            actualGpFeeling: 3,
            RealityIndex: RealityIndex
        })
    },

    /**
     * 没有计划的情况下，跳转去制定计划
     */
    onMakePlan: function () {
        app.makingNewPlan = true;
        wx.navigateTo({
            url: '../plan/define_plan/define_plan?mode=longPlan',
        });
    },

    /**
     * 根据选中动作的状态，将组的状态更改到实际的状态，只需要设置currentGroupId
     * 这里有两种入口
     */
    changeGroup: function (isNext) {
        let todayReality = this.data.todayReality;
        let currentActionId = this.data.currentActionId;
        let currentGroupId = this.data.currentGroupId;

        if (isNext) {
            // 向后翻
            if (currentGroupId + 1 < todayReality.exerciseSet[currentActionId].groupSet.length) {
                currentGroupId++;
            } else {
                if (currentActionId + 1 < todayReality.exerciseSet.length) {
                    currentActionId++;
                    currentGroupId = 0;
                    // 这已经到最后了
                    this.setData({
                        paused: false
                    });
                    console.log("It's the last group~~");
                }
            }
        } else {
            // 向前翻
            if (currentGroupId - 1 >= 0) {
                currentGroupId--;
            } else {
                if (currentActionId - 1 >= 0) {
                    currentActionId--;
                    currentGroupId = todayReality.exerciseSet[currentActionId].groupSet.length - 1;
                } else {
                    currentActionId = 0;
                    currentGroupId = 0;
                    // 这已经到最前面了
                    this.setData({
                        paused: false
                    });
                    console.log("It's the first group~~");
                }
            }
        }

        this.changeAction(currentActionId, currentGroupId);

    },

    /**
     * 动作跳转具体处理函数
     * 1、先根据索引跳转动作
     * 2、设置Picker状态
     * 3、设置动作导航imageButton的状态
     * 4、设置当前组，跳转当前动作对应的组
     * @param currentActionId
     * @param currentGroupId
     */
    changeAction: function (currentActionId, currentGroupId) {
        let todayReality = this.data.todayReality;
        let partActionArray = this.data.partActionArray;

        // 同时更新动作选择列表
        let currentPartId = 0;
        for (let idx = 0; idx < partActionArray[0].length; idx++) {
            if (partActionArray[idx] === todayReality.exerciseSet[currentActionId].action.target[0]) {
                console.log("match:  ", partActionArray[idx]);
                currentPartId = idx;
            }
        }
        partActionArray[1] = this.data.actionArray[currentPartId];

        if (todayReality.exerciseSet[currentActionId].finished) {
            console.log("score:", todayReality.exerciseSet[currentActionId].actionScore);
            this.updateActionScore(todayReality.exerciseSet[currentActionId].actionScore);
        }

        todayReality.exerciseSet[currentActionId].currentGroupId = currentGroupId;

        this.setData({
            currentActionId: currentActionId,
            currentGroupId: currentGroupId,
            partActionArray: partActionArray,
            multiIndex: [currentPartId, currentActionId],
            firstAction: currentActionId === 0,
            lastAction: currentActionId === todayReality.exerciseSet.length - 1,
            enablePause: true,  //无论是哪里跳转来的，都要把暂停复位
            paused: false
        });

        // console.log("currentActionId:", currentActionId, "currentGroupId:", currentGroupId);
        // console.log("Training page onShow call, this.data.todayReality: ",
        //     this.data.todayReality.exerciseSet[currentActionId].groupSet[currentGroupId].finished);

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
        let todayReality = this.data.todayReality;
        let partIdx = e.detail.value[0];
        let actionIdx = e.detail.value[1];
        let currentActionId = 0;

        for (let idx = 0; idx < this.data.todayReality.exerciseSet.length; idx++) {
            // 注意这里要判断两个，一个是动作名，一个是对应的主部位名，同时相等才行
            if (this.data.todayReality.exerciseSet[idx].action.target[0] === this.data.partActionArray[0][partIdx] &&
                this.data.todayReality.exerciseSet[idx].action.name === this.data.partActionArray[1][actionIdx]) {
                currentActionId = idx;
                break;
            }
        }

        let currentGroupId = todayReality.exerciseSet[currentActionId].currentGroupId;
        this.changeAction(currentActionId, currentGroupId);
    },

    /**
     * 跳转动作
     * 1、判断跳转方向
     * 2、处理所要跳转到的部位和动作索引
     * 3、调用跳转方法changeAction
     */
    onActionChange: function (e) {
        let todayReality = this.data.todayReality;
        let currentActionId = this.data.currentActionId;

        if (e.currentTarget.id === "next") {
            // 向后跳转，如果越界，直接跳到最后一个
            currentActionId = (currentActionId + 1 >= todayReality.exerciseSet.length) ?
                todayReality.exerciseSet.length - 1 : (currentActionId + 1);
        } else {
            // 向前跳转，如果越界，直接跳到第一个
            currentActionId = (currentActionId - 1 < 0) ? 0 : (currentActionId - 1);
        }

        // 将切换后的动作currentGroupId传过来
        let currentGroupId = todayReality.exerciseSet[currentActionId].currentGroupId;

        this.changeAction(currentActionId, currentGroupId);
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

        let currentChart = chartMaker.makeRingChart(chartData.createRingData());

        this.setData({
            showDate: showDate,
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
     * 需要处理一些事务，如果计划有变，之前保存的数据需要去更新，需要判断todayReality中完成的数据与现有的冲突关系
     * 1、读取Reality数据
     * 2、整理Reality数据，只记录已经锻炼的部分，没有锻炼的不记录
     * 3、存储Reality数据
     */
    saveReality: function () {
        let todayReality = this.data.todayReality;
        let existReality = null;
        // 1、读取Reality
        let RealitySet = app.Util.loadData(app.Settings.Storage.RealitySet);

        let today = app.Util.formatDateToString(new Date());

        for (let reality of RealitySet) {
            if (reality.date === today) {
                existReality = reality;
            }
        }

        console.log("RealitySet:", RealitySet);
        console.log("existReality:", existReality);
        console.log("todayReality:", todayReality);

        // 2、整理Reality
        // 2.1、如果已经存在的记录本次存储没有（由于计划有变，进入页面初始化时，丢掉了），需要加上；反之，已本次页面产生的最新数据为准，这里没有替换地方
        // 2.2、只记录已经锻炼的部分，没有锻炼的不记录
        if (existReality !== null && existReality.exerciseSet.length > 0) {
            // 先搜索
            for (let existExercise of existReality.exerciseSet) {
                let hasThisExercise = false;

                for (let currentExercise of todayReality.exerciseSet) {
                    if (existExercise.action.target[0] === currentExercise.action.target[0] &&
                        existExercise.action.name === currentExercise.action.name) {
                        hasThisExercise = true;
                    }
                }

                if (!hasThisExercise) {
                    todayReality.exerciseSet.push(existExercise);
                }
            }
        }

        let realityToSave = new PlanReality.Reality(today, app.userInfoLocal.userUID);

        for (let exercise of todayReality.exerciseSet) {
            let exerciseToBeAdd = null;
            if (exercise.finishedCount > 0 && exercise.finishedCount < exercise.groupSet.length) {
                // 未全部完成
                exerciseToBeAdd = app.Util.deepClone(exercise);
                exerciseToBeAdd.groupSet = [];
                for (let group of exercise.groupSet) {
                    if (group.finished) {
                        exerciseToBeAdd.groupSet.push(group);
                    }
                }

            } else if (exercise.finishedCount === exercise.groupSet.length) {
                // 全部完成，直接添加
                exerciseToBeAdd = exercise;
            }

            if (exerciseToBeAdd !== null) {
                realityToSave.exerciseSet.push(exerciseToBeAdd);
            }
        }

        // console.log("realityToSave:", realityToSave);

        // 3、存储整理好的RealitySet，即最终实际的Reality
        if (RealitySet.length > 0) {
            // 先寻找是否有当天Reality，如果有，则记下位置
            for (let idx = 0; idx < RealitySet.length; idx++) {
                if (RealitySet[idx].date === realityToSave.date) {
                    RealitySet.splice(idx, 1);
                    break;
                }
            }
        }

        console.log("realityToSave:", realityToSave);
        RealitySet.push(realityToSave);
        // 默认先保存在本地，之后找时机同步
        app.Settings.Storage.RealitySet.syncedTag = false;
        app.Util.saveData(app.Settings.Storage.RealitySet, RealitySet);
        app.Util.saveData(app.Settings.Storage.Settings, app.Settings);
        // app.Util.syncData(app, "reality", realityToSave, RealitySet);

    },

    /**
     * 根据计划和已经保存的Reality数据来初始化当前的Reality
     * 这里可能存在用户把之前锻炼过的计划删除了，这里为了保持和计划一直可能会丢掉部分数据
     * 但实际存储的锻炼数据在保存的时候才处理，那里不丢失即可
     */
    initTodayReality: function () {
        let today = app.Util.formatDateToString(new Date());
        let dayIdx = (new Date()).getDay();     // 周几，索引

        let todayReality = new PlanReality.Reality(today, app.userInfoLocal.userUID);
        let todayHasPlan = false;
        let hasActivePlan = false;
        let currentPlan = app.currentPlan;
        let currentActionId = 0;
        let currentGroupId = 0;
        let partArray = [];
        let actionArray = [];
        let partActionArray = [];
        let actionTips;

        // 1、先读取计划，如果不存在，则新建一个
        app.currentPlan.cloneDataFrom(app.Util.loadPlan());
        // console.log("in Training, app.currentPlan:", app.currentPlan);

        // 先读取计划，如果有，则创建todayReality，然后去初始化
        // 初始化放在另外的代码中，免得这步结构太复杂
        if (currentPlan.currentUse) {
            hasActivePlan = true;
            // 先判断这天是否在周期内，然后判断这天动作的重复次数里，有没有这个周期
            if (app.Util.checkDate(currentPlan.fromDate, today, currentPlan.toDate)) {
                todayReality.exerciseSet = app.Util.deepClone(app.currentPlan.circleDaySet[dayIdx].exerciseSet);
                // 今天有计划
                if (todayReality.exerciseSet.length > 0) {
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

        // 2、根据初始化的todayReality，准备执行数据
        // 先读取一个之前由于切换Tab保存的计划数据，existReality
        // 2.1、如果existReality.executedSet为空，则是第一次进入该计划，直接使用默认初始化
        // 2.2、如果existReality.executedSet不为空，则需要根据保存的数据，初始化todayReality

        let realitySet = app.Util.loadData(app.Settings.Storage.RealitySet);
        let existReality = null;

        for (let reality of realitySet) {
            if (reality.date === today) {
                existReality = reality;
            }
        }

        // console.log("existReality:", existReality);

        // 3、根据已经保存的数据整理
        if (todayReality.exerciseSet.length > 0) {
            // 每次进入时，都默认统一初始化，以防保存的数据里没有这些项

            for (let exercise of todayReality.exerciseSet) {
                for (let group of exercise.groupSet) {
                    group.forPlan = false;
                    group.executedQuantityPerGroup = group.quantityPerGroup;
                    group.executedQuantityPerAction = group.quantityPerAction;
                    group.finished = false;
                }
                exercise.forPlan = false;
                exercise.currentGroupId = 0;
                exercise.finishedCount = 0;
                exercise.finished = false;
                exercise.actionScore = 3;
            }

            if (existReality !== null && existReality.exerciseSet.length > 0) {
                // 之前有保存的内容，需要读取过来
                console.log("existReality is not empty!");
                for (let plan of todayReality.exerciseSet) {
                    for (let exist of existReality.exerciseSet) {
                        // 注意，这里需要判断两个，当部位和动作同时相同，方可认为他们是一个动作
                        if (exist.action.target[0] === plan.action.target[0] && exist.action.name === plan.action.name) {
                            let length = exist.groupSet.length;
                            // 将plan中前半截去掉，然后加上实际的数据
                            plan.groupSet.splice(0, length);
                            plan.groupSet = exist.groupSet.concat(plan.groupSet);
                            plan.actionScore = exist.actionScore;
                        }
                    }
                }
            }

            // 再次整理数据，置状态
            for (let exercise of todayReality.exerciseSet) {
                for (let group of exercise.groupSet) {
                    if (group.finished)
                        exercise.finishedCount++;
                }
                exercise.currentGroupId = exercise.finishedCount >= exercise.groupSet.length
                    ? exercise.groupSet.length - 1 : exercise.finishedCount;

                exercise.finished = (exercise.finishedCount === exercise.groupSet.length);
            }

            // 设置进入页面激活的动作及组，激活未完成的第一个动作和第一组
            for (let idx = 0; idx < todayReality.exerciseSet.length; idx++) {
                if (!todayReality.exerciseSet[idx].finished) {
                    currentActionId = idx;
                    currentGroupId = todayReality.exerciseSet[idx].currentGroupId;
                    break;
                }
            }
        }

        console.log("after init, todayReality:", todayReality);

        // 4、根据初始化的todayReality，准备数据
        // 4.1、准备部位列表
        // 4.2、初始化总组数和已完成的组数
        if (todayReality.exerciseSet.length > 0) {
            todayReality.totalGroups = 0;
            todayReality.totalFinishedGroups = 0;
            // 1、统计部位：先获得所有的一级部位名称
            for (let exercise of todayReality.exerciseSet) {
                if (!partArray.includes(exercise.action.target[0])) {
                    partArray.push(exercise.action.target[0]);
                }
            }

            // 2、统计动作
            for (let part of partArray) {
                let array = [];
                for (let exercise of todayReality.exerciseSet) {
                    if (part === exercise.action.target[0]) {
                        array.push(exercise.action.name);
                    }
                }
                actionArray.push(array);
            }
            partActionArray.push(partArray);
            partActionArray.push(actionArray[0]);

            // 3、统计总组数和完成数
            for (let exercise of todayReality.exerciseSet) {
                todayReality.totalGroups = todayReality.totalGroups + exercise.groupSet.length;

                for (let group of exercise.groupSet) {
                    if (group.finished) {
                        todayReality.totalFinishedGroups++;
                    }
                }
            }
        }

        this.setData({
            todayReality: todayReality,
            hasActivePlan: hasActivePlan,
            todayHasPlan: todayHasPlan,
            displayPartArray: partArray,
            actionArray: actionArray,
            partActionArray: partActionArray,
            currentActionId: currentActionId,
            currentGroupId: currentGroupId,
            actionTips: actionTips,
            paused: false
        });
    },

    /**
     * 生命周期函数--监听页面显示
     * 页面Load以后，动态加载和初始化信息
     * 每次进入，初始化数据就在这里
     */
    onShow: function () {
        // 初始化数据
        this.initTodayReality();
        // 更新图表
        this.updateFinishedChart();

    },

    /**
     * 生命周期函数--监听页面隐藏
     * 1、保存数据
     * 2、停止计时器
     */
    onHide: function () {
        // 保存计划
        this.saveReality();
        // 停止计时器
        if (this.timer) {
            this.timer.stop();
        }

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
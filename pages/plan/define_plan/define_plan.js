// pages/plan/define_plan/define_plan.js
import PlanSet from '../../../datamodel/PlanSet'
import Body from '../../../datamodel/Body'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {

        // 起止时间控制数据
        fromDate: "",
        toDate: "",
        showPeriod: false,

        // 全页面控制的数据结构，按一周七天，用作数据存储，每天都有
        // partList，仅仅作为页面控制用，代表大的激活部位
        // body，每个部位的动作及信息，存储每天选中的具体内容，最后离开页面时，收集每天每个部位的动作及信息

        weekData: [
            {id: 0, value: '日', name: "Sunday", partList: [], body: {}, selected: false},
            {id: 1, value: '一', name: "Monday", partList: [], body: {}, selected: false},
            {id: 2, value: '二', name: "Tuesday", partList: [], body: {}, selected: false},
            {id: 3, value: '三', name: "Wednesday", partList: [], body: {}, selected: false},
            {id: 4, value: '四', name: "Thursday", partList: [], body: {}, selected: false},
            {id: 5, value: '五', name: "Friday", partList: [], body: {}, selected: false},
            {id: 6, value: '六', name: "Saturday", partList: [], body: {}, selected: false}
        ],

        // 用作显示，这里用weekData来渲染，速度实在太慢，而且会出现exceed max size错误，超出setData的数据容量范围
        weekVisual: [
            {id: 0, value: '日', name: "Sunday", selected: false},
            {id: 1, value: '一', name: "Monday", selected: false},
            {id: 2, value: '二', name: "Tuesday", selected: false},
            {id: 3, value: '三', name: "Wednesday", selected: false},
            {id: 4, value: '四', name: "Thursday", selected: false},
            {id: 5, value: '五', name: "Friday", selected: false},
            {id: 6, value: '六', name: "Saturday", selected: false}
        ],

        // weekData数组中的一个，用单数据来作为当前选中日期的显示，提高渲染速度，否则用weekDta直接渲染，速度太慢
        currentDay: {},

        selectedDateList: [],

        search: {
            searchValue: '',
            showClearBtn: false
        },
        searchResult: [],

        actionQuantityArray: [], // 3D 数组，用来存放动作组数，次数，重量和单位
        actionQuantityIndex: [5, 9, 19, 0],  // 数量选择索引

    },

    /**
     * 设定时间tab
     * 显示更改的日期，日期最早的时间点在Picker中设定了，无需判断过期这种情况。
     * @param e
     */
    onChangeDatePicker: function (e) {
        switch (e.currentTarget.id) {
            case "start":
                this.setData({
                    fromDate: e.detail.value,
                    toDate: app.Util.getMovedDate(e.detail.value, true, 30),
                    showPeriod: true
                });
                break;
            case "end":
                this.setData({
                    toDate: e.detail.value
                });
                break;
            default:
                break;
        }

    },

    /**
     * 核心函数
     * 响应周期列表点击，依次完成以下工作
     * 1、设置周期选中状态，需有判断该周期是否有动作等逻辑
     * 2、激活选中的那天的界面
     * 3、根据以后计划或者之前的状态，更新显示的信息
     * @param e
     */
    onSelectDay: function (e) {
        let weekData = this.data.weekData;
        let weekVisual = this.data.weekVisual;
        let currentDay;
        let selectedDateList = app.Util.deepClone(this.data.selectedDateList);
        let selectedDateIdx = parseInt(e.currentTarget.id);

        console.log("selected: ", selectedDateIdx, ", ",
            this.data.weekVisual[selectedDateIdx].name, ", ", this.data.weekVisual[selectedDateIdx].value);

        // 1、判断周期选中的状态，如果是多选，判断之前选中的天是否有计划
        // 1.1、如果是同样的计划（之前同批次制定的），或者选中的天都没有计划，或者多天中只有一天有计划，则可以同时选中
        // 1.2、否则，则取消之前的选中，然后选中最后一次点击的天
        if (this.data.selectedDateList.length > 0) {
            // 如果这一天之前没有选中
            if (!this.data.selectedDateList.includes(selectedDateIdx)) {
                for (let idx = 0; idx < this.data.selectedDateList.length; idx++) {
                    let dayIdx = this.data.selectedDateList[idx];
                    // 当选中的天的计划和之前选中的天计划相同时（这里要判断是否选中的动作相同），
                    // 如果相同，则选中这天；如果不同，则需判断是否这天或者别的天为空
                    if (app.Util.isEqual(weekData[selectedDateIdx].body, weekData[dayIdx].body)) {
                        console.log("those days have the exactly same selection!!!");
                        if (!selectedDateList.includes(selectedDateIdx))
                            selectedDateList.push(selectedDateIdx);
                    } else {
                        // 这两天中有一天为空，也可以同时选中，否则就是选中的动作不同，不是同一天的计划，清空之前选中的天
                        if (app.Util.isEqual(weekData[selectedDateIdx].body.getSelectedAction(), weekData[dayIdx].body.getSelectedAction())) {
                            // 如果选中的动作相同，仅仅是激活的部位不同而已，也算相同计划
                            console.log("those days have same action selection!");
                            if (!selectedDateList.includes(selectedDateIdx))
                                selectedDateList.push(selectedDateIdx);
                        } else {
                            console.log("those days don't have same action selection!");
                            selectedDateList = [];
                            selectedDateList.push(selectedDateIdx);
                        }
                    }
                }
            } else {
                // 如果这一天有选中，则说明此次是再次点击取消，selectDateList里不添加即可
                for (let idx = 0; idx < selectedDateList.length; idx++) {
                    if (selectedDateList[idx] === selectedDateIdx) {
                        selectedDateList.splice(idx, 1);
                    }
                }
            }
        } else {
            // 之前选中的日期列表为空，将选中的加入日期选中列表
            selectedDateList.push(selectedDateIdx);
        }
        console.log("selectedDateList:", selectedDateList);

        // 2、根据selectedDateList，重置选中的状态，激活当前选中的部位与动作面板
        for (let day = 0; day < weekVisual.length; day++) {
            weekVisual[day].selected = false;
            weekData[day].selected = false;

        }

        for (let selectedDate of selectedDateList) {
            weekVisual[selectedDate].selected = true;
            weekData[selectedDate].selected = true;
        }

        // 3、更新面板中的部位与动作的信息
        // 3.1、先得到这天的部位

        app.currentPlan.setPlanParts();

        for (let day of this.data.weekData) {
            if (day.selected) {
                currentDay = day;
                if (day.body.hasSelectedAction()) {
                    // 仅用第一个选中的数据显示即可
                    break;
                }
            }
        }

        // 为其他未选计划的克隆已经选过的计划
        for (let day of this.data.weekData) {
            if (day.selected) {
                day.body.parts = app.Util.deepClone(currentDay.body.parts);
                day.partList = app.Util.deepClone(currentDay.partList);
            }
        }

        // 如果没有选中，则置空
        if (typeof currentDay === "undefined") {
            currentDay = {id: 6, value: '六', name: "Saturday", partList: [], body: {}, selected: false};
        }

        this.setData({
            selectedDateList: selectedDateList,
            weekVisual: weekVisual,
            currentDay: currentDay,
        });

    },

    /**
     * 选择动作，响应部位导航的选择
     * 如果是多天，那么多天的内部状态，都要一致
     * @param e
     */
    onSelectPartTab: function (e) {
        // console.log(e);
        console.log("Selected part: ", e.currentTarget.id);

        let currentDay;

        let activePartName = e.currentTarget.id;

        for (let day of this.data.weekData) {
            if (day.selected) {
                // active用于显示当前激活的部位，select用于标记选中的
                day.body.activePartByName(activePartName);
                day.body.selectPartByName(activePartName);

                for (let part of day.partList) {
                    part.selected = (part.name === activePartName);
                }
                currentDay = day;
            }
        }

        this.setData({
            currentDay: currentDay
        });

    },

    /**
     * 选择动作，响应动作点击选中
     * 如果是多天，那么多天的内部状态，都要一致
     * @param e
     */
    onSelectAction: function (e) {
        console.log("selected action is:", e.currentTarget.id);

        let currentDay;

        // 如果是自定义动作，跳转页面
        if (e.currentTarget.id === "自定义动作") {
            console.log("go to custom");
            wx.navigateTo({
                url: '../custom_actions/custom_actions',
            });
            return;
        }

        for (let day of this.data.weekData) {
            if (day.selected) {
                console.log("selected day:", day.id);
                day.body.selectActionByName(e.currentTarget.id);
                for (let part of day.partList) {
                    part.selectedActionCount = day.body.getActionSelectedCountByPart(part.name);
                }

                day.hasparts = app.Util.makePartString(day.body.getPartNameArray());

                currentDay = day;

            }
        }

        let weekVisual = this.data.weekVisual;
        for (let idx = 0; idx < weekVisual.length; idx++) {
            if (weekVisual[idx].selected) {
                weekVisual[idx].hasparts = app.Util.makePartString(this.data.weekData[idx].body.getSelectedPartNames());
            }
        }

        console.log("currentDay", currentDay);

        this.setData({
            weekVisual: weekVisual,
            currentDay: currentDay
        });

    },

    /**
     * 选择动作重量，响应重量变化
     * 如果是多天，那么多天的内部状态，都要一致
     * @param e
     */
    onChangeQuantity: function (e) {
        console.log("action:", e.currentTarget.dataset.action);
        let currentDay;

        let selectedRowArr = e.detail.value;

        // 获取当前页面用户的输入
        let planGpCount = parseInt(this.data.actionQuantityArray[0][selectedRowArr[0]]);
        let planCount = parseInt(this.data.actionQuantityArray[1][selectedRowArr[1]]);
        let planWeight = parseInt(this.data.actionQuantityArray[2][selectedRowArr[2]]);
        let measurement = this.data.actionQuantityArray[3][selectedRowArr[3]];

        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount, planWeight, measurement);

        let groupSet = [];
        for (let idx = 0; idx < planGpCount; idx++) {
            groupSet.push(new PlanSet.GroupSet(idx + 1, planCount, planWeight, measurement));
        }

        let selectedAction = e.currentTarget.dataset.action;

        for (let day of this.data.weekData) {
            if (day.selected) {
                day.body.addGroupSetToAction(selectedAction, groupSet);
                day.partList.selectedActionCount = day.body.getActionSelectedCountByPart(selectedAction.partSet[0]);
                currentDay = day;
            }
        }

        this.setData({
            currentDay: currentDay
        });

    },

    /**
     * 选择动作tab
     * 准备重量选择的picker，每次选动作的时候生成
     */
    makeActionPicker: function () {

        let actionQuantityArray = [];

        let array0 = [];    // 组数
        let array1 = [];    // 每组记数
        let array2 = [];    // 每组重量
        let array3 = ["Kg", "Lbs", "Km", "百米", "个"];

        for (let idx = 0; idx < 200; idx++) {
            array0.push((idx + 1) + "组");
            array1.push((idx + 1) + "次");
            array2.push((idx + 1));
        }

        actionQuantityArray.push(array0);
        actionQuantityArray.push(array1);
        actionQuantityArray.push(array2);
        actionQuantityArray.push(array3);

        this.setData({
            actionQuantityArray: actionQuantityArray,
        });
    },

    /**
     * 初始化每天的部位与动作
     */
    initPartAction: function () {
        console.log("initPartAction call");
        // 这里要分入口，第一次进入，直接调用系统的，否则使用已经保存的

        let body = new Body.Body();
        let weekData = this.data.weekData;

        let systemSetting = app.Util.loadData(app.StorageType.SystemSetting);
        body.cloneDataFrom(systemSetting.body);

        // 添加两个临时属性
        for (let part of body.parts) {
            part.selectedActionCount = 0;
        }

        let partList = [];
        let partNameArray = body.getPartNameArray();
        for (let partName of partNameArray) {
            partList.push({
                name: partName,
                selectedActionCount: 0,
                selected: false
            });
        }

        for (let day of weekData) {
            day.partList = app.Util.deepClone(partList);
            day.body = new Body.Body();
            day.body.cloneDataFrom(systemSetting.body);
            // 第一次进入，没有选过动作，需要重新构建，先统一赋值
            day.body.initGroupSet();
        }

        // 进行标注
        // 进行判断，如果是继续制定计划，那么之前的计划，已经保存了，这里刷新一下数据，如果不是，则不用刷新
        // 这个地方应该根据已经保存的plan来显示，获取当前已经保存的计划

        let planSet = app.Util.loadData(app.StorageType.PlanSet);
        let currentPlan;

        // 寻找激活的计划
        if (this.data.options.mode ==="tempPlan" || this.data.options.mode === "longPlan") {
            if (app.currentPlan.circleDaySet.length === 0) {
                for (let idx = 0; idx < 7; idx++) {
                    app.currentPlan.circleDaySet.push(new PlanSet.CircleDay(idx, this.data.weekData[idx].name));
                }
            }

            currentPlan = app.currentPlan;
        } else {
            for (let plan of planSet) {
                if (plan.currentUse) {
                    currentPlan = plan;
                    break;
                }
            }
        }

        if (typeof currentPlan === "undefined") {
            currentPlan = app.currentPlan;
        }

        console.log(currentPlan);

        let fromDate;
        let toDate;
        let showPeriod = false;
        let weekVisual = this.data.weekVisual;

        // 如果已经有计划了，需要根据计划里的内容，给body的数据更新
        // 始终以currentPlan来初始化

        // 读取日期
        if (currentPlan.fromDate === "") {
            fromDate = "请选择";
            toDate = "";
        } else {
            fromDate = currentPlan.fromDate;
            toDate = currentPlan.toDate;
            showPeriod = true;
        }

        for (let day of this.data.weekData) {
            // 更新重量数据，同时获取部位列表
            let partNameArray = [];
            for (let exercise of currentPlan.circleDaySet[day.id].exerciseSet) {
                if (!partNameArray.includes(exercise.action.partSet[0])) {
                    partNameArray.push(exercise.action.partSet[0]);
                }
                day.body.updateGroupSet(exercise);
            }
            day.body.selectPartsByName(partNameArray);
            day.body.activePartByName(partNameArray[0]);
            day.body.countSelectedAction();

            // 更新视图部分
            // 1、更新周期视图
            weekVisual[day.id].hasparts = app.Util.makePartString(day.body.getSelectedPartNames());
            // 2、更新部位选中状态和计数
            for (let part of day.partList) {
                part.selected = partNameArray.includes(part.name);
                part.selectedActionCount = day.body.getSelectedActionByPartName(part.name).length;
            }
        }


        this.setData({
            fromDate: fromDate,
            toDate: toDate,
            showPeriod: showPeriod,
            weekVisual: weekVisual
        });

    },

    /**
     * 预览功能入口，跳转到预览页面
     * 所有选项都已选择，进入下一步预览计划
     * @param e
     */
    onPreview: function (e) {
        // 准备Plan的数据
        app.currentPlan.fromDate = this.data.fromDate;
        app.currentPlan.toDate = this.data.toDate;
        app.currentPlan.name = "我的计划";

        let circleDaySet = app.currentPlan.circleDaySet;

        for (let day of this.data.weekData) {
            let exerciseSet = [];
            for (let part of day.body.parts) {
                if (part.selected) {
                    // 生成一个部位
                    // 当点中的时候，就算是计划中的元素
                    // 搜索所有选中的动作，生成actionSet
                    let actionIdx = 1;

                    for (let action of part.actionSet) {
                        // 生成一个动作
                        let exercise = new PlanSet.Exercise(exerciseSet.length + 1);
                        if (action.selected) {
                            exercise.action = app.Util.deepClone(action);
                            delete exercise.action.groupSet;
                            exercise.groupSet = action.groupSet;
                        }

                        // 如果没选动作，就不加
                        if (exercise.groupSet.length > 0) {
                            exerciseSet.push(exercise);
                            actionIdx++;
                        }

                    }
                }
            }

            circleDaySet[day.id].exerciseSet = exerciseSet;
        }

        app.currentPlan.circleDaySet = circleDaySet;

        console.log("app.currentPlan:", app.currentPlan);

        wx.navigateTo({
            url: '../plan_details/plan_details?mode=preview',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     * 页面进入时，初始化一些数据
     * 本页面为复用页面，入口分为：
     * 1、全新制定长期计划
     * 2、临时改变当天计划
     * 3、判别条件是options携带的model
     * 4、根据入口选择初始化内容
     */
    onLoad: function (options) {
        console.log("Select Part Page onLoad");
        console.log("options.model:", options.mode);
        if (options.mode === "tempPlan" || options.mode === "longPlan") {
            app.currentPlan = new PlanSet.Plan();
            wx.setNavigationBarTitle({
                title: '定制我的锻炼计划',
            });

        }else {
            wx.setNavigationBarTitle({
                title: '修改我的锻炼计划',
            });

        }
        // 只需要这一次
        this.makeActionPicker();


        this.setData({
            options: options
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        console.log("Select Part Page onShow");

        this.initPartAction();

        if (app.lastPlanSaved) {
            this.data.body.unSelectAllParts();
            let partList = this.data.partList;
            let body = this.data.body;
            body.unSelectAllActions();
            for (let part of partList) {
                part.selected = false;
                part.active = false;
            }
            this.setData({
                partList: partList
            });
            // 重置为没保存的状态
            app.lastPlanSaved = false;
        }

        console.log("weekData:", this.data.weekData);
    },

    /**
     * 保存善后
     */
    saveSession: function () {
        app.planStartDate = this.data.fromDate;
        app.planEndDate = this.data.toDate;
    },

    /**
     * 生命周期函数--监听页面隐藏
     * 暂时离开页面，跳转下一个页面
     * 保存当前选择的一些
     */
    onHide: function () {
        console.log("this page onHide");
        this.saveSession();
    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {
        this.saveSession();
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
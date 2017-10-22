// pages/plan/define_plan/define_plan.js
import PlanSet from '../../../datamodel/PlanSet'
import Body from '../../../datamodel/Body'
import Part from '../../../datamodel/Part'
import Action from '../../../datamodel/Action'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {

        // 时间tab的数据
        fromDate: "",
        toDate: "",
        cycleLength: 7,
        cycleLengthIndex: 6,
        cycleLengthPickerArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],

        // 全页面控制的数据结构，按一周七天，每天都有partList，代表大的激活部位，仅仅作为页面控制用，
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

        // 部位tab的数据
        body: {},
        selectedPartNames: '',

        selectedDateList: [],

        // 动作tab的数据
        selectedPartIdx: 0,
        selectedActionIdx: 0,

        search: {
            searchValue: '',
            showClearBtn: false
        },
        searchResult: [],

        partList: [],

        actionQuantityArray: [], // 3D 数组，用来存放动作组数，次数，重量和单位
        actionQuantityIndex: [5, 9, 19, 0],  // 数量选择索引
        plan: '',
    },

    /**
     * 设定时间tab
     * 根据选项生成日期列表。
     * @returns {Array}
     */
    makeWeekList: function () {
        // 暂时只想到了这个办法，给weekData加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。

        let weekData = this.data.weekData;

        // 准备选择列表，周期下添加标注
        if (app.currentPlan.circleDaySet.length > 0) {
            app.currentPlan.setPlanParts();
        }

        for (let idx = 0; idx < 7; idx++) {

            if (app.currentPlan.circleDaySet.length > 0) {
                weekData[idx].hasparts = app.currentPlan.getPlanPartByDay(idx);
            }

            // 如果是直接退回来，没有保存的状态，需要标注已经选择的日期
            if (!app.lastPlanSaved && this.data.selectedDateList.length > 0
                && this.data.selectedDateList.includes(idx)) {
                weekData[idx].selected = true;
            }
        }

        console.log("weekData: ", weekData);

        this.setData({
            weekData: weekData,
        });
    },

    initDatePartList: function () {
        let body = this.data.body;

        this.setData({
            partNameArray: partNameArray,
            partList: partList
        });
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
                    toDate: app.Util.getMovedDate(e.detail.value, true, 30)
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
     * 选择动作tab
     * 响应周期列表点击的效果
     * @param e
     */
    onSelectDay: function (e) {
        let weekData = this.data.weekData;
        let selectedDateList = [];
        let selectedDateIdx = parseInt(e.currentTarget.id);
        console.log("selected: ", selectedDateIdx, ", ",
            this.data.weekData[selectedDateIdx].name, ", ", this.data.weekData[selectedDateIdx].value);

        // 如果多选，判断之前选中的天是否有计划
        // 如果是同样的计划（之前同批次制定的），或者选中的天都没有计划，或者多天中只有一天有计划，则可以同时选中
        // 否则，则取消之前的选中，然后选中最后一次点击的天
        console.log(app.currentPlan.circleDaySet.length > 0, this.data.selectedDateList.length > 0
            , !this.data.selectedDateList.includes(selectedDateIdx));

        if (app.currentPlan.circleDaySet.length > 0 && this.data.selectedDateList.length > 0
            && !this.data.selectedDateList.includes(selectedDateIdx)) {
            let hasPlanCount = 0;
            selectedDateList = this.data.selectedDateList.concat([selectedDateIdx]);
            console.log("list:", selectedDateList);
            for (let item of selectedDateList) {
                if (app.currentPlan.circleDaySet[item].exerciseSet.length > 0)
                    hasPlanCount++;
            }

            // 当有计划数的天数超过一天时，即提示
            if (hasPlanCount > 1) {
                app.Util.showNormalToast("不可同时修改两天的计划~~", this, 1000);
                return;
            }
        }

        selectedDateList = [];

        for (let day = 0; day < weekData.length; day++) {
            if (parseInt(e.currentTarget.id) === weekData[day].id) {
                weekData[day].selected = !weekData[day].selected;
            }
            // 将选中的加入日期选中列表
            if (weekData[day].selected) {
                selectedDateList.push(weekData[day].id);
            }
        }

        console.log("selectedDateList:", selectedDateList);

        // 如果这天有计划，则只选中这天的部位
        // 先得到这天的部位
        let selectedPartNames = [];
        let partList = this.data.partList;

        app.currentPlan.setPlanParts();
        if (app.currentPlan.circleDaySet.length > 0) {
            for (let day of selectedDateList) {
                for (let partName of app.currentPlan.getPlanPartArrayByDay(day)) {
                    for (let part of partList) {
                        if (part.name === partName) {
                            part.selected = true;
                        }
                    }
                }
            }
        }

        // console.log("partList:", partList);

        let body = this.data.body;

        for (let part of partList) {
            if (part.selected)
                selectedPartNames.push(part.name);
        }

        console.log("selectedPartNames:", selectedPartNames);

        body.unSelectAllActions();
        body.selectPartsByName(selectedPartNames);

        // this.initPartTab();
        // // 刷新其他tab数据，防止用户直接跳转到预览，造成数据未选的假象
        // this.initActionTab();

        this.setData({
            selectedDateList: selectedDateList,
            selectedPartNames: selectedPartNames,
            weekData: weekData,
            partList: partList,
            body: body
        });
    },

    /**
     * 选择动作tab
     * 响应部位导航的选择
     * @param e
     */
    onSelectPartTab: function (e) {
        console.log(e);
        console.log("Selected part: ", e.currentTarget.id);
        let body = this.data.body;
        let partList = this.data.partList;

        let activePartName = e.currentTarget.id;

        body.activePartByName(activePartName);

        for (let part of partList) {
            part.active = (part.name === activePartName);
        }

        this.setData({
            body: body,
            partList: partList
        });

    },

    /**
     * 选择动作tab
     * 响应动作选择
     * @param e
     */
    onSelectAction: function (e) {
        console.log("selected action is:", e.currentTarget.id);

        let body = this.data.body;
        let partList = this.data.partList;

        // 如果是自定义动作，跳转页面
        if (e.currentTarget.id === "自定义动作") {
            console.log("go to custom");
            wx.navigateTo({
                url: '../custom_actions/custom_actions',
            });
            return;
        }

        body.selectActionByName(e.currentTarget.id);

        for (let part of partList) {
            part.selectedActionCount = body.getActionSelectedCountByPart(part.name);

        }

        this.setData({
            body: body,
            partList: partList
        });

    },

    /**
     * 选择动作tab
     * 响应重量选择
     * @param e
     */
    onChangeQuantity: function (e) {
        console.log("action:", e.currentTarget.dataset.action);

        let body = this.data.body;

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

        body.addGroupSetToAction(selectedAction, groupSet);

        this.setData({
            body: body
        });

    },

    /**
     * 选择动作tab
     * 准备部位的scroll-view，给出默认激活的view
     */
    prepareActionPart: function () {
        let body = this.data.body;
        let partList = this.data.partList;
        let activePartIdx = 0;

        // 清除之前的选中状态，方便动作tab里显示
        for (let idx = 0; idx < body.parts.length; idx++) {
            body.parts[idx].active = false;
        }

        let activePartName = "";
        let hasActivePart = false;
        for (let part of partList) {
            if (!hasActivePart) {
                for (let idx = 0; idx < body.parts.length; idx++) {
                    let thisPartSelectAction = false;
                    let areadlyHadSelection = '';
                    if (body.parts[idx].selected && part.name === body.parts[idx].bodyPart) {
                        for (let action of body.parts[idx].actionSet) {
                            thisPartSelectAction = thisPartSelectAction || action.selected;
                        }

                        // 第一个没选动作的部位，默认激活
                        if (!thisPartSelectAction && part.name !== areadlyHadSelection) {
                            activePartName = body.parts[idx].bodyPart;
                            body.activePartByName(activePartName);
                            console.log("default select:", idx, body.parts[idx].name);
                            hasActivePart = true;
                            break;
                        } else {
                            // 记下这个大的部位，后面比较
                            areadlyHadSelection = part.name;
                        }
                    }
                }
            }
        }

        // // 如果用户都选了，只是简单的切换了页面，那么默认选到第一个动作
        // let hasActivePart = false;
        // for (let idx = 0; idx < body.parts.length; idx++) {
        //     hasActivePart = hasActivePart || body.parts[idx].active;
        // }

        if (!hasActivePart) {
            for (let idx = 0; idx < body.parts.length; idx++) {
                if (body.parts[idx].selected) {
                    activePartName = body.parts[idx].bodyPart;
                    body.activePartByName(activePartName);
                    console.log("here active", idx, body.parts[idx].name);
                    break;
                }
            }
        }

        console.log("activePartName", activePartName);

        // 激活选中的部位
        // 统计一下各部位已经选择的动作数量，方便观察
        body.countSelectedAction();
        for (let part of partList) {
            part.active = (activePartName === part.name);
            part.selectedActionCount = body.getActionSelectedCountByPart(part.name);

        }

        // 准备数量选择的Picker
        // let gpMeasurement = body.getSelectedActionGpMeausement(e.currentTarget.dataset.subpartidx, e.currentTarget.id);
        //
        // this.makeActionPicker(gpMeasurement);

        this.setData({
            selectedPartIdx: activePartIdx,
            partList: partList,
            body: body
        });

    },

    /**
     * 选择动作tab
     * 准备重量选择的picker，每次选动作的时候生成
     */
    makeActionPicker: function (gpMeasurement) {

        // let body = this.data.body;
        //
        // if (!body.hasSelectedPart()) {
        //     console.log("returned!");
        //     return;
        // }

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
     * 选择动作tab
     * 根据已选择的部位，准备动作列表
     */
    prepareActionData: function () {

        let body = this.data.body;

        // 如果已经有计划了，需要根据计划里的内容，给body的数据更新
        if (app.currentPlan.circleDaySet.length > 0) {
            for (let dateIdx of this.data.selectedDateList) {
                for (let exercise of app.currentPlan.circleDaySet[dateIdx].exerciseSet) {
                    body.updateGroupSet(exercise);
                }
            }
        }

        this.setData({
            body: body
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
        app.currentPlan.cycleLength = this.data.cycleLength;

        let body = this.data.body;

        // 必须检查重复，以防用户只是简单的切换了页面，造成重复添加
        let partId = 1;

        // TODO 注意周期改变的情况，将来处理

        let circleDaySet = app.currentPlan.circleDaySet;

        console.log("circleDaySet:", circleDaySet);

        for (let selectedDate of this.data.selectedDateList) {
            let exerciseSet = [];
            for (let part of body.parts) {
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
                        if (exercise.groupSet.length === 0) {
                            continue;
                        }
                        exerciseSet.push(exercise);
                        actionIdx++;
                    }
                }
            }

            circleDaySet[selectedDate].exerciseSet = exerciseSet;
        }

        app.currentPlan.circleDaySet = circleDaySet;

        console.log("app.currentPlan:", app.currentPlan);

        wx.navigateTo({
            url: '../plan_details/plan_details',
        });
    },

    /**
     * 设置时间tab
     * 初始化函数，每次进入该tab时，先调用
     */
    initDateTab: function () {

        let fromDate;
        let toDate;
        let cycleLength;

        // 判断进入的入口，如果是定制新计划，日期用当前日期；如果是修改已有计划，日期则使用计划的日期
        // 如果是现有计划，则显示现有计划的起止日期，否则看是否存有日期，如果没有，则用当前日期
        if (app.makingNewPlan) {
            if (app.planStartDate !== "") {
                fromDate = app.planStartDate;
                toDate = app.planEndDate;
            } else {
                fromDate = app.Util.formatDateToString(new Date());
                toDate = app.Util.getMovedDate(fromDate, true, 30);
            }

            cycleLength = 7;

            if (app.currentPlan.circleDaySet.length === 0) {
                for (let idx = 0; idx < cycleLength; idx++) {
                    app.currentPlan.circleDaySet.push(new PlanSet.CircleDay(idx, this.data.weekData[idx].name));
                }
            }
        } else {
            if (app.currentPlan.fromDate !== "") {
                fromDate = app.currentPlan.fromDate;
                toDate = app.currentPlan.toDate;
            } else {
                fromDate = app.Util.formatDateToString(new Date());
                toDate = app.Util.getMovedDate(fromDate, true, 30);
            }

            cycleLength = app.currentPlan.cycleLength === 0 ? 7 : app.currentPlan.cycleLength;
        }


        this.setData({
            fromDate: fromDate,
            toDate: toDate,
            cycleLength: cycleLength,
        });

        this.makeWeekList(this.data.cycleLength, '');

    },

    /**
     * 选择部位tab
     * 初始化函数，每次进入该tab时，先调用
     * 选择部位tab，始终只操作body.partList和weekData，要把逻辑简单化
     * 选择动作tab，才去从这个tab的输出，收集输入
     */
    initPartTab: function () {
        console.log("initPartTab call");
        // 这里要分入口，第一次进入，直接调用系统的，否则使用已经保存的
        let body = this.data.body;

        // 进行标注
        // 进行判断，如果是继续制定计划，那么之前的计划，已经保存了，这里刷新一下数据，如果不是，则不用刷新
        // 这个地方应该根据已经保存的plan来显示

        // 获取当前已保存已经保存的计划
        let planSet = app.Util.loadData(app.StorageType.PlanSet);
        let currentPlan;

        // 寻找激活的计划
        for (let plan of planSet) {
            if (plan.currentUse) {
                currentPlan = plan;
                break;
            }
        }

        this.setData({
            body: body
        });
    },

    /**
     * 选择动作tab
     * 初始化函数，每次进入该tab时，先调用
     */
    initActionTab: function () {
        if (app.lastPlanSaved) {
            this.data.selectedDateList = [];
            this.data.body.unSelectAllActions();
        }

        this.prepareActionData();
        this.prepareActionPart();

    },

    /**
     * 初始化每天的部位与动作
     */
    initPartAction: function () {
        console.log("initPartAction call");
        // 这里要分入口，第一次进入，直接调用系统的，否则使用已经保存的
        // let body = this.data.body;
        let body = new Body.Body();

        let systemSetting = app.Util.loadData(app.StorageType.SystemSetting);
        body.cloneDataFrom(systemSetting.body);
        // 第一次进入，没有选过动作，需要重新构建，先统一赋值
        body.initGroupSet();

        // 添加两个临时属性
        for (let part of body.parts) {
            part.active = false;
            part.selectedActionCount = 0;
        }

        let partList = [];
        let partNameArray = body.getPartNameArray();
        for (let partName of partNameArray) {
            for (let part of body.parts) {
                if (partName === part.bodyPart) {
                    partList.push({
                        name: partName,
                        imageUrl: part.imageUrl,
                        selectedActionCount: 0,
                        active: false,
                        selected: false
                    });
                    break;
                }
            }
        }


        // 进行标注
        // 进行判断，如果是继续制定计划，那么之前的计划，已经保存了，这里刷新一下数据，如果不是，则不用刷新
        // 这个地方应该根据已经保存的plan来显示

        // 获取当前已保存已经保存的计划
        let planSet = app.Util.loadData(app.StorageType.PlanSet);
        let currentPlan;

        // 寻找激活的计划
        for (let plan of planSet) {
            if (plan.currentUse) {
                currentPlan = plan;
                break;
            }
        }

        console.log("after initGroupSet:", body);

        this.setData({
            body: body
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
        // 只需要这一次
        this.makeActionPicker();


        wx.setNavigationBarTitle({
            title: '定制我的锻炼计划',
        });

        this.initDatePartList();

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

        this.initDateTab();
        this.initPartTab();
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
// pages/plan/user_define/select_part.js
import PlanSet from '../../../datamodel/PlanSet'
import Body from '../../../datamodel/Body'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabData: [
            {
                type: "date",
                name: "设定时间",
                finished: false
            },

            {
                type: "bodypart",
                name: "选择部位",
                finished: false
            },
            {
                type: "actions",
                name: "选择动作",
                finished: false
            }
        ],
        currentTabIdx: 0,
        allTabFinished: false,
        firstTimeIn: true,

        // 时间tab的数据
        startDate: "",
        endDate: "",
        cycleLength: 7,
        cycleLengthIndex: 6,
        cycleLengthPickerArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],

        // 部位tab的数据
        body: '',
        selectedPartNames: '',
        weekList: [],
        selectedDateList: [],

        // 动作tab的数据
        selectedPartIdx: 0,
        selectedActionIdx: 0,

        search: {
            searchValue: '',
            showClearBtn: false
        },
        searchResult: [],

        partNameArray: [],

        actionNoMultiArray: [], // 3D 数组，用来存放动作组数，次数和重量
        multiActionNoIndex: [5, 9, 0, 19, 0],  // 数量选择索引
        plan: '',
    },

    /**
     * 设定时间tab
     * 根据选项生成日期列表。
     * @param cycleLength
     * @param part
     * @returns {Array}
     */
    makeWeekList: function (cycleLength, part) {
        // 暂时只想到了这个办法，给weekList加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。

        let week = [];
        let weekList = [];

        // 准备选择列表
        // 七天是比较特殊的天，正好是一周，为了好理解，区分显示
        if (cycleLength === 7) {
            week = [
                {id: 0, value: '日', currpart: part, hasparts: '', selected: false},
                {id: 1, value: '一', currpart: part, hasparts: '', selected: false},
                {id: 2, value: '二', currpart: part, hasparts: '', selected: false},
                {id: 3, value: '三', currpart: part, hasparts: '', selected: false},
                {id: 4, value: '四', currpart: part, hasparts: '', selected: false},
                {id: 5, value: '五', currpart: part, hasparts: '', selected: false},
                {id: 6, value: '六', currpart: part, hasparts: '', selected: false}
            ];

            // 周期下添加标注
            for (let idx = 0; idx < 7; idx++) {

                if (app.currentPlan.trainDatas.length > 0) {
                    let partArr = [];
                    for (let partSet of app.currentPlan.trainDatas[idx].partSets) {
                        partArr.push(partSet.name);

                    }
                    week[idx].hasparts = app.Util.makePartString(partArr);
                }

                // 如果是直接退回来，没有保存的状态，需要标注已经选择的日期
                if (!app.lastPlanSaved && this.data.selectedDateList.length > 0
                    && this.data.selectedDateList.includes(idx)) {
                    week[idx].selected = true;
                }
            }

            weekList.push(week);

        } else {
            for (let index = 0; index < Math.ceil(cycleLength / 7); index++) {
                week = [];
                for (let idx = 0; idx < 7 && (index * 7 + idx) < cycleLength; idx++) {
                    let partArr = [];
                    if (app.currentPlan.trainDatas.length > 0) {
                        for (let partSet of app.currentPlan.trainDatas[index * 7 + idx].partSets) {
                            partArr.push(partSet.name);
                        }
                    }

                    week.push(
                        {
                            id: index * 7 + idx,
                            value: index * 7 + idx + 1,
                            currpart: part,
                            hasparts: app.Util.makePartString(partArr),
                            selected: false
                        }
                    );
                }

                weekList.push(week);
            }
        }

        console.log("weekList: ", weekList);


        this.setData({
            weekList: weekList,

        });


    },

    /**
     * 设定时间tab
     * 显示更改的日期，日期最早的时间点在Picker中设定了，无需判断过期这种情况。
     * 当修改了周期的天数，如果周期缩短，涉及到对已选择动作的修改，需要提示用户，是否放弃之前的动作计划。
     * 如果周期变长，没有变化，重新生成weekList即可。
     * @param e
     */
    onDatePickerChange: function (e) {
        switch (e.currentTarget.id) {
            case "start":
                this.setData({
                    startDate: e.detail.value,
                    endDate: app.Util.getMovedDate(e.detail.value, true, 30)
                });
                break;
            case "end":
                this.setData({
                    endDate: e.detail.value
                });
                break;
            case "cycle":
                let cycleLength = parseInt(e.detail.value) + 1;
                let makeWeekList = true;

                if (app.currentPlan.trainDatas.length > cycleLength) {
                    wx.showModal({
                        title: '确定缩短周期？',
                        content: '缩短周期后，超出现有周期的部分将丢失！',
                        success: function (res) {
                            if (res.confirm) {
                                makeWeekList = true;
                            } else if (res.cancel) {
                                makeWeekList = false;
                            }
                        }
                    });
                }

                if (makeWeekList) {
                    if (app.currentPlan.trainDatas.length > cycleLength) {
                        app.currentPlan.trainDatas.splice(cycleLength, app.currentPlan.trainDatas.length - cycleLength);
                    } else {
                        for (let idx = 0; idx < cycleLength - app.currentPlan.trainDatas.length; idx++) {
                            app.currentPlan.trainDatas.push(new PlanSet.TrainData(idx));
                        }
                    }

                    this.setData({
                        cycleLength: cycleLength
                    });

                }
                break;
            default:
                break;
        }

        console.log(app.currentPlan.trainDatas);

        this.makeWeekList(this.data.cycleLength, "");

        // 每次改变输入的，进行条件检查
        this.validateTab(0);

    },

    /**
     * 页面总体控制函数，根据当前的输入，判断该页面是否属于合理输入状态，并且设置状态
     * @param tabIdx
     */
    validateTab: function (tabIdx) {
        let tabData = this.data.tabData;
        switch (tabIdx) {
            case 0:
                tabData[0].finished =
                    app.Util.datesDistance(this.data.startDate, this.data.endDate) >= this.data.cycleLength;
                break;
            case 1:
                tabData[1].finished = this.data.body.partSelected() && this.data.selectedDateList.length > 0;
                break;
            case 2:
                tabData[2].finished = this.data.body.allActionsSelected();
                break;
            default:
                break;

        }

        this.setData({
            tabData: tabData,
            allTabFinished: tabData[0].finished && tabData[1].finished && tabData[2].finished
        });
    },

    /**
     * 选择动作tab
     * 响应周期列表点击的效果
     * @param e
     */
    onSelectDate: function (e) {
        let weekList = this.data.weekList;
        let selectedDateList = [];
        let selectedDateIdx = parseInt(e.currentTarget.id);
        console.log(selectedDateIdx);

        // 如果多选，判断之前选中的天是否有计划
        // 如果是同样的计划（之前同批次制定的）则可以选，如果有不让多选，弹出Toast提示
        console.log(app.currentPlan.trainDatas.length > 0, this.data.selectedDateList.length > 0
            , this.data.selectedDateList.indexOf(selectedDateIdx) === -1);
        if (app.currentPlan.trainDatas.length > 0 && this.data.selectedDateList.length > 0
            && this.data.selectedDateList.indexOf(selectedDateIdx) === -1) {
            let hasPlanCount = 0;
            selectedDateList = this.data.selectedDateList.concat([selectedDateIdx]);
            console.log("list:", selectedDateList);
            for (let item of selectedDateList) {
                if (app.currentPlan.trainDatas[item].partSets.length > 0)
                    hasPlanCount++;
            }

            // 当有计划数超过一时，即提示
            if (hasPlanCount > 1) {
                app.Util.showNormalToast("不可同时修改两天的计划~~", this, 1000);
                return;
            }
        }

        selectedDateList = [];

        for (let week = 0; week < weekList.length; week++) {
            for (let day = 0; day < weekList[week].length; day++) {
                if (parseInt(e.currentTarget.id) === weekList[week][day].id) {
                    weekList[week][day].selected = !weekList[week][day].selected;
                }
                // 将选中的加入日期选中列表
                if (weekList[week][day].selected) {
                    selectedDateList.push(weekList[week][day].id);
                }
            }
        }

        console.log("selectedDateList:", selectedDateList);

        // 如果这天有计划，则只选中这天的部位
        // 先得到这天的部位
        let selectedPartNames = [];
        if (app.currentPlan.trainDatas.length > 0) {
            for (let item of selectedDateList) {
                for (let partSet of app.currentPlan.trainDatas[item].partSets) {
                    if (selectedPartNames.indexOf(partSet.name) === -1) {
                        selectedPartNames.push(partSet.name);
                    }
                }
            }
        }

        console.log("selectedPartNames:", selectedPartNames);

        let body = this.data.body;

        if (selectedPartNames.length === 0) {
            body.unSelectAllParts();

        } else {
            body.selectPartsByName(selectedPartNames);
        }

        // this.initPartTab();
        // // 刷新其他tab数据，防止用户直接跳转到预览，造成数据未选的假象
        // this.initActionTab();

        this.setData({
            selectedDateList: selectedDateList,
            selectedPartNames: selectedPartNames,
            weekList: weekList,
            body: body
        });

        this.validateTab(1);
    },

    /**
     * 选择部位tab
     * 当部位点击时，取反其选中状态，同时更新选中列表，用于动作选择
     * @param e
     */
    onSelectPartItem: function (e) {
        let body = this.data.body;

        // 置状态
        body.selectPartById(e.currentTarget.id);

        this.setData({
            body: body

        });

        this.validateTab(1);
    },

    onCancelPart: function (e) {
        console.log(e);
        let body = this.data.body;

        // 置状态
        body.unSelectPartById(e.currentTarget.id);

        this.setData({
            body: body

        });

        this.validateTab(1);
    },

    onAddPart: function (e) {
        console.log(e.detail.value);
        let body = this.data.body;
        let selectedPartIdx = parseInt(e.detail.value);
        console.log("Select Part:", e.detail.value, this.data.partNameArray[selectedPartIdx]);

        // for (let part of body.partList) {
        //     if (this.data.partNameArray[selectedPartIdx] ===part.partName) {
        //         part.selected = true;
        //         break;
        //     }
        // }

        // 置状态
        body.selectPartByName(this.data.partNameArray[selectedPartIdx]);

        this.setData({
            body: body

        });

        this.validateTab(1);
    },

    /**
     * 选择动作tab
     * 响应部位导航的选择
     * @param e
     */
    onSelectPartTab: function (e) {
        console.log("Selected: ", e.currentTarget.id);
        let body = this.data.body;

        body.activePartByName(e.currentTarget.id);

        this.setData({
            body: body
        });

        this.validateTab(2);
    },

    /**
     * 选择动作tab
     * 响应动作选择
     * @param e
     */
    onSelectAction: function (e) {
        console.log("subPartIdx:", e.currentTarget.dataset.subpartidx, "action is:", e.currentTarget.id);

        let body = this.data.body;

        // 如果是自定义动作，跳转页面
        if (e.currentTarget.id === "自定义动作") {
            console.log("go to custom");
            wx.navigateTo({
                url: './custom_actions',
            });
            return;
        }

        let subPartIdx = e.currentTarget.dataset.subpartidx;

        body.selectAction(subPartIdx, e.currentTarget.id);

        this.setData({
            body: body
        });

        this.validateTab(2);
    },

    /**
     * 选择动作tab
     * 响应重量选择
     * @param e
     */
    onNumberChange: function (e) {
        console.log("subPartIdx:", e.currentTarget.dataset.subpartidx, "action is:", e.currentTarget.id);

        let body = this.data.body;

        let selectedRowArr = e.detail.value;

        // 获取当前页面用户的输入
        let planGpCount = parseInt(this.data.actionNoMultiArray[0][selectedRowArr[0]]);
        let planCount = parseInt(this.data.actionNoMultiArray[1][selectedRowArr[1]]);
        let planGpMeasurement = this.data.actionNoMultiArray[2][selectedRowArr[2]];
        let planWeight = parseInt(this.data.actionNoMultiArray[3][selectedRowArr[3]]);
        let measurement = this.data.actionNoMultiArray[4][selectedRowArr[4]];

        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount, planGpMeasurement, +planWeight, measurement);

        let groupSet = [];
        for (let idx = 0; idx < planGpCount; idx++) {
            groupSet.push(new PlanSet.GroupSet(idx + 1, planCount, measurement, planWeight));
        }

        let subPartIdx = e.currentTarget.dataset.subpartidx;
        let selectedActionIdx = e.currentTarget.id - 1;

        body.addGroupSetToAction(subPartIdx, selectedActionIdx, groupSet);

        this.setData({
            body: body
        });

        this.validateTab(2);
    },

    /**
     * 选择动作tab
     * 准备部位的scroll-view，给出默认激活的view
     */
    prepareActionPart: function () {
        let body = this.data.body;
        let activePartIdx = 0;

        // 清除之前的选中状态，方便动作tab里显示
        for (let idx = 0; idx < body.partList.length; idx++) {
            body.partList[idx].active = false;
        }

        for (let idx = 0; idx < body.partList.length; idx++) {
            if (body.partList[idx].selected) {
                let thisPartSelectAction = false;
                for (let subPart of body.partList[idx].subParts) {
                    for (let action of subPart.actionList) {
                        thisPartSelectAction = thisPartSelectAction || action.actionSelected;
                    }
                }

                // 第一个没选动作的部位，默认激活
                if (!thisPartSelectAction) {
                    activePartIdx = idx;
                    body.partList[idx].active = true;
                    console.log("here", idx, body.partList[idx].partName);
                    break;
                }
            }
        }

        // 如果用户都选了，只是简单的切换了页面，那么默认选到第一个动作
        let hasActivePart = false;
        for (let idx = 0; idx < body.partList.length; idx++) {
            hasActivePart = hasActivePart || body.partList[idx].active;
        }

        if (!hasActivePart) {
            activePartIdx = 0;
            for (let idx = 0; idx < body.partList.length; idx++) {
                if (body.partList[idx].selected) {
                    body.partList[idx].active = true;
                    console.log("here active", idx, body.partList[idx].partName);
                    break;
                }
            }
        }

        // 统计一下各动作已经选择的数量，方便观察
        body.countSelectedAction();

        // 准备数量选择的Picker
        // let gpMeasurement = body.getSelectedActionGpMeausement(e.currentTarget.dataset.subpartidx, e.currentTarget.id);
        //
        // this.makeActionPicker(gpMeasurement);

        this.setData({
            selectedPartIdx: activePartIdx,
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
        // if (!body.partSelected()) {
        //     console.log("returned!");
        //     return;
        // }

        let actionNoMultiArray = [];

        let array0 = [];    // 组数
        let array1 = [];    // 每组记数
        let array2 = ["次", "分钟"];    // 每组单位
        let array3 = [];    // 每组重量
        let array4 = ["Kg", "Lbs", "Km", "百米", "个"];

        for (let idx = 0; idx < 200; idx++) {
            array0.push((idx + 1) + "组");
            array1.push((idx + 1));
            array3.push((idx + 1));
        }

        actionNoMultiArray.push(array0);
        actionNoMultiArray.push(array1);
        actionNoMultiArray.push(array2);
        actionNoMultiArray.push(array3);
        actionNoMultiArray.push(array4);

        this.setData({
            actionNoMultiArray: actionNoMultiArray,
        });
    },

    /**
     * 选择动作tab
     * 根据已选择的部位，准备动作列表
     */
    prepareActionData: function () {

        let body = this.data.body;

        // 如果已经有计划了，需要根据计划里的内容，给body的数据更新
        if (app.currentPlan.trainDatas.length > 0) {
            console.log("has plan, init with plan data");
            for (let dateIdx of this.data.selectedDateList) {
                for (let partSet of app.currentPlan.trainDatas[dateIdx].partSets) {
                    body.updateGroupSet(partSet);
                }
            }
        }

        this.setData({
            body: body
        });

    },

    /**
     * 页面总体控制
     * 滑动切换tab
     */
    onSwiperChange: function (e) {
        // console.log("swipe to tab:", e.detail.current);
        this.switchTab(e.detail.current);
    },

    /**
     * 页面总体控制
     * tab切换的具体函数
     */
    switchTab: function (tabIdx) {
        switch (tabIdx) {
            case 0:
                break;
            case 1:
                this.initPartTab();
                // 刷新其他tab数据，防止用户直接跳转到预览，造成数据未选的假象
                this.initActionTab();
                break;
            case 2:
                this.initActionTab();
                break;
            default:
                return;
        }

        this.setData({
            currentTabIdx: tabIdx,
        });
    },

    /**
     * 页面总体控制
     * 所有选项都已选择，进入下一步预览计划
     * @param e
     */
    onPreview: function (e) {
        // 准备Plan的数据
        app.currentPlan.startDate = this.data.startDate;
        app.currentPlan.endDate = this.data.endDate;
        app.currentPlan.cycleLength = this.data.cycleLength;

        let body = this.data.body;

        // 必须检查重复，以防用户只是简单的切换了页面，造成重复添加
        let partId = 1;

        let trainDatas = [];

        // TODO 注意周期改变的情况，将来处理

        trainDatas = app.currentPlan.trainDatas;

        console.log("trainDatas:", trainDatas);

        for (let selectedDate of this.data.selectedDateList) {
            let partSets = [];
            for (let part of body.partList) {
                if (part.selected) {
                    // 生成一个部位
                    let partSet = new PlanSet.PartSet(partId, part.partName);
                    partSet.description = part.partDescription;
                    partSet.imageUrl = part.partPictureSrc;
                    partSet.trainDates = this.data.selectedDateList;

                    // 当点中的时候，就算是计划中的元素
                    // 搜索所有选中的动作，生成actionSet
                    let actionIdx = 1;
                    for (let subPart of part.subParts) {
                        for (let action of subPart.actionList) {
                            if (action.actionSelected) {
                                // 生成一个动作
                                let actionSet = new PlanSet.ActionSet();
                                actionSet.id = actionIdx;
                                actionSet.name = action.actionName;
                                actionSet.description = action.actionDescription;
                                actionSet.imageUrl = action.actionPictureSrc;
                                actionSet.trainDates = this.data.selectedDateList;

                                actionSet.groupSets = action.groupSets;
                                partSet.actionSets.push(actionSet);
                                actionIdx++;
                            }
                        }
                    }

                    // 如果没选动作，就不加呗
                    if (partSet.actionSets.length === 0) {
                        continue;
                    }
                    partSets.push(partSet);
                }
            }

            trainDatas[selectedDate].partSets = partSets;
        }

        app.currentPlan.trainDatas = trainDatas;

        console.log("app.currentPlan:", app.currentPlan);

        wx.navigateTo({
            url: './preview_plan',
        });
    },

    /**
     * 设置时间tab
     * 初始化函数，每次进入该tab时，先调用
     */
    initDateTab: function () {

        let startDate;
        let endDate;
        let cycleLength;

        // 判断进入的入口，如果是定制新计划，日期用当前日期；如果是修改已有计划，日期则使用计划的日期
        // 如果是现有计划，则显示现有计划的起止日期，否则看是否存有日期，如果没有，则用当前日期
        if (app.makingNewPlan) {
            if (app.planStartDate !== "") {
                startDate = app.planStartDate;
                endDate = app.planEndDate;
            } else {
                startDate = app.Util.formatDateToString(new Date());
                endDate = app.Util.getMovedDate(startDate, true, 30);
            }

            cycleLength = 7;

            if (app.currentPlan.trainDatas.length === 0) {
                for (let idx = 0; idx < cycleLength; idx++) {
                    trainDatas.push(new PlanSet.TrainData(cycleLength));
                }
            }
        } else {
            if (app.currentPlan.startDate !== "") {
                startDate = app.currentPlan.startDate;
                endDate = app.currentPlan.endDate;
            } else {
                startDate = app.Util.formatDateToString(new Date());
                endDate = app.Util.getMovedDate(startDate, true, 30);
            }

            cycleLength = app.currentPlan.cycleLength === 0 ? 7 : app.currentPlan.cycleLength;
        }


        this.setData({
            startDate: startDate,
            endDate: endDate,
            cycleLength: cycleLength,
        });

        this.makeWeekList(this.data.cycleLength, "");

        this.validateTab(0);
    },

    /**
     * 选择部位tab
     * 初始化函数，每次进入该tab时，先调用
     * 选择部位tab，始终只操作body.partList和weekList，要把逻辑简单化
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
        let planSet = app.Controller.loadData(app.StorageType.PlanSet);
        let currentPlan;

        // 寻找激活的计划
        for (let plan of planSet) {
            if (plan.currentUse) {
                currentPlan = plan;
                break;
            }
        }

        // 当有计划内容时，进行标注和重排序
        // if (typeof currentPlan !== "undefined" && currentPlan.trainDatas.length > 0) {
        //
        //     // 如果是保存后退到此页面，则清理掉选项
        //     if (app.lastPlanSaved) {
        //         body.unSelectAllActions();
        //     }
        //
        //     // 如果之前的计划有这个部位了，标注出来
        //     for (let partSet of currentPlan.partSets) {
        //         body.makeLabel(partSet, currentPlan.cycleLength);
        //     }
        //
        //     body.sortListByDate();
        //
        // }

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
        this.validateTab(0);
        this.validateTab(1);
        this.validateTab(2);
        this.prepareActionPart();
        this.prepareActionData();
    },

    /**
     * 生命周期函数--监听页面加载
     * 页面进入时，初始化一些数据
     */
    onLoad: function (options) {
        console.log("Select Part Page onLoad");
        // 只需要这一次
        this.makeActionPicker();

        let body = new Body.Body();
        let systemSetting = app.Controller.loadData(app.StorageType.SystemSetting);
        body.partList = app.Util.deepClone(systemSetting.body.partList);
        // 第一次进入，没有选过动作，需要重新构建，先统一赋值
        body.initGroupSet();

        // 添加两个临时属性
        for (let part of body.partList) {
            part.active = false;
            part.selectedActionCount = 0;
        }

        let partNameArray = [];

        for (let part of body.partList) {
            partNameArray.push(part.partName);
        }

        wx.setNavigationBarTitle({
            title: '定制我的锻炼计划',
        });

        this.setData({
            body: body,
            partNameArray: partNameArray
        });

        console.log("partNameArray:", this.data.partNameArray);
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
            this.setData({
                currentTabIdx: 0
            });
            // 重置为没保存的状态
            app.lastPlanSaved = false;
        }

        console.log("weekList:", this.data.weekList);

    },

    /**
     * 保存善后
     */
    saveSession: function () {
        app.planStartDate = this.data.startDate;
        app.planEndDate = this.data.endDate;
    },

    /**
     * 生命周期函数--监听页面隐藏
     *
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
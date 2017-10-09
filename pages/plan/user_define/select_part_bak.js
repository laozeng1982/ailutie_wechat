// pages/plan/user_define/select_part.js
import Plan from '../../../datamodel/PlanSet.js'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabData: [
            {
                type: "date",
                name: "1、设定时间",
                finished: false
            },

            {
                type: "bodypart",
                name: "2、选择部位",
                finished: false
            },
            {
                type: "actions",
                name: "3、选择动作",
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

        allPickerSelected: false,
        weekList: [],
        selectedDateList: [],

        // 部位tab的数据
        partList: [],

        // 动作tab的数据
        selectedPartList: [],
        selectedPartIdx: 0,
        selectedActionIdx: 0,
        toView: '',

        search: {
            searchValue: '',
            showClearBtn: false
        },
        searchResult: [],

        actionNoMultiArray: [], // 3D 数组，用来存放动作组数，次数和重量
        multiActionNoIndex: [5, 9, 19, 0],  // 数量选择索引
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

            for (let idx = 0; idx < 7; idx++) {
                let partArr = [];
                for (let partSet of app.currentPlan.partSet) {
                    if (partSet.trainDate.includes(idx)) {
                        partArr.push(partSet.name);
                    }
                }
                week[idx].hasparts = app.Util.makePartString(partArr);

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
                    for (let partSet of app.currentPlan.partSet) {
                        if (partSet.trainDate.includes(index * 7 + idx)) {
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
                // if (cycleLength < this.data.cycleLength) {
                //     wx.showModal({
                //         title: '确定缩短周期？',
                //         content: '缩短周期后，原计划超出现有周期的部分将不可用。',
                //         success: function (res) {
                //             if (res.confirm) {
                //                 makeWeekList = true;
                //             } else if (res.cancel) {
                //                 makeWeekList = false;
                //             }
                //         }
                //     });
                // } else {
                //     makeWeekList = true;
                // }

                if (makeWeekList) {
                    this.setData({
                        cycleLength: cycleLength
                    });
                }
                break;
            default:
                break;
        }

        this.makeWeekList(this.data.cycleLength, "");

        // 每次改变输入的，进行条件检查
        this.validateTab(0);


    },

    /**
     * 页面总体控制函数，根据当前的输入，判断该页面是否属于合理输入状态，如果是，设置状态
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
                tabData[1].finished =
                    this.data.selectedPartList.length > 0 &&
                    this.data.selectedDateList.length > 0;
                break;
            case 2:
                let selectedPartList = this.data.selectedPartList;
                let allActionSelected = this.data.selectedPartList.length > 0;

                for (let part of selectedPartList) {
                    let thisPartActionSelected = false;
                    for (let subPart of part.subParts) {
                        for (let action of subPart.actionList) {
                            thisPartActionSelected = thisPartActionSelected || action.actionSelected;
                        }
                    }

                    part.checked = thisPartActionSelected;

                    allActionSelected = allActionSelected && thisPartActionSelected;
                }

                tabData[2].finished = allActionSelected;
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
     * 设定时间tab
     * 响应周期列表点击的效果
     * @param e
     */
    onSelectDate: function (e) {
        // console.log(e);
        // console.log(e.currentTarget.dataset.date.value);
        let weekList = this.data.weekList;
        let selectedDateList = [];

        for (let week = 0; week < weekList.length; week++) {
            for (let day = 0; day < weekList[week].length; day++) {
                if (parseInt(e.currentTarget.id) === weekList[week][day].id) {
                    weekList[week][day].selected = !weekList[week][day].selected;
                }
                if (weekList[week][day].selected) {
                    selectedDateList.push(weekList[week][day].id);
                }
            }
        }

        console.log("selectedDateList:", selectedDateList);

        // 如果这天有计划，则只选中这天的部位
        // 先得到这天部位
        let selectedPartNames = [];
        if (app.currentPlan.partSet.length > 0) {
            for (let item of selectedDateList) {
                for (let partSet of app.currentPlan.partSet) {
                    if (partSet.trainDate.indexOf(item) !== -1 && selectedPartNames.indexOf(partSet.name) === -1) {
                        selectedPartNames.push(partSet.name);
                    }
                }
            }
        }

        console.log(selectedPartNames);

        let partList = this.data.partList;

        for (let part of partList) {
            if (selectedPartNames.length > 0) {
                if (selectedPartNames.includes(part.partName)) {
                    part.selected = true;
                }
            } else {
                part.selected = false;
            }
        }

        this.setData({
            selectedDateList: selectedDateList,
            weekList: weekList,
            partList: partList
        });

        this.validateTab(1);
    },

    /**
     * 选择部位tab
     * 当部位点击时，取反其选中状态，同时更新选中列表，用于动作选择
     * @param e
     */
    onSelectPartItem: function (e) {
        let partList = this.data.partList;
        let selectedPartList = this.data.selectedPartList;
        for (let idx = 0; idx < partList.length; idx++) {
            if (parseInt(e.currentTarget.id) === parseInt(partList[idx].partId)) {
                partList[idx].selected = !partList[idx].selected;
                break;
            }
        }

        // 第一次进来，部位选择列表为空，直接根据选中状态获取选择的部位
        if (selectedPartList.length === 0) {
            for (let item of partList) {
                if (item.selected) {
                    selectedPartList.push(item);
                }
            }
        } else {
            // 部位选择列表不为空时，需要通过判断，更新选择的部位
            // 1、准备已经选择的数据
            let partNameList = [];
            for (let item of selectedPartList) {
                partNameList.push(item.partName);
            }
            // 2、重新整理，如果已有的被取消，则删除，如果重复的，则不添加
            for (let item of partList) {
                if (item.selected) {
                    if (partNameList.indexOf(item.partName) === -1) {
                        selectedPartList.push(item);
                    }
                } else {
                    for (let idx = 0; idx < selectedPartList.length; idx++)
                        if (selectedPartList[idx].partName === item.partName) {
                            selectedPartList.splice(idx, 1);
                        }
                }
            }

        }

        this.setData({
            partList: partList,
            selectedPartList: selectedPartList
        });

        this.validateTab(1);

        console.log("selectedPartList:", this.data.selectedPartList);
    },

    /**
     * 选择动作tab
     * 响应部位导航的选择
     * @param e
     */
    onSelectPartTab: function (e) {
        console.log("Selected: ", e.currentTarget.id);
        let selectedPartList = this.data.selectedPartList;
        let selectedPartIdx = -1;

        for (let idx = 0; idx < selectedPartList.length; idx++) {
            selectedPartList[idx].selected = false;
            if (e.currentTarget.id === selectedPartList[idx].partName) {
                selectedPartIdx = idx;
                selectedPartList[idx].selected = true;
            }
        }

        this.setData({
            selectedPartIdx: selectedPartIdx,
            selectedPartList: selectedPartList
        });
    },

    /**
     * 选择动作tab
     * 响应动作选择
     * @param e
     */
    onSelectAction: function (e) {
        console.log("subPartIdx:", e.currentTarget.dataset.subpartidx, "action is:", e.currentTarget.id);

        // 如果是自定义动作，跳转页面
        if (e.currentTarget.id === "自定义动作") {
            console.log("go to custom");
            wx.navigateTo({
                url: './custom_actions',
            });
            return;
        }

        let selectedPartList = this.data.selectedPartList;
        let selectedPartIdx = this.data.selectedPartIdx;
        let selectedActionIdx = -1;
        let subPartIdx = e.currentTarget.dataset.subpartidx;

        for (let idx = 0; idx < selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList.length; idx++) {
            if (e.currentTarget.id === selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[idx].actionName) {
                selectedActionIdx = idx;
                selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[idx].actionSelected =
                    !selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[idx].actionSelected;
            }
        }

        // 记选择动作的数量
        for (let part of selectedPartList) {
            let selectedCount = 0;
            for (let subPart of part.subParts) {
                for (let action of subPart.actionList) {
                    if (action.actionSelected) {
                        selectedCount++;
                    }
                }
            }
            part.selectedCount = selectedCount;
        }

        console.log("selectedPartIdx: ", selectedPartIdx, "selectedActionIdx: ", selectedActionIdx);

        this.setData({
            selectedActionIdx: selectedActionIdx,
            selectedPartList: selectedPartList
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

        let selectedRowArr = e.detail.value;

        // 获取当前页面用户的输入
        let planGpCount = parseInt(this.data.actionNoMultiArray[0][selectedRowArr[0]]);
        let planCount = parseInt(this.data.actionNoMultiArray[1][selectedRowArr[1]]);
        let planWeight = parseInt(this.data.actionNoMultiArray[2][selectedRowArr[2]]);
        let measurement = this.data.actionNoMultiArray[3][selectedRowArr[3]];

        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount + "次, ", +planWeight, measurement);

        let selectedPartList = this.data.selectedPartList;

        let groupSet = [];
        for (let idx = 0; idx < planGpCount; idx++) {
            groupSet.push(new Plan.GroupSet(idx + 1, planCount, measurement, planWeight));

        }

        let selectedPartIdx = this.data.selectedPartIdx;
        let subPartIdx = e.currentTarget.dataset.subpartidx;
        let selectedActionIdx = e.currentTarget.id - 1;

        delete selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[selectedActionIdx].groupSet;
        selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[selectedActionIdx].groupSet = groupSet;

        // 因为选中picker同时会响应这个外部view的函数，也就是说会响应onSelectAction，所以需要重置一些状态
        // 重新置为选中，和记数
        selectedPartList[selectedPartIdx].subParts[subPartIdx].actionList[selectedActionIdx].actionSelected = true;

        let allActionSelected = true;
        for (let part of selectedPartList) {
            let thisPartActionSelected = false;
            let selectedCount = 0;
            for (let subPart of part.subParts) {
                for (let action of subPart.actionList) {
                    if (action.actionSelected) {
                        selectedCount++;
                    }
                    thisPartActionSelected = thisPartActionSelected || action.actionSelected;
                }
            }

            part.checked = thisPartActionSelected;
            part.selectedCount = selectedCount;

            allActionSelected = allActionSelected && thisPartActionSelected;
        }

        let tabData = this.data.tabData;
        tabData[2].finished = allActionSelected;

        this.setData({
            tabData: tabData,
            selectedPartList: selectedPartList
        });
    },

    /**
     * 选择动作tab
     * 准备部位的scroll-view，给出默认激活的view
     */
    prepareActionPart: function () {
        let selectedPartList = this.data.selectedPartList;
        let activePartIdx = 0;
        let toView = '';

        // 清除之前的选中状态，方便动作tab里显示
        for (let idx = 0; idx < selectedPartList.length; idx++) {
            selectedPartList[idx].selected = false;
        }

        // console.log("before prepareActionPart, selectedPartList: ", selectedPartList);

        if (selectedPartList.length > 0) {

            for (let idx = 0; idx < selectedPartList.length; idx++) {
                let thisPartSelectAction = false;
                for (let subPart of selectedPartList[idx].subParts) {
                    for (let action of subPart.actionList) {
                        thisPartSelectAction = thisPartSelectAction || action.actionSelected;
                    }
                }

                // 第一个没选动作的部位，默认激活
                if (!thisPartSelectAction) {
                    activePartIdx = idx;
                    selectedPartList[idx].selected = true;
                    toView = selectedPartList[idx].partName;
                    break;
                }
            }

            // 如果用户都选了，只是简单的切换了页面，那么默认选到第一个动作
            let hasActivePart = false;
            for (let idx = 0; idx < selectedPartList.length; idx++) {
                hasActivePart = hasActivePart || selectedPartList[idx].selected;
            }

            if (!hasActivePart) {
                activePartIdx = 0;
                selectedPartList[0].selected = true;
                toView = selectedPartList[0].partName;
                console.log("in prepareActionPart hasActivePart:", hasActivePart);
            }
        }

        this.setData({
            toView: toView,
            selectedPartIdx: activePartIdx,
            selectedPartList: selectedPartList
        });

    },

    /**
     * 选择动作tab
     * 准备重量选择的picker
     */
    prepareActionPicker: function () {

        if (this.data.selectedPartList.length === 0) {
            return;
        }

        let actionNoMultiArray = [];

        let array0 = [];
        let array1 = [];
        let array2 = [];
        let array3 = ["Kg", "Lbs", "Km", "百米", "个"];

        let gpMeasurement;

        for (let idx = 0; idx < 200; idx++) {
            array0.push((idx + 1) + "组");

            gpMeasurement = this.data.selectedActionIdx === ""
                ? this.data.selectedPartList[this.data.selectedPartIdx].subParts[0].actionList[0].actionGpMeasurement
                : this.data.selectedPartList[this.data.selectedPartIdx].subParts[0].actionList[this.data.selectedActionIdx].actionGpMeasurement;

            array1.push((idx + 1) + gpMeasurement);
            // array1.push((idx + 1) + "");
            array2.push((idx + 1));
        }
        actionNoMultiArray.push(array0);
        actionNoMultiArray.push(array1);
        actionNoMultiArray.push(array2);
        actionNoMultiArray.push(array3);

        this.setData({
            actionNoMultiArray: actionNoMultiArray,
        });
    },

    /**
     * 选择动作tab
     * 根据已选择的部位，准备动作列表
     */
    prepareActionData: function () {

        let selectedPartList = this.data.selectedPartList;

        // 这里分两种情况，一是第一次进入，之前没有选过动作，需要重新构建，先统一赋值
        for (let partIdx = 0; partIdx < selectedPartList.length; partIdx++) {
            for (let subPatIdx = 0; subPatIdx < selectedPartList[partIdx].subParts.length; subPatIdx++) {
                for (let actionIdx = 0; actionIdx < selectedPartList[partIdx].subParts[subPatIdx].actionList.length; actionIdx++) {
                    // 临时增加一个数据项，用以保存数据
                    selectedPartList[partIdx].subParts[subPatIdx].actionList[actionIdx].groupSet = [];
                    for (let idx = 0; idx < 6; idx++) {
                        let group = new Plan.GroupSet(idx + 1, 10,
                            selectedPartList[partIdx].subParts[subPatIdx].actionList[actionIdx].actionMeasurement, 30);

                        selectedPartList[partIdx].subParts[subPatIdx].actionList[actionIdx].groupSet.push(group);
                    }
                }
            }
        }

        if (app.currentPlan !== '') {
            for (let partItem of app.currentPlan.partSet) {
                for (let partIdx = 0; partIdx < selectedPartList.length; partIdx++) {
                    if (partItem.name === selectedPartList[partIdx].partName) {
                        for (let actionItem of partItem.actionSet) {
                            for (let subPartIdx = 0; subPartIdx < selectedPartList[partIdx].subParts.length; subPartIdx++) {
                                for (let actionIdx = 0; actionIdx < selectedPartList[partIdx].subParts[subPartIdx].actionList.length; actionIdx++) {
                                    if (actionItem.name === selectedPartList[partIdx].subParts[subPartIdx].actionList[actionIdx].actionName) {
                                        // console.log("match: " + actionItem.name);
                                        selectedPartList[partIdx].subParts[subPartIdx].actionList[actionIdx].actionSelected = true;
                                        delete selectedPartList[partIdx].subParts[subPartIdx].actionList[actionIdx].groupSet;
                                        selectedPartList[partIdx].subParts[subPartIdx].actionList[actionIdx].groupSet = actionItem.groupSet;
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        this.setData({
            selectedPartList: selectedPartList
        });

        // console.log("after prepareActionData, selectedPartList:", this.data.selectedPartList);

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
     * 点击切换tab
     */
    onSwitchNav: function (e) {
        // console.log("clicked tab:", e.target.dataset.current);
        this.switchTab(e.target.dataset.current);
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

        let selectedPartList = this.data.selectedPartList;

        // 必须检查重复，以防用户只是简单的切换了页面，造成重复添加
        let partId = 1;
        for (let part of selectedPartList) {
            // 生成一个部位
            let partSet = new Plan.PartSet(partId, part.partName);
            partSet.description = part.partDescription;
            partSet.imageUrl = part.partPictureSrc;
            partSet.trainDate = this.data.selectedDateList;

            // 当点中的时候，就算是计划中的元素
            let actionIdx = 1;
            for (let subPart of part.subParts)
                for (let action of subPart.actionList) {
                    if (action.actionSelected) {
                        // 生成一个动作
                        let actionSet = new Plan.ActionSet();
                        actionSet.id = actionIdx;
                        actionSet.name = action.actionName;
                        actionSet.description = action.actionDescription;
                        actionSet.imageUrl = action.actionPictureSrc;

                        actionSet.groupSet = action.groupSet;
                        partSet.actionSet.push(actionSet);
                        actionIdx++;
                    }
                }

            // 判断重复
            let hasThisPart = false;
            for (let partSetIdx = 0; partSetIdx < app.currentPlan.partSet.length; partSetIdx++) {
                // 如果有，需要进一步判断，搞清业务逻辑
                // 比较两个部位的锻炼日期列表是否相同
                // 如果日期列表相同，则只能使用这一个动作计划，直接用最新的替换掉；如果不同，则逻辑上是不同天的计划，直接添加即可
                if (app.currentPlan.partSet[partSetIdx].name === partSet.name &&
                    app.Util.compare2Array(app.currentPlan.partSet[partSetIdx].trainDate, partSet.trainDate)) {
                    // 替换
                    app.currentPlan.partSet.splice(partSetIdx, 1, partSet);
                    hasThisPart = true;
                }
            }

            if (!hasThisPart)
                app.currentPlan.partSet.push(partSet);

            partId++;
        }

        console.log("app.currentPlan:", app.currentPlan);

        wx.navigateTo({
            url: './preview_plan',
        });
    },

    /**
     * 初始化设置时间tab
     */
    initDateTab: function () {

        let startDate;
        let endDate;
        let cycleLength;

        // 判断进入的入口，如果是定制新计划，日期用当前日期；如果是修改已有计划，日期则使用计划的日期
        // 如果是现有计划，则显示现有计划的起止日期，否则看是否存有日期，如果没有，则用当前日期
        if (!app.makingNewPlan) {
            if (app.currentPlan.startDate !== "") {
                startDate = app.currentPlan.startDate;
                endDate = app.currentPlan.endDate;
            } else {
                startDate = app.Util.formatDateToString(new Date());
                endDate = app.Util.getMovedDate(startDate, true, 30);
            }

            cycleLength = app.currentPlan.cycleLength === 0 ? 7 : app.currentPlan.cycleLength;
        } else {
            if (app.planStartDate !== "") {
                startDate = app.planStartDate;
                endDate = app.planEndDate;
            } else {
                startDate = app.Util.formatDateToString(new Date());
                endDate = app.Util.getMovedDate(startDate, true, 30);
            }

            cycleLength = 7;
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
     * 初始化选择部位tab
     */
    initPartTab: function () {
        // 这里要分入口，在app中写一个标志位
        let partList;
        if (this.data.partList.length === 0) {
            let systemSetting = app.Controller.loadData(app.StorageType.SystemSetting);
            partList = systemSetting.bodyPartList.partList;
            for (let part of partList) {
                part.selectedCount = 0;
            }
        } else {
            partList = this.data.partList;
        }

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

        // 当有计划内容时，进行标注
        if (typeof currentPlan !== "undefined" && currentPlan.partSet.length > 0) {

            if (app.lastPlanSaved) {
                for (let idx = 0; idx < partList.length; idx++) {
                    partList[idx].selected = false;
                }
            }

            // 如果之前的计划有这个部位了，标注出来
            for (let partSet of currentPlan.partSet) {
                for (let partIdx = 0; partIdx < partList.length; partIdx++) {
                    if (partSet.name === partList[partIdx].partName) {
                        if (currentPlan.cycleLength === 7) {

                            let trainDate = [];
                            for (let date of partSet.trainDate) {
                                switch (date) {
                                    case 0:
                                        trainDate.push("周日");
                                        break;
                                    case 1:
                                        trainDate.push("周一");
                                        break;
                                    case 2:
                                        trainDate.push("周二");
                                        break;
                                    case 3:
                                        trainDate.push("周三");
                                        break;
                                    case 4:
                                        trainDate.push("周四");
                                        break;
                                    case 5:
                                        trainDate.push("周五");
                                        break;
                                    case 6:
                                        trainDate.push("周六");
                                        break;
                                }
                            }
                            partList[partIdx].trainDateArr = partSet.trainDate;
                            partList[partIdx].trainDateStr = "( " + trainDate.join("，") + " )";
                            console.log("partSet.trainDateStr ", partList[partIdx].trainDateStr);
                        } else {
                            // 新建数组，不改变原数组的值
                            let trainDate = [];
                            for (let idx = 0; idx < partSet.trainDate.length; idx++) {
                                trainDate.push(partSet.trainDate[idx] + 1);
                            }
                            partList[partIdx].trainDateArr = partSet.trainDate;
                            partList[partIdx].trainDateStr = "(第 " + trainDate.join("，") + " 天)";
                        }
                    }
                }
            }
        }


        // 重新排序
        let orderPartList = [];
        // 先排没有计划的，放在前面
        for (let part of partList) {
            if (typeof part.trainDateArr === "undefined") {
                // console.log("without plan", part.partName);
                orderPartList.push(part);
            }
        }
        let str = [];
        for (let item of orderPartList) {
            str.push(item.partName);
        }
        console.log(str.toString());
        // 再排有计划的，如果计划有多天，按照第一天谁靠前排序
        for (let part of partList) {
            if (typeof part.trainDateArr !== "undefined" && part.trainDateArr.length > 0) {
                // 默认加在最后
                let insertPos = -1;
                for (let index = 0; index < orderPartList.length; index++) {
                    // 当训练日期列表第一个小于partList列表中某一个trainDate的第一个时，前插

                    if (typeof  orderPartList[index].trainDateArr !== "undefined"
                        && orderPartList[index].trainDateArr.length > 0) {
                        if (app.Util.arr1_IsFront_arr2(part.trainDateArr, orderPartList[index].trainDateArr)) {
                            insertPos = index;
                            break;
                        }
                    }
                }
                if (insertPos === -1) {
                    orderPartList.push(part);
                } else {
                    orderPartList.splice(insertPos, 0, part);
                }

                let str2 = [];
                for (let item of orderPartList) {
                    str2.push(item.partName);
                }

                console.log("insertPos:", insertPos, "orderPartList:", str2.toString());
                // console.log("with plan", part.partName);
            }
        }

        this.setData({
            partList: orderPartList
        });
    },

    /**
     * 初始化选择动作tab
     */
    initActionTab: function () {
        if (app.lastPlanSaved) {
            this.data.selectedDateList = [];
            this.data.selectedPartList = [];
        }
        this.validateTab(0);
        this.validateTab(1);
        this.validateTab(2);
        this.prepareActionPart();
        this.prepareActionPicker();
        this.prepareActionData();
    },

    /**
     * 生命周期函数--监听页面加载
     * 页面进入时，初始化一些数据
     */
    onLoad: function (options) {
        console.log("Select Part Page onLoad");
        wx.setNavigationBarTitle({
            title: '定制我的锻炼计划',
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

        this.initDateTab();
        this.initPartTab();
        this.initActionTab();
        if (app.lastPlanSaved) {
            this.setData({
                currentTabIdx: 1
            });
            // 重置为没保存的状态
            app.lastPlanSaved = false;
        }
        console.log("partList:", this.data.partList);
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
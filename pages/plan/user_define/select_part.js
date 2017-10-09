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
                tabData[1].finished = this.data.body.hasSelectedPart() && this.data.selectedDateList.length > 0;
                break;
            case 2:
                tabData[2].finished = this.data.body.hasSelectAllActions();
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
        // 先得到这天的部位
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

        console.log("selectedPartNames:", selectedPartNames);

        let body = this.data.body;

        body.selectParts(selectedPartNames);
        if (this.data.selectedPartNames.length > 0)
            body.unSelectParts(this.data.selectedPartNames);

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
        body.selectPart(e.currentTarget.id);

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

        body.activePart(e.currentTarget.id);

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

        body.selectActions(subPartIdx, e.currentTarget.id);

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
        // if (!body.hasSelectedPart()) {
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

        // 这里分两种情况，一是第一次进入，之前没有选过动作，需要重新构建，先统一赋值
        console.log("fresh new, init!");
        body.initGroupSet();
        if (app.currentPlan.partSet.length > 0) {
            console.log("has plan, init with plan data");
            for (let partSet of app.currentPlan.partSet) {
                body.updateGroupSet(partSet);
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

        // 必须检查重复，以防用户只是简单的切换了页面，造成重复添加
        let partId = 1;

        let body = this.data.body;

        for (let part of body.partList) {
            if (part.selected) {
                // 生成一个部位
                let partSet = new PlanSet.PartSet(partId, part.partName);
                partSet.description = part.partDescription;
                partSet.imageUrl = part.partPictureSrc;
                partSet.trainDate = this.data.selectedDateList;

                // 当点中的时候，就算是计划中的元素
                let actionIdx = 1;
                for (let subPart of part.subParts)
                    for (let action of subPart.actionList) {
                        if (action.actionSelected) {
                            // 生成一个动作
                            let actionSet = new PlanSet.ActionSet();
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
                    if (app.currentPlan.partSet[partSetIdx].name === partSet.name) {
                        if (app.Util.compare2Array(app.currentPlan.partSet[partSetIdx].trainDate, partSet.trainDate)) {
                            // 替换
                            app.currentPlan.partSet.splice(partSetIdx, 1, partSet);
                            hasThisPart = true;
                        }
                    }
                }

                if (!hasThisPart) {
                    app.currentPlan.partSet.push(partSet);
                }

                partId++;
            }
        }

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
     * 选择部位tab
     * 初始化函数，每次进入该tab时，先调用
     * 选择部位tab，始终只操作body.partList和weekList，要把逻辑简单化
     * 选择动作tab，才去从这个tab的输出，收集输入
     */
    initPartTab: function () {
        console.log("initPartTab call");
        // 这里要分入口，第一次进入，直接调用系统的，否则使用已经保存的
        let body;

        if (this.data.body === '') {
            body = new Body.Body();
            let systemSetting = app.Controller.loadData(app.StorageType.SystemSetting);
            body.partList = app.Util.deepClone(systemSetting.body.partList);

            // 添加两个临时属性
            for (let part of body.partList) {
                part.active = false;
                part.selectedActionCount = 0;
            }

        } else {
            body = this.data.body;
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

        // 当有计划内容时，进行标注和重排序

        if (typeof currentPlan !== "undefined" && currentPlan.partSet.length > 0) {

            // 如果是保存后退到此页面，则清理掉选项
            if (app.lastPlanSaved) {
                body.clearSelection();
            }

            // 如果之前的计划有这个部位了，标注出来
            for (let partSet of currentPlan.partSet) {
                body.makeLabel(partSet, currentPlan.cycleLength);
            }

            body.sortListByDate();

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
            this.data.body.clearSelection();
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
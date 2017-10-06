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
        startDate: "请选择",
        endDate: "请选择",
        period: 6,
        restDays: "请选择",
        dayPickerArray: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        allPickerSelected: false,
        weekList: [],
        selectedDateList: [],

        // 部位tab的数据
        partList: '',

        // 动作tab的数据
        selectedPartList: [],
        selectedPartName: '',
        selectedPartIdx: -1,
        selectedActionIdx: 0,

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
     * 设定时间tab，根据选项生成日期列表。
     * @param period
     * @param restDays
     * @param part
     * @returns {Array}
     */
    makeWeekList: function (period, restDays, part) {
        // 暂时只想到了这个办法，给weekList加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。

        let weekList = [];

        console.log("Math.ceil((period + restDays)/7)", Math.ceil((period + restDays) / 7));

        for (let index = 0; index < Math.ceil((period + restDays) / 7); index++) {
            let week = [];
            for (let idx = 0; idx < 7 && (index * 7 + idx) < (period + restDays); idx++) {
                if (index * 7 + idx < period) {
                    week.push(
                        {
                            id: index * 7 + idx,
                            value: index * 7 + idx + 1,
                            currpart: part,
                            hasparts: '',
                            selected: false
                        }
                    );
                } else {
                    week.push(
                        {
                            id: index * 7 + idx,
                            value: index * 7 + idx + 1,
                            currpart: part,
                            hasparts: '休',
                            selected: false
                        }
                    );
                }
            }
            weekList.push(week);
        }

        console.log("weekList: ", weekList);

        return weekList;
    },

    /**
     * 设定时间tab
     * @param e
     */
    onDatePickerChange: function (e) {
        console.log(e);
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
            case "period":
                let period = parseInt(e.detail.value);
                this.setData({
                    period: period
                });
                break;
            case "rest":
                let restDays = parseInt(e.detail.value);
                this.setData({
                    restDays: restDays
                });
                break;
            default:
                break;
        }

        // 条件检查
        let allPickerSelected = this.data.startDate !== "请选择" && app.Util.dateDirection(this.data.startDate) >= 0
            && this.data.endDate !== "请选择" && app.Util.datesDistance(this.data.startDate, this.data.endDate) >= this.data.period
            && this.data.period !== "请选择" && this.data.restDays !== "请选择";

        if (allPickerSelected) {
            this.setData({
                weekList: this.makeWeekList(this.data.period, this.data.restDays, ""),
                allPickerSelected: allPickerSelected
            });
        }

    },

    /**
     * 设定时间tab
     * @param e
     */
    onSelectDate: function (e) {
        // console.log(e);
        // console.log(e.currentTarget.dataset.date.value);
        let tabData = this.data.tabData;
        let weekList = this.data.weekList;
        let selectedDateList = [];
        let hasSelectedDate = false;

        for (let week = 0; week < weekList.length; week++) {
            for (let day = 0; day < weekList[week].length; day++) {
                if (parseInt(e.currentTarget.id) === weekList[week][day].id
                    && weekList[week][day].hasparts !== "休") {
                    weekList[week][day].selected = !weekList[week][day].selected;
                }
                if (weekList[week][day].selected) {
                    selectedDateList.push(weekList[week][day].value);
                }
                hasSelectedDate = hasSelectedDate || weekList[week][day].selected;
            }
        }

        tabData[0].finished = hasSelectedDate;

        console.log("selectedDateList:", selectedDateList);
        this.setData({
            tabData: tabData,
            selectedDateList: selectedDateList,
            weekList: weekList,
            allTabFinished: tabData[0].finished && tabData[1].finished && tabData[2].finished
        });

    },

    /**
     * 选择部位tab
     * 当部位点击时，取反其选中状态，同时更新选中列表，用于动作选择
     * @param e
     */
    onSelectPart: function (e) {
        let tabData = this.data.tabData;
        let partList = this.data.partList;
        let selectedPartList = [];
        for (let idx = 0; idx < partList.length; idx++) {
            if (parseInt(e.currentTarget.id) === parseInt(partList[idx].partId)) {
                partList[idx].selected = !partList[idx].selected;
                break;
            }
        }

        let hasSelectedPart = false;
        // 获取选择的部位
        for (let item of partList) {
            hasSelectedPart = hasSelectedPart || item.selected;
            if (item.selected) {
                selectedPartList.push(item);
            }
        }

        tabData[1].finished = hasSelectedPart;

        console.log("selectedPartList", selectedPartList);

        this.setData({
            tabData: tabData,
            partList: partList,
            selectedPartList: selectedPartList,
            allTabFinished: tabData[0].finished && tabData[1].finished && tabData[2].finished
        });
    },

    /**
     * 动作选择tab，响应部位导航的选择
     * @param e
     */
    onPartSelected: function (e) {
        console.log(e.currentTarget.id);
        let selectedPartList = this.data.selectedPartList;
        let selectedPartName = '';
        let selectedPartIdx = -1;
        for (let idx = 0; idx < selectedPartList.length; idx++) {
            selectedPartList[idx].selected = false;
            if (e.currentTarget.id === selectedPartList[idx].partName) {
                selectedPartName = e.currentTarget.id;
                selectedPartIdx = idx;
                selectedPartList[idx].selected = true;
            }
        }

        this.setData({
            selectedPartName: selectedPartName,
            selectedPartIdx: selectedPartIdx,
            selectedPartList: selectedPartList
        });
    },

    /**
     * 动作选择tab，响应动作选择
     * @param e
     */
    onSelectAction: function (e) {
        console.log(e.currentTarget.id);


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

        for (let idx = 0; idx < selectedPartList[selectedPartIdx].actionList.length; idx++) {
            if (e.currentTarget.id === selectedPartList[selectedPartIdx].actionList[idx].actionName) {
                selectedActionIdx = idx;
                selectedPartList[selectedPartIdx].actionList[idx].actionSelected =
                    !selectedPartList[selectedPartIdx].actionList[idx].actionSelected;
            }
        }

        let allActionSelected = true;
        let thisPartActionSelected = false;
        let tabData = this.data.tabData;

        for (let part of selectedPartList) {
            for (let action of part.actionList) {
                thisPartActionSelected = thisPartActionSelected || action.actionSelected;
            }
            allActionSelected = allActionSelected && thisPartActionSelected;
        }

        tabData[2].finished = allActionSelected;

        console.log("selectedPartIdx: ", selectedPartIdx, "selectedActionIdx: ", selectedActionIdx);

        this.setData({
            tabData: tabData,
            selectedActionIdx: selectedActionIdx,
            selectedPartList: selectedPartList,
            allTabFinished: tabData[0].finished && tabData[1].finished && tabData[2].finished
        });

    },

    /**
     * 动作选择tab，响应重量选择
     */
    makePicker: function () {

        console.log("makePicker called");
        console.log("this.data.selectedPartId: ", this.data.selectedPartIdx);
        console.log("this.data.selectedActionIdx", this.data.selectedActionIdx);

        let actionNoMultiArray = [];

        let array0 = [];
        let array1 = [];
        let array2 = [];
        let array3 = ["Kg", "Lbs", "Km", "百米", "个"];

        let gpMeasurement;

        for (let idx = 0; idx < 200; idx++) {
            array0.push((idx + 1) + "组");

            if (this.data.selectedActionIdx === "")
                gpMeasurement = this.data.selectedPartList[this.data.selectedPartIdx].actionList[0].actionGpMeasurement;
            else
                gpMeasurement = this.data.selectedPartList[this.data.selectedPartIdx].actionList[this.data.selectedActionIdx].actionGpMeasurement;

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
     * 动作选择tab，响应重量选择
     * @param e
     */
    onNumberChange: function (e) {
        console.log(e);

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

        delete selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].groupSet;
        selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].groupSet = groupSet;

        // 重新置为选中
        selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].actionSelected = true;

        this.setData({
            selectedPartList: this.data.selectedPartList,
        });
    },

    /**
     * 页面总体控制
     * 滑动切换tab
     */
    onSwiperChange: function (e) {
        console.log("swipe to tab:", e.detail.current);
        this.switchTab(e.detail.current);

    },

    /**
     * 页面总体控制
     * 点击切换tab
     */
    onSwitchNav: function (e) {
        console.log("clicked tab:", e.target.dataset.current);
        this.switchTab(e.target.dataset.current);
    },

    /**
     * 页面总体控制
     * tab切换的具体函数
     */
    switchTab: function (tabIdx) {
        let tabData = this.data.tabData;
        let currentTabIdx = tabIdx;

        switch (tabIdx) {
            case 0:
                break;
            case 1:
                if (tabData[0].finished) {

                    break;
                } else {
                    return;
                }
            case 2:
                if (tabData[1].finished) {
                    this.makePicker();
                    this.loadActionData();
                    break;
                } else {
                    return;
                }
            default:
                return;
        }

        console.log("currentTabIdx:", this.data.currentTabIdx);
        console.log("fuck ddddd");

        this.setData({
            currentTabIdx: tabIdx,
        });
    },

    loadActionData: function () {

        // let startDate = app.Util.formatDateToString(new Date());
        // let endDate = app.Util.getMovedDate(startDate, true, 30);

        let selectedPartList = this.data.selectedPartList;
        let selectedPartIdx = 0;

        // 这里分两种情况，一是第一次进入，之前没有选过动作，需要重新构建，先统一赋值
        for (let part = 0; part < selectedPartList.length; part++) {
            for (let action = 0; action < selectedPartList[part].actionList.length; action++) {
                // 临时增加一个数据项，用以保存数据
                selectedPartList[part].actionList[action].groupSet = [];
                for (let idx = 0; idx < 6; idx++) {
                    let group = new Plan.GroupSet(idx + 1, 10,
                        selectedPartList[part].actionList[action].actionMeasurement, 30);

                    selectedPartList[part].actionList[action].groupSet.push(group);
                }
            }
        }

        if (app.currentPlan !== '') {
            for (let partItem of app.currentPlan.partSet) {
                for (let part = 0; part < selectedPartList.length; part++) {
                    if (partItem.name === selectedPartList[part].partName) {
                        for (let actionItem of partItem.actionSet) {
                            for (let action = 0; action < selectedPartList[part].actionList.length; action++) {
                                if (actionItem.name === selectedPartList[part].actionList[action].actionName) {
                                    console.log("match: " + actionItem.name);
                                    selectedPartList[part].actionList[action].actionSelected = true;
                                    delete selectedPartList[part].actionList[action].groupSet;
                                    selectedPartList[part].actionList[action].groupSet = actionItem.groupSet;
                                }
                            }
                        }
                    }
                }
            }
        }

        this.setData({
            selectedPartIdx: selectedPartIdx,

        });
    },

    /**
     * 页面总体控制
     * 所有选项都已选择，进入下一步
     * @param e
     */
    onNext: function (e) {



        wx.navigateTo({
            url: './preview_plan',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("Select Part Page onLoad");
        wx.setNavigationBarTitle({
            title: '定制我的锻炼计划',
        });

        // TODO 判断入口
        // 判断进入的入口，如果是定制新计划，日期用当前日期；如果是修改已有计划，日期则使用计划的日期
        let systemSetting = app.Controller.loadData(app.StorageType.SystemSetting);
        this.setData({
            // startDate: startDate,
            // endDate: endDate,
            partList: systemSetting.bodyPartList.partList
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

        let partList = this.data.partList;

        let planSet = app.Controller.loadData(app.StorageType.PlanSet);

        // 进行判断，如果是继续制定计划，那么之前的计划，已经保存了，这里刷新一下数据，如果不是，则不用刷新
        for (let plan of planSet) {
            if (plan.currentUse && app.currentPlan.partSet.length > 0) {
                for (let idx = 0; idx < partList.length; idx++) {
                    partList[idx].selected = false;
                }

                // 如果之前的计划有这个部位了，标注出来
                for (let item of app.currentPlan.partSet) {
                    for (let partIdx = 0; partIdx < partList.length; partIdx++) {
                        if (item.name === partList[partIdx].partName) {
                            let trainDate = [];
                            for (let date of item.trainDate) {
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
                            partList[partIdx].trainDate = "( " + trainDate.join("，") + " )";
                            console.log("item.trainDate ", partList[partIdx].trainDate);
                        }
                    }

                }

                this.setData({
                    partList: partList
                });

                break;
            }
        }

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

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
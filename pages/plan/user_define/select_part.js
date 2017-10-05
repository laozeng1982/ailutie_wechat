// pages/plan/user_define/select_part.js

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
        period: "请选择",
        restDays: "请选择",
        dayArray: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
        weekList: [],

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

    makeWeekList: function (length, part) {
        // 暂时只想到了这个办法，给weekList加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。

        let weekList = [];

        for (let idx = 0; idx < length; idx++) {
            weekList.push(
                {id: idx, value: idx + 1, currpart: part, hasparts: '', selected: false}
            );
        }

        return weekList;
    },

    /**
     * 设定时间tab
     * @param e
     */
    onDateChange: function (e) {
        console.log(e);
        if (e.currentTarget.id === "start") {
            this.setData({
                startDate: e.detail.value
            });
        } else {
            this.setData({
                endDate: e.detail.value
            });
        }
    },

    /**
     * 设定时间tab
     * @param e
     */
    onDaysChange: function (e) {
        if (e.currentTarget.id === "period") {
            let period = parseInt(e.detail.value) + 1;
            this.setData({
                weekList: this.makeWeekList(period, ""),
                period: period
            });
        } else {
            this.setData({
                restDays: parseInt(e.detail.value) + 1
            });
        }
    },

    /**
     * 设定时间tab
     * @param e
     */
    onSelectDate: function (e) {
        console.log(e);
        console.log(e.currentTarget.dataset.partname);
        console.log(e.currentTarget.id);
        let selectedPartInfo = this.data.selectedPartInfo;

        for (let partIdx = 0; partIdx < selectedPartInfo.length; partIdx++) {
            if (e.currentTarget.dataset.partname === selectedPartInfo[partIdx].name) {
                selectedPartInfo[partIdx].weekList[e.currentTarget.id].selected =
                    !selectedPartInfo[partIdx].weekList[e.currentTarget.id].selected;
            }
        }

        this.setData({
            selectedPartInfo: selectedPartInfo
        });

    },

    /**
     * 选择部位tab
     * 当部位点击时，取反其选中状态，同时更新选中列表，用于动作选择
     * @param e
     */
    onPartSelected: function (e) {
        let partList = this.data.partList;
        let selectedPartList = [];
        for (let idx = 0; idx < partList.length; idx++) {
            if (parseInt(e.currentTarget.id) === parseInt(partList[idx].partId)) {
                partList[idx].selected = !partList[idx].selected;
                break;
            }
        }

        for (let item of partList) {
            if (item.selected) {
                selectedPartList.push(item.partName);
            }
        }

        // 简单的做法，但是有可能id被人为修改，有可能出错
        console.log("selectedPartList", selectedPartList);

        this.setData({
            partList: partList,
            selectedPartList: selectedPartList
        });
    },

    // /**
    //  *
    //  * @param e
    //  */
    // onPartSelected: function (e) {
    //     console.log(e.currentTarget.id);
    //     let selectedPartList = this.data.selectedPartList;
    //     let selectedPartName = '';
    //     let selectedPartIdx = -1;
    //     for (let idx = 0; idx < selectedPartList.length; idx++) {
    //         selectedPartList[idx].selected = false;
    //         if (e.currentTarget.id === selectedPartList[idx].partName) {
    //             selectedPartName = e.currentTarget.id;
    //             selectedPartIdx = idx;
    //             selectedPartList[idx].selected = true;
    //         }
    //     }
    //
    //     this.setData({
    //         selectedPartName: selectedPartName,
    //         selectedPartIdx: selectedPartIdx,
    //         selectedPartList: selectedPartList
    //     });
    // },

    onActionSelected: function (e) {
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

        console.log("selectedPartIdx: ", selectedPartIdx, "selectedActionIdx: ", selectedActionIdx);

        this.setData({
            selectedActionIdx: selectedActionIdx,
            selectedPartList: selectedPartList
        })

    },

    /**
     *
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
     *
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
        // console.log("clicked tab:", e.target.dataset.current);

        this.switchTab(e.target.dataset.current);
    },

    /**
     * 页面总体控制
     * tab切换的具体函数
     */
    switchTab: function (tabIdx) {
        let itemSelected = true;
        switch (tabIdx) {
            case 0:
                break;
            case 1:
                if (itemSelected) {
                    break;
                } else {
                    return;
                }
            case 2:

                if (itemSelected) {
                    break;
                } else {
                    return;
                }
            default:
                return;
        }

        this.setData({
            currentTabIdx: tabIdx,
        });
    },

    /**
     * 页面总体控制
     * 所有选项都已选择，进入下一步
     * @param e
     */
    onNext: function (e) {
        let selectedPartInfo = [];
        let hasSelectedPart = false;
        for (let item of this.data.partList) {

            if (item.selected) {
                hasSelectedPart = true;
                selectedPartInfo.push({index: item.partId, name: item.partName, actionCount: 0});
            }
        }

        if (!hasSelectedPart) {
            app.Util.showWarnToast("还未选择锻炼部位", this, 1000);
            return;
        }

        app.selectedPartInfo = selectedPartInfo;

        wx.navigateTo({
            url: './preview_view',
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

        // let startDate = app.Util.formatDateToString(new Date());
        // let endDate = app.Util.getMovedDate(startDate, true, 30);

        let selectedPartList = [];
        let selectedPartIdx = 0;
        for (let item of systemSetting.bodyPartList.partList) {
            for (let selectedPart of app.selectedPartInfo) {
                if (selectedPart.name === item.partName) {
                    // 页面启动参数里带着前一个页面选中的部位，这里默认高亮这个部位
                    if (selectedPart.name === options.selectedPart) {
                        item.selected = true;
                        selectedPartIdx = selectedPartList.length;
                    }
                    selectedPartList.push(item);

                }
            }
        }

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
            // startDate: startDate,
            // endDate: endDate,
            selectedPartIdx: selectedPartIdx,
            selectedPartList: selectedPartList,
            options: options,
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
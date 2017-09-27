// pages/plan/user_define/select_actions.js
import Plan from '../../../datamodel/PlanSet.js'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        selectedPartList: [],
        selectedPartName: '',
        selectedPartIdx: -1,
        selectedActionIdx: 0,
        search: {
            searchValue: '',
            showClearBtn: false
        },
        searchResult: [],

        // 3D 数组，用来存放动作组数，次数和重量
        actionNoMultiArray: [],
        // 数量选择索引
        multiActionNoIndex: [5, 9, 19, 0],
        plan: '',
    },

    //输入内容时
    searchActiveChangeinput: function (e) {
        const val = e.detail.value;
        this.setData({
            'search.showClearBtn': val !== '',
            'search.searchValue': val
        })
    },
    //点击清除搜索内容
    searchActiveChangeclear: function (e) {
        this.setData({
            'search.showClearBtn': false,
            'search.searchValue': ''
        })
    },
    //点击聚集时
    focusSearch: function () {
        if (this.data.search.searchValue) {
            this.setData({
                'search.showClearBtn': true
            })
        }
    },
    //搜索提交
    searchSubmit: function () {
        const val = this.data.search.searchValue;
        if (val) {


        }

    },

    onPartSelected: function (e) {
        console.log(e.currentTarget.id);
        var selectedPartList = this.data.selectedPartList;
        var selectedPartName = '';
        var selectedPartIdx = -1;
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

    onActionSelected: function (e) {
        console.log(e.currentTarget.id);
        var selectedPartList = this.data.selectedPartList;
        var selectedPartIdx = this.data.selectedPartIdx;
        var selectedActionIdx = -1;


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

        var actionNoMultiArray = [];

        var array0 = [];
        var array1 = [];
        var array2 = [];
        var array3 = ["Kg", "Lbs", "Km", "百米", "个"];

        var gpMeasurement;

        for (var idx = 0; idx < 200; idx++) {
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

        var selectedRowArr = e.detail.value;

        // 获取当前页面用户的输入
        var planGpCount = parseInt(this.data.actionNoMultiArray[0][selectedRowArr[0]]);
        var planCount = parseInt(this.data.actionNoMultiArray[1][selectedRowArr[1]]);
        var planWeight = parseInt(this.data.actionNoMultiArray[2][selectedRowArr[2]]);
        var measurement = this.data.actionNoMultiArray[3][selectedRowArr[3]];

        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount + "次, ", +planWeight, measurement);

        var selectedPartList = this.data.selectedPartList;

        var groupData = [];
        for (let idx = 0; idx < planGpCount; idx++) {
            groupData.push(new Plan.GroupData(idx + 1, planCount, measurement, planWeight));

        }

        delete selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].groupData;
        selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].groupData = groupData;

        // 重新置为选中
        selectedPartList[this.data.selectedPartIdx].actionList[e.currentTarget.id - 1].actionSelected = true;

        this.setData({
            selectedPartList: this.data.selectedPartList,
        });
    },

    onOK: function (e) {
        wx.navigateBack({
            delta: 1
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(app.selectedPartInfo);
        var systemSetting = app.Controller.loadData(
            app.StorageType.SystemSetting.value,
            app.StorageType.SystemSetting);

        var selectedPartList = [];
        var selectedPartIdx = 0;
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
                selectedPartList[part].actionList[action].groupData = [];
                for (let idx = 0; idx < 6; idx++) {
                    var group = new Plan.GroupData(idx + 1, 10,
                        selectedPartList[part].actionList[action].actionMeasurement, 30);

                    selectedPartList[part].actionList[action].groupData.push(group);
                }
            }
        }

        if (app.plan !== '') {
            for (let partItem of app.plan.partSet) {
                for (let part = 0; part < selectedPartList.length; part++) {
                    if (partItem.name === selectedPartList[part].partName) {
                        for (let actionItem of partItem.actionSet) {
                            for (let action = 0; action < selectedPartList[part].actionList.length; action++) {
                                if (actionItem.name === selectedPartList[part].actionList[action].actionName) {
                                    console.log("match: " + actionItem.name);
                                    selectedPartList[part].actionList[action].actionSelected = true;
                                    delete  selectedPartList[part].actionList[action].groupData;
                                    selectedPartList[part].actionList[action].groupData = actionItem.groupSet;
                                }
                            }
                        }
                    }
                }
            }
        }

        console.log(options);
        console.log(selectedPartList);

        this.setData({
            selectedPartIdx: selectedPartIdx,
            selectedPartList: selectedPartList
        });

        this.makePicker();

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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     * 普通非Tab页面，每次切换出去，都直接Unload了，所以在这里保存数据。
     */
    onUnload: function () {
        console.log("Action Page UnLoad!");
        // var plan = (typeof app.plan === 'undefined' || app.plan === '') ?
        //     new Plan.Plan() : app.plan;

        // if (typeof app.plan === 'undefined' || app.plan === '')
        //     plan = new Plan.Plan();
        // else
        //     plan = app.plan;

        var plan = new Plan.Plan();

        for (let part = 0; part < this.data.selectedPartList.length; part++) {
            // 生成一个部位
            var partSet = new Plan.PartSet(part + 1, this.data.selectedPartList[part].partName);
            partSet.description = this.data.selectedPartList[part].partDescription;
            partSet.imageUrl = this.data.selectedPartList[part].partPictureSrc;

            // 当点中的时候，就算是计划中的元素
            var idx = 1;
            for (let action = 0; action < this.data.selectedPartList[part].actionList.length; action++) {
                if (this.data.selectedPartList[part].actionList[action].actionSelected) {
                    // 生成一个动作
                    var actionSet = new Plan.ActionSet();
                    actionSet.id = idx;
                    actionSet.name = this.data.selectedPartList[part].actionList[action].actionName;
                    actionSet.description = this.data.selectedPartList[part].actionList[action].actionDescription;
                    actionSet.imageUrl = this.data.selectedPartList[part].actionList[action].actionPictureSrc;

                    actionSet.groupSet = this.data.selectedPartList[part].actionList[action].groupData;
                    partSet.actionSet.push(actionSet);
                    idx++;
                }
            }
            plan.partSet.push(partSet);

            // 更新选中的数量
            app.selectedPartInfo[part].actionCount = partSet.actionSet.length;
        }

        console.log(plan);

        app.plan = plan;
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
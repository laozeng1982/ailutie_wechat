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
        movementNoMultiArray: [],
        // 数量选择索引
        multiMovementNoIndex: [5, 9, 19, 0],
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

        var movementNoMultiArray = [];

        var array0 = [];
        var array1 = [];
        var array2 = [];
        var array3 = ["Kg", "Lbs", "Km", "百米", "个"];

        var gpMeasurement;

        for (var idx = 0; idx < 200; idx++) {
            array0.push((idx + 1) + "组");

            if (this.data.selectedMovementId === "")
                gpMeasurement = this.data.selectedPartList[this.data.selectedPartIdx].actionList[0].actionGpMeasurement;
            else
                gpMeasurement = this.data.selectedPartList[this.data.selectedPartIdx].actionList[this.data.selectedActionIdx].actionGpMeasurement;

            array1.push((idx + 1) + gpMeasurement);
            // array1.push((idx + 1) + "");
            array2.push((idx + 1));
        }
        movementNoMultiArray.push(array0);
        movementNoMultiArray.push(array1);
        movementNoMultiArray.push(array2);
        movementNoMultiArray.push(array3);


        this.setData({
            movementNoMultiArray: movementNoMultiArray,
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
        var planGpCount = parseInt(this.data.movementNoMultiArray[0][selectedRowArr[0]]);
        var planCount = parseInt(this.data.movementNoMultiArray[1][selectedRowArr[1]]);
        var planWeight = parseInt(this.data.movementNoMultiArray[2][selectedRowArr[2]]);
        var measurement = this.data.movementNoMultiArray[3][selectedRowArr[3]];

        console.log("in onNumberChange, picker: ", planGpCount + "组, ", planCount + "次, ", +planWeight, measurement);

        var selectedPartList = this.data.selectedPartList;

        var groupData = [];
        for (let idx = 0;idx < planGpCount; idx ++) {
             groupData.push(new Plan.GroupData(idx+1, planCount,measurement,planWeight));

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
        var selectedPartNamesArray = app.selectedPartName;
        var systemSetting = app.Controller.loadData(
            app.StorageType.SystemSetting.value,
            app.StorageType.SystemSetting);

        var selectedPartList = [];
        var selectedPartIdx = 0;
        for (let item of systemSetting.bodyPartList.partList) {
            for (let partName of selectedPartNamesArray) {
                if (partName === item.partName) {
                    // 页面启动参数里带着前一个页面选中的部位，这里默认高亮这个部位
                    if (partName === options.selectedPart) {
                        item.selected = true;
                        selectedPartIdx = selectedPartList.length;
                    }
                    selectedPartList.push(item);

                }
            }
        }

        for (let part = 0; part < selectedPartList.length; part++) {
            for (let action = 0; action < selectedPartList[part].actionList.length; action++) {
                // 临时增加一个数据项，用以保存数据
                selectedPartList[part].actionList[action].groupData = [];
                for (let idx = 0; idx < 6; idx++) {
                    var group = new Plan.GroupData(idx + 1, 10, " ", 30);
                    selectedPartList[part].actionList[action].groupData.push(group);
                }
            }
        }

        console.log(options);
        console.log(selectedPartList);

        this.setData({
            plan: new Plan.Plan(),
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
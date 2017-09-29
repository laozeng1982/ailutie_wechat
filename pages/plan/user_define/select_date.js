// pages/plan/user_define/select_date.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        repeatPattern: [
            {id: 1, name: "按周重复", selected: true},
            {id: 2, name: "按周交替", selected: false},
            // {id: 3, name: "按固定天重复", selected: false},
        ],
        selectedPartNames: '',
        selectedPartInfo: [],

        startDate: '',
        endDate: '',
    },


    makeWeekList: function (part) {
        // 暂时只想到了这个办法，给weekList加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。
        return [
            {id: 0, value: '日', currpart: part, hasparts: '', selected: false},
            {id: 1, value: '一', currpart: part, hasparts: '', selected: false},
            {id: 2, value: '二', currpart: part, hasparts: '', selected: false},
            {id: 3, value: '三', currpart: part, hasparts: '', selected: false},
            {id: 4, value: '四', currpart: part, hasparts: '', selected: false},
            {id: 5, value: '五', currpart: part, hasparts: '', selected: false},
            {id: 6, value: '六', currpart: part, hasparts: '', selected: false}
        ];
    },

    onPatternChange: function (e) {
        let repeatPattern = this.data.repeatPattern;
        switch (e.detail.value) {
            case "1":
                repeatPattern[0].selected = true;
                repeatPattern[1].selected = false;
                break;
            case "2":
                repeatPattern[0].selected = false;
                repeatPattern[1].selected = true;
                break;
            default:
                break;
        }

        this.setData({
            repeatPattern: repeatPattern
        });
    },

    onSelectAction: function (e) {
        console.log(e);

        wx.navigateTo({
            url: './select_actions?selectedPart=' + e.currentTarget.id,
        });
    },

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

    onNext: function (e) {
        // 检查输入
        // for (let item of app.selectedPartInfo) {
        //     if (item.actionCount === 0) {
        //         app.Util.showWarnToast(item.name + "还未选动作！", this, 2000);
        //         return;
        //     }
        // }
        //
        // let selected = false;
        // for (let item of this.data.weekList) {
        //     selected = selected || item.selected;
        // }

        // if (!selected) {
        //     app.Util.showWarnToast("还未选日期！", this, 2000);
        //     return;
        // }
        //
        // if (app.Util.dateDirection(this.data.endDate) <= 0) {
        //
        //     app.Util.showWarnToast("兄弟，结束时间不对哦！", this, 2000);
        //     return;
        // }
        //
        // if (app.Util.dateDirection(this.data.startDate) < 0) {
        //
        //     app.Util.showWarnToast("兄弟，开始时间不对哦！", this, 2000);
        //     return;
        // }
        //
        // if (app.Util.datesDistance(this.data.startDate, this.data.endDate) <= 0) {
        //
        //     app.Util.showWarnToast("兄弟，时间段选择不对哦！", this, 2000);
        //     return;
        // }

        // 准备Plan的数据
        app.currentPlan.startDate = this.data.startDate;
        app.currentPlan.endDate = this.data.endDate;

        for (let idx = 0; idx < app.currentPlan.partSet.length; idx++) {
            let selectedDateArr = [];
            for (let part of this.data.selectedPartInfo) {
                if (part.name === app.currentPlan.partSet[idx].name) {
                    for (let item of part.weekList) {
                        if (item.selected) {
                            selectedDateArr.push(item.id);
                        }
                    }
                    break;
                }
            }
            app.currentPlan.partSet[idx].trainDate = selectedDateArr;
        }

        wx.navigateTo({
            url: './preview_plan',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("Select Date Page onLoad");

        for (let idx = 0; idx < app.selectedPartInfo.length; idx++) {
            app.selectedPartInfo[idx].weekList = this.makeWeekList(app.selectedPartInfo[idx].name);
        }

        let startDate = app.Util.formatDateToString(new Date());
        let endDate = app.Util.getMovedDate(startDate, true, 30);

        wx.setNavigationBarTitle({
            title: '选择日期和动作',
        });

        let selectedPartNamesArrs = [];
        let selectedPartNames;
        for (let idx = 0; idx < app.selectedPartInfo.length; idx++) {
            selectedPartNamesArrs.push(app.selectedPartInfo[idx].name);
            // 有可能会超出显示长度，UI会难看，截取部分
            if (idx >= 2) {
                selectedPartNames = selectedPartNamesArrs.join("，") + "...";
                break;
            } else if (idx === app.selectedPartInfo.length - 1) {
                selectedPartNames = selectedPartNamesArrs.join("，");
            }
        }

        this.setData({
            startDate: startDate,
            endDate: endDate,
            selectedPartNames: selectedPartNames,
            selectedPartInfo: app.selectedPartInfo
        });

        console.log("startDate: ", this.data.startDate);
        console.log("endDate: ", this.data.endDate);
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
        console.log("Select Date Page onShow");
        console.log("app.selectedPartInfo: ", app.selectedPartInfo);
        this.setData({
            selectedPartInfo: app.selectedPartInfo
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {
        console.log("Select Date Page onHide");
        app.selectedPartInfo = this.data.selectedPartInfo;
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
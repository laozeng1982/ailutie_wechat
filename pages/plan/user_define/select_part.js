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

        // 时间tab
        startDate: '',
        endDate: '',

        // 部位tab
        partList: '',

        // 动作tab

        currentTabIdx: 0,
        allTabFinished: false,
        firstTimeIn: true,
    },

    makeWeekList: function (part) {
        // 暂时只想到了这个办法，给weekList加标志，好判断是选中了哪个部位的日期，e.target.id不好用了。
        return [
            { id: 0, value: '日', currpart: part, hasparts: '', selected: false },
            { id: 1, value: '一', currpart: part, hasparts: '', selected: false },
            { id: 2, value: '二', currpart: part, hasparts: '', selected: false },
            { id: 3, value: '三', currpart: part, hasparts: '', selected: false },
            { id: 4, value: '四', currpart: part, hasparts: '', selected: false },
            { id: 5, value: '五', currpart: part, hasparts: '', selected: false },
            { id: 6, value: '六', currpart: part, hasparts: '', selected: false }
        ];
    },

    /**
     * 滑动切换tab
     */
    onSwiperChange: function (e) {
        console.log("swipe to tab:", e.detail.current);
        this.switchTab(e.detail.current);

    },

    /**
     * 点击切换tab
     */
    onSwitchNav: function (e) {
        // console.log("clicked tab:", e.target.dataset.current);

        this.switchTab(e.target.dataset.current);
    },

    /**
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

    onPartSelected: function (e) {
        var partList = this.data.partList;
        for (let idx = 0; idx < partList.length; idx++) {
            if (parseInt(e.currentTarget.id) === parseInt(partList[idx].partId)) {
                partList[idx].selected = !partList[idx].selected;
                break;
            }
        }

        // 简单的做法，但是有可能id被人为修改，有可能出错
        // partList[parseInt(e.currentTarget.id) -1].selected =
        // !partList[parseInt(e.currentTarget.id) -1].selected;

        this.setData({
            partList: partList
        });
    },

    onNext: function (e) {
        var selectedPartInfo = [];
        var hasSelectedPart = false;
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
            url: './select_date',
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("Select Part Page onLoad");
        wx.setNavigationBarTitle({
            title: '选择锻炼部位',
        })
        var systemSetting = app.Controller.loadData(app.StorageType.SystemSetting);

        let startDate = app.Util.formatDateToString(new Date());
        let endDate = app.Util.getMovedDate(startDate, true, 30);


        this.setData({
            startDate: startDate,
            endDate: endDate,
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

        var partList = this.data.partList;

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
                            var trainDate = [];
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
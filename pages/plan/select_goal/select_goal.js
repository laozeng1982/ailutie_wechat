// pages/plan/plan_goal/plan_goal.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabData: [
            {
                type: "level",
                name: "我的基础",
                data:
                    [
                        {id: 1, text: "零基础小白", selected: false},
                        {id: 2, text: "有一定基础", selected: false},
                        {id: 3, text: "健身达人", selected: false},
                    ],
                disable_left: true,
                disable_right: true,
                tips: "请选择您的健身基础",
                finished: false
            },
            {
                type: "target",
                name: "我的目标",
                data:
                    [
                        {id: 1, text: "减脂", selected: false},
                        {id: 2, text: "增肌", selected: false},
                        {id: 3, text: "塑形", selected: false},
                    ],
                disable_left: false,
                disable_right: true,
                tips: "请选择您的健身目标",
                finished: false
            },
            {
                type: "plan_type",
                name: "计划来源",
                data:
                    [
                        {id: 1, text: "使用推荐计划", selected: false},
                        {id: 2, text: "使用历史计划", selected: false},
                        {id: 3, text: "自己定制计划", selected: false},
                    ],
                disable_left: false,
                disable_right: true,
                tips: "请选择本次计划来源",
                finished: false
            }
        ],

        currentTabIdx: 0,
        firstTimeIn: true,

    },

    /**
     * 点击“上一步”，切换页面
     */
    onLastStep: function () {
        let currentTabIdx = this.data.currentTabIdx;
        let tabIdx = currentTabIdx - 1 < 0 ? 0 : currentTabIdx - 1;
        this.switchTab(tabIdx);
    },

    onNextStep: function () {
        let currentTabIdx = this.data.currentTabIdx;
        let tabIdx = currentTabIdx + 1 > 2 ? 2 : currentTabIdx + 1;
        this.switchTab(tabIdx);
    },

    /**
     * tab切换的具体函数
     */
    switchTab: function (tabIdx) {
        this.setData({
            currentTabIdx: tabIdx,
        });
    },

    onItemSelected: function (e) {

        let tabData = this.data.tabData;
        let currentTabIdx = this.data.currentTabIdx;

        for (let idx = 0; idx < tabData[currentTabIdx].data.length; idx++) {
            tabData[currentTabIdx].data[idx].selected =
                (parseInt(e.currentTarget.id) === tabData[currentTabIdx].data[idx].id);
        }
        tabData[currentTabIdx].finished = true;

        if (currentTabIdx === 0) {
            tabData[currentTabIdx].disable_right = false;
        }

        if (currentTabIdx === 1) {
            tabData[currentTabIdx].disable_right = false;
        }

        this.setData({
            tabData: tabData,
        });

        // 第一次进入页面，自动跳转
        // if (this.data.firstTimeIn && this.data.currentTabIdx + 1 <= 2) {
        //     this.switchTab(this.data.currentTabIdx + 1);
        //     if (this.data.currentTabIdx === 2)
        //         this.setData({firstTimeIn: false});
        // }

    },

    onNext: function () {
        for (let item of this.data.tabData[2].data) {
            if (item.selected) {
                switch (item.id) {
                    case 1:
                        wx.navigateTo({
                            url: '../recommend_planlist/recommend_planlist',
                        });
                        break;
                    case 2:
                        wx.navigateTo({
                            url: '../user_define/select_part',
                        });
                        this.fillPlan();
                        break;
                    case 3:
                        wx.navigateTo({
                            url: '../user_define/select_part',
                        });
                        this.fillPlan();
                        break;
                }
            }
        }

    },

    fillPlan: function () {
        // 复制信息

        app.currentPlan.source = app.globalData.wechatUserInfo.nickName;

        for (let item of this.data.tabData[0].data) {
            if (item.selected) {
                app.currentPlan.level = item.text;
                break;
            }
        }

        for (let item of this.data.tabData[1].data) {
            if (item.selected) {
                app.currentPlan.purpose = item.text;
                break;
            }
        }

        console.log("leaving goal page, app.currentPlan", app.currentPlan);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
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
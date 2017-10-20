// pages/plan/plan_type/plan_type.js

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
                        {id: 1, text: "零基础小白", value: "初级", selected: false},
                        {id: 2, text: "有一定基础", value: "中级", selected: false},
                        {id: 3, text: "健身达人", value: "高级", selected: false},
                    ],
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
                tips: "请选择您的健身目标",
                finished: false
            }
        ],

        currentTabIdx: 0,
        disableNextBtn: true,
        nextBtnText: "去定制健身计划"

    },

    /**
     * 点击“上一步”，切换页面
     */
    onSteps: function (e) {
        let tabData = this.data.tabData;
        let tabIdx = (parseInt(e.currentTarget.id) === 0) ? 1 : 0;
        let disableNextBtn = this.data.currentTabIdx === 0 && !tabData[1].finished;
        this.setData({
            currentTabIdx: tabIdx,
            disableNextBtn: disableNextBtn
        });
    },

    onItemSelected: function (e) {

        let tabData = this.data.tabData;
        let currentTabIdx = this.data.currentTabIdx;
        let selectedItemIdx = parseInt(e.currentTarget.id);
        let disableNextBtn;

        for (let idx = 0; idx < tabData[currentTabIdx].data.length; idx++) {
            tabData[currentTabIdx].data[idx].selected =
                selectedItemIdx === tabData[currentTabIdx].data[idx].id;
        }
        tabData[currentTabIdx].finished = true;

        disableNextBtn = currentTabIdx === 0 && !tabData[1].finished;

        this.setData({
            tabData: tabData,
            disableNextBtn: disableNextBtn
        });
    },

    onNext: function () {

        wx.navigateTo({
            url: '../define_plan/define_plan?mode=longPlan',
        });
        this.fillPlan();
    },

    fillPlan: function () {
        // 复制信息

        app.currentPlan.source = app.globalData.wechatUserInfo.nickName;

        for (let item of this.data.tabData[0].data) {
            if (item.selected) {
                app.currentPlan.level = item.value;
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
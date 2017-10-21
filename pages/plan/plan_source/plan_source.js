// pages/plan/plan_source/plan_source.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabData: [
            {
                type: "plan_source",
                name: "计划来源",
                data:
                    [
                        {id: 1, text: "使用推荐计划", checked: false},
                        {id: 2, text: "使用历史计划", checked: false},
                        {id: 3, text: "自己定制计划", checked: false},
                    ],
                tips: "请选择本次计划来源",
                finished: false
            }
        ],

        currentTabIdx: 0,
        disableNextBtn: true,
        nextBtnText: "去定制健身计划"

    },

    onItemChecked: function (e) {

        let tabData = this.data.tabData;
        let currentTabIdx = this.data.currentTabIdx;
        let checkedItemIdx = parseInt(e.currentTarget.id);
        let nextBtnText = '';

        for (let idx = 0; idx < tabData[currentTabIdx].data.length; idx++) {
            tabData[currentTabIdx].data[idx].checked =
                checkedItemIdx === tabData[currentTabIdx].data[idx].id;
        }
        tabData[currentTabIdx].finished = true;

        if (currentTabIdx === 0) {
            if (checkedItemIdx !== 3) {
                nextBtnText = "去选择健身计划";
            } else {
                nextBtnText = "去定制健身计划";
            }

        }

        this.setData({
            tabData: tabData,
            nextBtnText: nextBtnText,
            disableNextBtn: false
        });
    },

    onNext: function () {
        for (let item of this.data.tabData[0].data) {
            if (item.checked) {
                let url = '';
                switch (item.id) {
                    case 1:
                        url = '../plan_list/plan_list?mode=recommend';
                        break;
                    case 2:
                        url = '../plan_list/plan_list?mode=history';
                        break;
                    case 3:
                        url = '../plan_type/plan_type?mode=longPlan';
                        break;
                }

                wx.navigateTo({
                    url: url,
                });
            }
        }

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
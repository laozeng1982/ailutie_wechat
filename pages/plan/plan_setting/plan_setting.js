// pages/plan/plan_setting/plan_setting.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        planSetting: [
            {id: "plan_name", name: "计划名字", type: "input", isPicker: false, value: ''},
            {id: "purpose", name: "健身目标", type: "picker", isPicker: true, value: ["增肌", "减脂", "塑性"], index: 0},
            {id: "grade", name: "健身水平", type: "picker", isPicker: true, value: ["初级", "中级", "高级", "骨灰级"], index: 0},
            {id: "people", name: "适合人群", type: "picker", isPicker: true, value: ["男士", "女士"], index: 0},
            {id: "equipment", name: "健身设备", type: "picker", isPicker: true, value: ["器械", "徒手"], index: 0},
            {id: "place", name: "健身地点", type: "picker", isPicker: true, value: ["健身房", "操场", "家里"], index: 0}
        ]
    },

    onPickerChange: function (e) {
        // console.log(e);
        let planSetting = this.data.planSetting;

        for (let setting of planSetting) {
            if (setting.id === e.currentTarget.id) {
                setting.index = parseInt(e.detail.value);
            }
        }

        this.setData({
            planSetting: planSetting
        });
    },

    onFormSubmit: function (e) {
        // TODO 这一节因为页面数据结构的逻辑不太好，所以判断就写的不好，将来参考userprofile页重写
        // 根据入口不同，选择切换不同的Tab
        console.log('form发生了submit事件，携带数据为：', e.detail.value);

        // 准备Plan的数据
        wx.navigateTo({
            url: '../plan_details/plan_details?mode=preview',
        });
    },

    onFormReset: function () {
        this.setData({});
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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
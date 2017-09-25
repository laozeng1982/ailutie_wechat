// pages/plan/plan_goal/plan_goal.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        goalType: [
            {id: 1, text: "减脂", selected: false},
            {id: 2, text: "增肌", selected: false},
            {id: 3, text: "塑性", selected: false},
        ],
    },

    onGoalTypeSelected: function (e) {
        console.log(e.currentTarget.id);
        var goalType = this.data.goalType;
        switch (e.currentTarget.id) {
            case "1":
                goalType[0].selected = true;
                goalType[1].selected = false;
                goalType[2].selected = false;
                break;
            case "2":
                goalType[0].selected = false;
                goalType[1].selected = true;
                goalType[2].selected = false;
                break;
            case "3":
                goalType[0].selected = false;
                goalType[1].selected = false;
                goalType[2].selected = true;
                break;
        }
        this.setData({
            goalType: goalType
        });
    },

    onNext: function () {
        wx.navigateTo({
            url: '../recommend_planlist/recommend_planlist',
        })
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
// settings.js
/**
 * “我的”界面主控，负责分发各个选项的跳转页面
 */

const app = getApp();

Page({
    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},

        // 锻炼数据
        trainData: {dayCount: 0, actionCount: 0, energyCost: 0},

        list: [
            {
                list_tool: [
                    {
                        img: "../../pages/image/friend_64px.png",
                        name: "个人信息",
                        url: "userinfo/userinfo"
                    },
                    {
                        img: "../../pages/image/writing_64px.png",
                        name: "个人状态记录",
                        url: "userprofile/userprofile"
                    },
                ]
            },
            {
                list_tool: [
                    // {
                    //     img: "../../pages/image/information_64px.png",
                    //     name: "计划墙",
                    //     url: "plan_list/plan_list"
                    // },
                    // {
                    //     img: "../../pages/image/burger_64px.png",
                    //     name: "我们吃什么",//(三个页面：增肌、减脂和营养)
                    //     url: "food/food"
                    // },
                    {
                        img: "../../pages/image/information_64px.png",
                        name: "计划墙",
                        url: "plan_list/plan_list"
                    },
                    {
                        img: "../../pages/image/rate_64px.png",
                        name: "收藏",
                        url: "favorite/favorite"
                    },
                ]
            },
            {
                list_tool: [
                    {
                        img: "../../pages/image/settings_64px.png",
                        name: "软件设置",
                        url: "system/system"
                    },
                    {
                        img: "../../pages/image/support_64px.png",
                        name: "关于我们",
                        url: "about/about"
                    },
                    // {
                    //     img: "../../pages/image/yen_64px.png",
                    //     name: "打赏~~",
                    //     url: "donation/donation"
                    // },
                ]
            },
        ],
    },

    goPage: function (event) {
        console.log("going to page: ", event.currentTarget.dataset.log);
        wx.navigateTo({
            url: event.currentTarget.dataset.url + "?model=fromSetting",
        })
    },

    initTrainData: function () {
        let realitySet = app.Util.loadData(app.StorageType.RealitySet);
        let trainData = this.data.trainData;
        for (let reality of realitySet) {
            if (reality.exerciseSet.length > 0) {
                // 计算锻炼的天数
                trainData.dayCount++;
                // 计算总的动作数
                trainData.actionCount = trainData.actionCount + reality.exerciseSet.length;
                // 计算能量消耗数
                for (let exercise of reality.exerciseSet) {
                    trainData.energyCost = trainData.energyCost + Math.ceil(app.Util.calcEnergyCost(exercise, true));
                }
            }
        }

        console.log(trainData);

        this.setData({trainData});

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.initTrainData();
        this.setData({
            userInfo: app.wechatUserInfo,
        });
        console.log("Setting page onLoad call, userInfo: ", this.data.userInfo);
        console.log("Setting page onLoad call, app.openId: ", app.openId);
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
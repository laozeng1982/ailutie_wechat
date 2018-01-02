// pages/plan/plan_list/plan_list.js

import Dictionary from '../../../datamodel/Dictionary'

const dict = new Dictionary.Dictionary();

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        mode: "",   // 计划显示的模式
        planList: [], // 将要显示的计划列表
        tabData: [],
        currentTabIdx: 0,

    },

    makeTabData: function () {
        let tabData = [
            {
                type: "ailutie",
                name: "热门",
                data: [],
                selected: true
            },
            // {
            //     type: "coach",
            //     name: "教练",
            //     data: [],
            //     selected: false
            // },
            // {
            //     type: "other",
            //     name: "网友",
            //     data: [],
            //     selected: false
            // }, 
            {
                type: "user",
                name: "我的",
                data: [],
                selected: false
            }
        ];

        this.setData({
            tabData: tabData
        });
    },

    onSwitchNav: function (e) {
        let currentTabIdx = e.currentTarget.dataset.current;
        this.setData({
            currentTabIdx: currentTabIdx
        });
    },

    onSwiperChange: function (e) {
        let currentTabIdx = e.detail.current;
        this.setData({
            currentTabIdx: currentTabIdx
        });
    },

    onPlanSelected: function (e) {
        console.log(e.currentTarget.dataset.plan);
        app.currentPlan.cloneDataFrom(e.currentTarget.dataset.plan);
        wx.navigateTo({
            url: '../../plan/plan_details/plan_details?mode=view',
        });

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '计划墙',
        });

        this.setData({
            mode: options.mode
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
        this.makeTabData();

        let userPlanSet = app.Util.loadData(app.Settings.Storage.UserPlanSet);

        // console.log("userPlanSet:", userPlanSet);

        let tabData = this.data.tabData;

        for (let plan of userPlanSet) {
            plan.chPlace = dict.getChFromEn(plan.place);
            plan.chPurpose = dict.getChFromEn(plan.purpose);
            plan.chGrade = dict.getChFromEn(plan.grade);

            // TODO 添加拥有者头像，头像处理这个逻辑还需要思考，个人和系统将不变，将来加入其它用户计划显示时，如果其它用户头像换了，avatarUrl还一样么？
            if (plan.source === app.wechatUserInfo.nickName) {
                plan.avatarUrl = app.wechatUserInfo.avatarUrl;
            } else {
                plan.avatarUrl = '../../image/app_icon.png';
            }

        }

        tabData[0].data = userPlanSet;
        // tabData[1].data = userPlanSet;
        // tabData[2].data = userPlanSet;
        tabData[1].data = userPlanSet;
        this.setData({
            tabData: tabData
        });

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
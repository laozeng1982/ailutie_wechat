// userprofile.js

import User from '../../../datamodel/User'

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        userProfile: '',
        today: '',
        currentTabIdx: 0
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

    onSelectDay: function (e) {
        console.log(e);
        if (app.Util.dateDirection(e.detail.value) === 1) {
            app.Util.showWarnToast("小哥，不能记录将来的指标哦！", this, 2000);
            return;
        }
        this.setData({
            selectedDate: e.detail.value
        });
    },

    valueChange: function (e) {
        let userProfile = this.data.userProfile;
        for (let idx = 0; idx < userProfile.length; idx++) {
            if ((userProfile[idx].type + userProfile[idx].key) === e.target.id) {
                userProfile[idx].value = parseInt(e.detail.value);
            }
        }

        this.setData({
            userProfile: userProfile
        });
    },

    /**
     *
     */
    initUserProfile: function () {
        let userProfile;

        let profileSet = app.Util.loadData(app.Settings.Storage.UserProfile);

        for (let profile of profileSet) {
            if (profile.date === this.data.today) {
                userProfile = profile;
                break;
            }
        }

        if (typeof userProfile === "undefined") {
            userProfile = new User.UserProfile();
            userProfile.date = this.data.today;
            for (let item of userProfile.profiles.circumference.data) {
                if (item.enName === "height") {
                    item.value = this.data.userInfo.height;
                }
                if (item.enName === "weight") {
                    item.value = this.data.userInfo.weight;
                }
            }
        }

        console.log("userProfile:", userProfile);

        this.setData({
            userProfile: userProfile
        })
    },

    /**
     *
     */
    makeTabData: function () {
        let userProfile = this.data.userProfile.profiles;
        let tabData = [];
        for (let item in userProfile) {
            tabData.push({
                type: item,
                name: userProfile[item].name,
                data: userProfile[item].data,
                selected: false
            });
        }
        console.log("tabData:", tabData);

        tabData[0].selected = true;
        this.setData({
            tabData: tabData
        });
    },

    onFormSubmit: function (e) {
        console.log('form发生了submit事件，携带数据为：', e.detail.value);

        // 先保存数据
        for (let value in e.detail.value) {
            for (let item in this.data.userProfile.profiles) {
                for (let dataItem of this.data.userProfile.profiles[item].data) {
                    if (dataItem.chName === value && e.detail.value[value] !== "") {
                        dataItem.value = e.detail.value[value];
                    }
                }
            }
        }

        // console.log(this.data.userProfile);

        let profileSet = app.Util.loadData(app.Settings.Storage.UserProfile);

        if (profileSet.length === 0) {
            profileSet.push(this.data.userProfile);
        } else {
            for (let idx = 0; idx < profileSet.length; idx++) {
                if (profileSet[idx].date === this.data.today) {
                    profileSet.splice(idx, 1, this.data.userProfile);
                }
            }
        }

        app.Util.saveData(app.Settings.Storage.UserProfile, profileSet);

        wx.switchTab({
            url: '../settings',
        })

    },

    onFormReset: function () {
        // console.log('form发生了reset事件');
        this.initUserProfile();
        this.makeTabData();
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let today = app.Util.formatDateToString(new Date());
        let userInfo = wx.getStorageSync("UserInfo");

        // TODO 本页由原来的Tab页面，改成单页，将来看最终设计来重新修改

        this.setData({
            today: today,
            userInfo: userInfo
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
        this.initUserProfile();
        this.makeTabData();
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
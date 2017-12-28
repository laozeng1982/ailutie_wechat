// pages/plan/plan_setting/plan_setting.js
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        planSetting: [
            {id: "name", name: "计划名字", type: "input", isPicker: false, value: ''},
            {
                id: "purpose",
                name: "健身目标",
                type: "picker",
                isPicker: true,
                value: ["Muscle Gain", "Fat Lose", "Body Building"],
                description: ["增肌", "减脂", "塑性"],
                index: 0
            },
            {
                id: "grade",
                name: "健身水平",
                type: "picker",
                isPicker: true,
                value: ["Primary", "Medium", "Advanced", "Professional"],
                description: ["初级", "中级", "高级", "骨灰级"],
                index: 0
            },
            {
                id: "targetUser",
                name: "目标人群",
                type: "picker",
                isPicker: true,
                value: ["Male", "Female", "All"],
                description: ["男士", "女士", "全部"],
                index: 0
            },
            {
                id: "facility",
                name: "健身设备",
                type: "picker",
                isPicker: true,
                value: ["Equipment", "Hands"],
                description: ["器械", "徒手"],
                index: 0
            },
            {
                id: "place",
                name: "健身地点",
                type: "picker",
                isPicker: true,
                value: ["Gym", "Playground", "Home"],
                description: ["健身房", "操场", "家里"],
                index: 0
            },
            {id: "description", name: "计划描述", type: "input", isPicker: false, value: ''},
        ],
        planNameTips: "",
        planDescriptionTips: ""
    },

    onPickerChange: function (e) {
        // console.log(e);
        let planSetting = this.data.planSetting;

        for (let setting of planSetting) {
            if (setting.id === e.currentTarget.id) {
                setting.index = parseInt(e.detail.value);
            }
        }

        let planDescriptionTips = app.userInfoLocal.nickName + "的" +
            planSetting[5].description[planSetting[5].index] + planSetting[1].description[planSetting[1].index] + "计划";

        this.setData({
            planSetting: planSetting,
            planDescriptionTips: planDescriptionTips
        });
    },

    onFormSubmit: function (e) {
        // TODO 这一节因为页面数据结构的逻辑不太好，所以判断就写的不好，将来参考userprofile页重写
        // app.currentPlan.name = e.detail.value.name === '' ? this.data.planNameTips : e.detail.value.name;
        // app.currentPlan.purpose = e.detail.value.purpose;
        // app.currentPlan.grade = e.detail.value.grade;
        // app.currentPlan.targetUser = e.detail.value.targetUser;
        // app.currentPlan.place = e.detail.value.place;
        // app.currentPlan.facility = e.detail.value.facility;

        e.detail.value.name = e.detail.value.name === ''
            ? this.data.planNameTips : e.detail.value.name;
        e.detail.value.description = e.detail.value.description === ''
            ? this.data.planDescriptionTips : e.detail.value.description;
        for (let property in e.detail.value) {
            app.currentPlan[property] = e.detail.value[property];
        }

        app.currentPlan.source = app.userInfoLocal.nickName;

        console.log('form发生了submit事件，携带数据为：', e.detail.value);

        // 准备Plan的数据
        wx.navigateTo({
            url: '../plan_details/plan_details?mode=preview',
        });
    },

    onFormReset: function () {

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({});
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
        //根据app.currentPlan设置当前显示
        let planSetting = this.data.planSetting;

        for (let setting of planSetting) {
            setting.index = this.getIndexOfValue(setting, app.currentPlan);
            // console.log(setting.id, setting.index);
        }

        let planDescriptionTips = planSetting[6].value;
        if (planDescriptionTips === '') {
            planDescriptionTips = app.userInfoLocal.nickName + "的" +
                planSetting[5].description[planSetting[5].index] + planSetting[1].description[planSetting[1].index] + "计划"
        }

        this.setData({
            planNameTips: this.data.planSetting[0].value,
            planDescriptionTips: planDescriptionTips,
            planSetting: planSetting
        })
    },

    getIndexOfValue: function (targetData, srcData) {
        let index = 0;

        if (targetData.id in srcData) {
            if (typeof targetData.value === 'string') {
                targetData.value = srcData[targetData.id];
            } else {
                for (let idx = 0; idx < targetData.value.length; idx++) {
                    if (targetData.value[idx] === srcData[targetData.id]) {
                        index = idx;
                    }
                }
            }

        }

        return index;
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
// pages/plan/plan_goal/plan_goal.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        target: [
            {id: 1, text: "减脂", selected: false},
            {id: 2, text: "增肌", selected: false},
            {id: 3, text: "塑形", selected: false},
        ],
        level: [
            {id: 1, text: "零基础小白", selected: false},
            {id: 2, text: "有一定基础", selected: false},
            {id: 3, text: "锻炼达人", selected: false},
        ],
    },

    onGoalTypeSelected: function (e) {
        console.log(e.currentTarget.id);
        var target = this.data.target;
        switch (e.currentTarget.id) {
            case "1":
                target[0].selected = true;
                target[1].selected = false;
                target[2].selected = false;
                break;
            case "2":
                target[0].selected = false;
                target[1].selected = true;
                target[2].selected = false;
                break;
            case "3":
                target[0].selected = false;
                target[1].selected = false;
                target[2].selected = true;
                break;
        }
        this.setData({
            target: target
        });
    },

    onUserTypeSelected: function (e) {
        var level = this.data.level;
        switch (e.currentTarget.id) {
            case "1":
                level[0].selected = true;
                level[1].selected = false;
                level[2].selected = false;
                break;
            case "2":
                level[0].selected = false;
                level[1].selected = true;
                level[2].selected = false;
                break;
            case "3":
                level[0].selected = false;
                level[1].selected = false;
                level[2].selected = true;
                break;
        }
        this.setData({
            level: level
        });
    },

    onNext: function () {
        var selected = false;
        var host = this;
        // for (let item of this.data.target) {
        //     selected = selected || item.selected;
        // }

        // if (!selected) {
        //     app.Util.showWarnToast("还未选择类型", this, 2000);
        //     return;
        // }

        // var selected = false;
        // for (let item of this.data.level) {
        //     selected = selected || item.selected;
        // }

        // if (!selected) {
        //     app.Util.showWarnToast("还未选择类型", this, 2000);
        //     return;
        // }


        wx.showActionSheet({
            itemList: ['使用推荐计划', '自己定制计划'],
            success: function (res) {
                console.log(res.tapIndex);
                switch (res.tapIndex) {
                    case 0:
                        wx.navigateTo({
                            url: '../recommend_planlist/recommend_planlist',
                        });
                        break;
                    case 1:
                        wx.navigateTo({
                            url: '../user_define/select_part',
                        });
                        host.fillPlan();
                        break;
                }
            },
            fail: function (res) {
                console.log(res.errMsg);
            }
        });

    },

    fillPlan: function () {
        // 复制信息

        app.currentPlan.source = app.globalData.wechatUserInfo.nickName;

        for (let item of this.data.target) {
            if (item.selected) {
                app.currentPlan.target = item.text;
                break;
            }
        }

        for (let item of this.data.level) {
            if (item.selected) {
                app.currentPlan.level = item.text;
                break;
            }
        }

        console.log(app.currentPlan);
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
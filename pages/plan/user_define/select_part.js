// pages/plan/user_define/select_part.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        repeatPattern: [
            {id: 1, name: "按周重复", selected: true},
            {id: 2, name: "按周交替", selected: false},
            // {id: 3, name: "按固定天重复", selected: false}
        ],
        partList: '',
    },

    onPartSelected: function (e) {
        var partList = this.data.partList;
        for (let idx = 0; idx < partList.length; idx++) {
            if (parseInt(e.currentTarget.id) === parseInt(partList[idx].partId)) {
                partList[idx].selected = !partList[idx].selected;
                break;
            }
        }

        // 简单的做法，但是有可能id被人为修改，有可能出错
        // partList[parseInt(e.currentTarget.id) -1].selected =
        // !partList[parseInt(e.currentTarget.id) -1].selected;

        this.setData({
            partList: partList
        });
    },

    onNext: function (e) {
        var selectedPartId = [];
        var selectedPartName = [];
        var hasSelectedPart = false;
        for (let item of this.data.partList) {

            if (item.selected) {
                hasSelectedPart = true;
                selectedPartId.push(item.partId);
                selectedPartName.push(item.partName);
            }
        }

        if (!hasSelectedPart) {
            app.Util.showWarnToast("还未选择部位", this, 2000);
            return;
        }

        app.selectedPartId = selectedPartId;
        app.selectedPartName = selectedPartName;

        wx.navigateTo({
            url: './select_date',
        });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var systemSetting = app.Controller.loadData(
            app.StorageType.SystemSetting.value,
            app.StorageType.SystemSetting);


        this.setData({
            partList: systemSetting.bodyPartList.partList
        });

        console.log(this.data.partList);
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
// pages/plan/user_define/select_date.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        repeatPattern: [
            { id: 1, name: "按周重复", selected: true },
            { id: 2, name: "按周交替", selected: false },
            // {id: 3, name: "按固定天重复", selected: false},
        ],
        selectedPartNames: '',
        selectedPartNamesArray: [],

        weekArr: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
        weekList: [
            { id: 0, value: '日', checked: false },
            { id: 1, value: '一', checked: false },
            { id: 2, value: '二', checked: false },
            { id: 3, value: '三', checked: false },
            { id: 4, value: '四', checked: false },
            { id: 5, value: '五', checked: false },
            { id: 6, value: '六', checked: false }
        ],
    },

    onPatternChange: function (e) {
        var repeatPattern = this.data.repeatPattern;
        switch (e.detail.value) {
            case "1":
                repeatPattern[0].selected = true;
                repeatPattern[1].selected = false;
                break;
            case "2":
                repeatPattern[0].selected = false;
                repeatPattern[1].selected = true;
                break;
            default:
                break;
        }

        this.setData({
            repeatPattern: repeatPattern
        });
    },

    onSelectAction: function (e) {
        console.log(e);

        wx.navigateTo({
            url: './select_actions?selectedPart=' + e.currentTarget.id,
        });
    },

    onSelectDate: function (e) {
        console.log(e.currentTarget.id);
        var weeks = this.data.weekList;
        weeks[parseInt(e.currentTarget.id)].selected = !weeks[parseInt(e.currentTarget.id)].selected;
        this.setData({
            weekList: weeks

        });

    },

    onNext: function (e) {

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

        this.setData({
            selectedPartNames: app.selectedPartName.join("，"),
            selectedPartNamesArray: app.selectedPartName
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
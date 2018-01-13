// system.js

const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        storageStatus: '',
        settings: '',
        // onAppLoad（启动时），onManual（手动），onValueChanged（数据改变时）
        syncSettingValues: ["onAppLoad", "onManual", "onValueChanged"],
        syncSettingChinese: ["程序启动时", "手动同步", "有数据变化时"],
        syncSettingIndex: 0
    },

    onSync: function (e) {
        console.log(e);
    },

    onSyncSettingChange: function (e) {
        console.log(e);
        let valueIndex = parseInt(e.detail.value);
        let settings = this.data.settings;
        settings.SyncSetting = this.data.syncSettingValues[valueIndex];

        this.setData({
            syncSettingIndex: valueIndex,
            settings: settings
        });
    },

    onDelete: function (e) {
        console.log(e);
        let key = e.currentTarget.dataset.key;
        console.log(key);

        let host = this;

        wx.showModal({
            title: '删除记录',
            content: '您确定删除该条记录，如果未同步，将无法找回哦。',
            success: function (res) {
                if (res.confirm) {
                    host.removeStorage(key);
                    console.log('用户点击确定');
                } else if (res.cancel) {
                    console.log('用户点击取消')
                }
            }
        });
    },

    removeStorage: function (key) {
        wx.removeStorageSync(key);
        let storageStatus = wx.getstorageStatusSync();

        this.setData({
            storageStatus: storageStatus
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '软件设置',
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

        let results = wx.getStorageInfoSync();
        let settings = wx.getStorageSync("Settings");
        let syncSettingIndex = 0;
        let syncSettingValues = this.data.syncSettingValues;

        // 同步本地设置
        for (let idx = 0; idx < syncSettingValues.length; idx++) {
            if (settings.SyncSetting === syncSettingValues[idx]) {
                syncSettingIndex = idx;
            }
        }

        this.setData({
            storageStatus: results,
            syncSettingIndex: syncSettingIndex,
            settings: settings
        });

        console.log("System page onShow: ", this.data.storageStatus);
        console.log("System page onShow: ", this.data.settings);

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
        console.log("System Page unload!");
        console.log("System page onShow: ", this.data.settings);

        app.Util.saveData(app.Settings.Storage.Settings, this.data.settings);
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
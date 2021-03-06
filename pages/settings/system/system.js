// system.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storageInfo: '',

    },

    onDelete: function (e) {
        var key = e.currentTarget.dataset.key;
        console.log(key);

        var host = this;

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
        var storageInfo = this.data.storageInfo;

        for (var idx = 0; idx < storageInfo.keys.length; idx++) {
            if (storageInfo.keys[idx] === key) {
                storageInfo.keys.splice(idx, 1);
                break;
            }
        }

        this.setData({
            storageInfo: storageInfo
        });

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

        try {
            var results = wx.getStorageInfoSync();

            this.setData({
                storageInfo: results
            });

            console.log("System page onShow: ", this.data.storageInfo);
        } catch (e) {

        }

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
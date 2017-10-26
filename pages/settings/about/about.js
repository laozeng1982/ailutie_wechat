// about.js
import Body from '../../../datamodel/Body.js'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // imageUrl: "https://mf991b83b0.cn1.hana.ondemand.com/m/images/bodyparts/abs.png",
        imageUrl: "",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.setNavigationBarTitle({
            title: '关于我们',
        });
        let imageUrl;
        let body = new Body.Body();
        body.makeDefaultDefaultPartList();
        for (let part of body.parts) {
            for (let action of part.actionSet) {
                let url = "https://mf991b83b0.cn1.hana.ondemand.com/m/" + action.imageUrl;
                console.log(url);
                wx.downloadFile({
                    url: url, 
                    success: function (res) {
                        wx.saveFile({
                            tempFilePath: res.tempFilePath,
                        });
                    }
                });
            }
        }

        wx.getSavedFileList({
            success: function (res) {
                console.log(res);
                imageUrl = res.fileList[0].filePath;
                console.log(imageUrl);
            }
        });

        this.setData({
            imageUrl: imageUrl
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
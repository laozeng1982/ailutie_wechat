//index.js
import User from '../../datamodel/UserInfo.js'
import util from '../../utils/util.js'

const app = getApp()

Page({
    data: {
        motto: 'Hello',
        wechatUserInfo: {},
        notSignUp: true,

        imgUrls: [
            '../image/Home_selected.png',
            '../image/Home_unselected.png',
            '../image/Home_selected.png'
        ],

        indicatorDots: false,
        autoplay: false,
        interval: 5000,
        duration: 1000
    },

    //事件处理函数
    bindViewTap: function () {
        wx.switchTab({
            url: '../listplan/plan',
        })
    },

    onSwiperChange: function (e) {
        // console.log(e);
        console.log(e.detail.current, e.target.id);
    },


    onLoad: function () {
        console.log('index page onLoad');
        var that = this;

        var notSignUp = util.checkSignUp();
        console.log("notSignUp is: ", notSignUp);

        //调用应用实例的方法获取全局数据
        app.getWechatUserInfo(function (wechatUserInfo) {
            //更新数据
            that.setData({
                wechatUserInfo: wechatUserInfo,
                motto: 'Hello ' + wechatUserInfo.nickName,
                notSignUp: notSignUp
            });
        });
        // console.log(this.data.wechatUserInfo);
        // console.log(this.data.motto);
    },


})
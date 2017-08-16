//index.js
//获取应用实例
var app = getApp()

import User from '../../datamodel/User.js'

Page({
  data: {
    motto: 'Hello',
    wechatUserInfo: {},
  },
  //事件处理函数
  bindViewTap: function () {
    wx.switchTab({
      url: '../listplan/plan',
    })
  },
  onLoad: function () {
    console.log('index page onLoad');
    var that = this;
    //调用应用实例的方法获取全局数据
    app.getWechatUserInfo(function (wechatUserInfo) {
      //更新数据
      that.setData({
        wechatUserInfo: wechatUserInfo,
        motto: 'Hello ' + wechatUserInfo.nickName
      })
    });
    console.log(this.data.wechatUserInfo);
    console.log(this.data.motto);
  }
})
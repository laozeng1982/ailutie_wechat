// calender.js
import util from '../../utils/util.js'

//获取应用实例
var app = getApp();
var calendarSignData;
var date;
var calendarSignDay;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    todayTrainPlan: [],
    curMovementIndex: '',
    curTrainContent: [],
    curMovementName: ''
  },

  bindTrainPlanRbxChange: function (e) {
    var curMovementIndex = e.detail.value;
    var curTrainContent = [];
    var curMovementName = '';
    this.setData({
      curMovementIndex: curMovementIndex
    });

    for (var item of this.data.todayTrainPlan) {
      console.log("curSelect: " + curMovementIndex + ", moveIndx: " + item.movementIndex);
      if (curMovementIndex == item.movementIndex) {
        for (var idx = 0; idx < item.groupCount; idx++) {
          curTrainContent.push({
            contentIndex: idx + 1,
            contentMovementName: item.movementName,
            contentMovementCount: item.movementCount,
            contentMovementWeight: item.movementWeight,
            contentMovementFeeling: ''
          });
        }
        curMovementName = item.movementName;
        break;
      }
    }

    this.setData({
      curMovementName: curMovementName,
      curTrainContent: curTrainContent
    });
    console.log('radio发生change事件，携带value值为：', this.data.curMovementIndex);
    console.log("this.data.curTrainContent", this.data.curTrainContent);
  },

  bindTrainContentRbxChange: function (e) {

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
    var todayTrainPlan = [];
    var allTrainPlan = wx.getStorageSync('TrainPlan');
    var today = util.formatDateToString(new Date());
    console.log("allTrainPlan", allTrainPlan);
    console.log("today: ", today);

    for (var idx = 0; idx < allTrainPlan.length; idx++) {
      if (allTrainPlan[idx].date == today) {
        todayTrainPlan.push(allTrainPlan[idx]);
      }
    }

    if (todayTrainPlan.length == 0) {
      wx.showToast({
        title: '还没有计划',
      });
    } else {
      this.setData({
        todayTrainPlan: todayTrainPlan
      });
    }

    console.log("this.data.todayTrainPlan", this.data.todayTrainPlan);

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
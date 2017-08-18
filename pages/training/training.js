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
    curMovementName: '',
    curMovementId: 0, //初始选中第一个
    curDoingNumber: 1, //当前做的第几组  

    scrollY: true,
    planScrollHeight: 300,  //计划的scroll高度
    trainScrollHeight: 500,  //动作列表的scroll高度
    actionName: '',
    showModal: false
  },

  loadData: function () {
    var todayTrainPlan = [];
    var allTrainPlan = wx.getStorageSync('TrainPlan');
    var today = util.formatDateToString(new Date());
    console.log("allTrainPlan", allTrainPlan);
    console.log("today: ", today);

    for (var item of allTrainPlan) {
      if (item.planDate == today) {
        todayTrainPlan = item.planMvList;
      }
    }

    if (todayTrainPlan.length == 0) {
      wx.showToast({
        title: '还没有计划',
      });
    }

    this.setData({
      todayTrainPlan: todayTrainPlan
    });

    console.log("this.data.todayTrainPlan", this.data.todayTrainPlan);
  },

  /**
   * 当今日计划中，一个动作被选上的时候，列出这组所有的动作细节
   */
  onGroupSelected: function (e) {
    console.log("in onPlanSelected, id: ", e.detail.value);

    // this.data.todayTrainPlan[e.detail.value -1].selected = true;

    var curMovementName;
    var curMovementId;

    for (var item of this.data.todayTrainPlan) {
      if (item.id == e.detail.value) {
        curMovementName = item.movementName;
        curMovementId = item.id - 1;
        break;
      }
    }

    this.setData({
      curMovementName: curMovementName,
      curMovementId: curMovementId,
      // todayTrainPlan: this.data.todayTrainPlan
    });
  },

  /**
   * 点击该checkbox时，表示动作已经完成
   */
  onMovementFinished: function (e) {

    var checked = e.detail.value;
    // console.log("checked: ", checked);


    var tmpPlanAmount = this.data.todayTrainPlan[this.data.curMovementId].planAmount;
    // console.log(tmpPlanAmount);
    //这里不能绑定纯数字的item，否则无法监听，所以，id要用String转成字符串
    for (var idx = 0; idx < tmpPlanAmount.length; idx++) {
      if (checked.indexOf(String(tmpPlanAmount[idx].id)) !== -1) {
        this.data.todayTrainPlan[this.data.curMovementId].planAmount[idx].finished = true;
      } else {
        this.data.todayTrainPlan[this.data.curMovementId].planAmount[idx].finished = false;
      }
    }
    var curDoingNumber = checked.length != 6 ? checked.length : 6;
    this.setData({
      todayTrainPlan: this.data.todayTrainPlan,
      curDoingNumber: curDoingNumber
    });

    // console.log("in onPlanSelected, this.data.todayTrainPlan[this.data.curMovementId].planAmount",
    //   this.data.todayTrainPlan[this.data.curMovementId].planAmount);
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
    this.loadData();

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
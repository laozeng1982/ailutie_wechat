//app.js
import util from './utils/util.js'

App({
  onLaunch: function () {

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    });

    // this.getMovementsList();
  },

  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  // getMovementsList: function () {
  //   console.log("here");
  //   this.globalData.allMovementsList = wx.getStorage({
  //     key: 'TrainPlan',
  //     success: function (res) {
  //     },
  //   });
  //   console.log(this.globalData.allMovementsList);
  // },

  globalData: {
    userInfo: null,
    allMovementsList: [],
    hasTrainPlanDateList: [],
    selectedDateString: util.formatDateToString(new Date()),
    selectedDate: new Date(),
    movementMultiArray: [['胸上部', '胸中部', '胸下部', '肩前束', '肩中束', '肩后束', '背', '腹', '腰', '肱二头', '肱三头', '股四头', '股二头', '小腿'], ['上斜杠铃推举', '上斜哑铃推举', '飞鸟夹胸', '器械夹胸', '窄距俯卧撑']],
    bodyPartArray: ['胸上部', '胸中部', '胸下部', '肩前束', '肩中束', '肩后束', '背', '腰', '腹', '肱二头', '肱三头', '股四头', '股二头', '小腿'],

    movementNameArrayUpperPectorales: ['上斜杠铃推举',
      '上斜哑铃推举',
      '飞鸟夹胸',
      '器械夹胸',
      '窄距俯卧撑',],
    movementNameArrayMiddlePectorales: ['平卧杠铃推举',
      '平卧哑铃推举',
      '飞鸟夹胸',
      '器械夹胸',
      '窄距俯卧撑',],
    movementNameArrayDownPectorales: ['下斜杠铃推举',
      '下斜哑铃推举',
      '飞鸟夹胸',
      '器械夹胸',
      '窄距俯卧撑',],
    movementNameArrayFrontShoulder: ['坐姿杠铃推举',
      '坐姿杠铃劲前推举',
      '哑铃侧平举',
      '哑铃前平举',
      '阿诺德推肩',
      '绳索前平举',
      '坐姿器械反式飞鸟',
      '俯身哑铃飞鸟'],
    movementNameArrayMiddleShoulder: ['坐姿杠铃推举',
      '坐姿杠铃劲前推举',
      '哑铃侧平举',
      '哑铃前平举',
      '阿诺德推肩',
      '绳索前平举',
      '坐姿器械反式飞鸟',
      '俯身哑铃飞鸟'],
    movementNameArrayBackShoulder: ['坐姿杠铃推举',
      '坐姿杠铃劲前推举',
      '哑铃侧平举',
      '哑铃前平举',
      '阿诺德推肩',
      '绳索前平举',
      '坐姿器械反式飞鸟',
      '俯身哑铃飞鸟'],
    movementNameArrayDorsal: ['宽握引体向上',
      '窄握引体向上 ',
      '横杠缆绳下拉 ',
      '杠铃划船',
      '杠铃硬拉',
      '哑铃硬拉',
      '坐姿划船',
      '单臂哑铃划船',
      '弹力绳背拉',
      '杠铃反斜拉'],
    movementNameArrayAbdomen: ['仰卧起坐',
      '窄握引体向上 ',
      '横杠缆绳下拉 ',
      '杠铃划船',
      '杠铃硬拉',
      '哑铃硬拉',
      '坐姿划船',
      '单臂哑铃划船',
      '弹力绳背拉',
      '杠铃反斜拉'],
    movementNameArrayThigh: ['山羊挺身',
      '窄握引体向上 ',
      '横杠缆绳下拉 ',
      '杠铃划船',
      '杠铃硬拉',
      '哑铃硬拉',
      '坐姿划船',
      '单臂哑铃划船',
      '弹力绳背拉',
      '杠铃反斜拉'],

  movementNoMultiArray: [
    [1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], //group count
    [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50], //movement count
    [2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120]//movement weight
  ],
  },

})

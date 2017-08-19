//app.js
/**
 * 小程序总入口
 */
import util from './utils/util.js'

App({
  onLaunch: function () {
    console.log("app onLoad");
    //为了提升体验，首次登陆不强制注册，可以补充注册
    // var userInfo = wx.getStorageSync("UserInfo");
    // console.log("userInfo: ", userInfo);
    // var userUID = userInfo.userUID;

    // if (userInfo.defaultWechatLogin) {
    //   // 使用微信登录
    //   console.log("user wechat ID");

    // } else if (typeof (userUID) == "undefined") {
    //   //去注册
    //   wx.navigateTo({
    //     url: 'pages/signUp/signUp1st/signUp1st',
    //   });
    // }

    // 准备数据：
    this.globalData.movementMultiArray.push(this.globalData.bodyPartArray);
    // this.globalData.movementMultiArray.push([]);
    this.globalData.movementMultiArray.push(this.globalData.movementNameArray);
    //默认使用登录
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
              this.globalData.wechatUserInfo = res.userInfo
              console.log("app onLoad, res.userInfo: ", res.userInfo);
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

    console.log("app onLoad done");
  },

  getWechatUserInfo: function (cb) {
    var that = this
    if (this.globalData.wechatUserInfo) {
      typeof cb == "function" && cb(this.globalData.wechatUserInfo)
    } else {
      //调用登录接口
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.wechatUserInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.wechatUserInfo)
        }
      })
    }
  },

  system: {
    userConfig: {
      measurement: "Kg",
    },
  },

  globalData: {
    userInfo: null,
    wechatUserInfo: null,

    isLogin: false,//登陆状态记录
    allMovementsList: [],
    hasTrainPlanDateList: [],
    selectedDateString: util.formatDateToString(new Date()),
    selectedDate: new Date(),
    //初始化
    movementMultiArray: [],
    bodyPartArray: ['胸部', '肩部', '背部', '腰部', '腹部', '肱二头', '肱三头', '小臂', '股二头', '股四头', '小腿'],
    movementNameArray: ['上斜杠铃推举', '平卧杠铃推举', '平卧哑铃推举', '下斜杠铃推举', '下斜哑铃推举', '上斜哑铃推举', '飞鸟夹胸', '器械夹胸', '窄距俯卧撑'],

    //0、胸部
    movementNameArrayPectorales: [
      '上斜杠铃推举',
      '上斜哑铃推举',
      '平卧杠铃推举',
      '平卧哑铃推举',
      '下斜杠铃推举',
      '下斜哑铃推举',
      '双杠臂屈伸',
      '拉力器十字夹胸',
      '哑铃飞鸟夹胸',
      '蝴蝶机器械夹胸',
      '窄距俯卧撑',
      '标准俯卧撑',
      '宽距俯卧撑',],

    //1、肩部
    movementNameArrayShoulder: [
      '坐姿杠铃劲前推举',
      '站姿哑铃前平举',
      '站姿绳索前平举',
      '站姿哑铃侧平举',
      '站姿杠铃划船',
      '阿诺德推肩',
      '坐姿杠铃劲后推举',
      '坐姿器械反式飞鸟',
      '俯身哑铃飞鸟',
      '俯身绳索侧平举',
      '俯身杠铃提拉',],

    //2、背部
    movementNameArrayDorsal: [
      '宽握引体向上',
      '窄握引体向上',
      '横杠缆绳下拉',
      '杠铃划船',
      '杠铃硬拉',
      '哑铃硬拉',
      '坐姿划船',
      '单臂哑铃划船',
      '弹力绳背拉',
      '杠铃反斜拉',],

    //3、腰部
    movementNameArrayWaist: [
      '杠铃硬拉',
      '山羊挺身',
      '坐姿杠铃挺身',
      '平板支撑',
      '侧平板支撑',
      '俯卧异侧起',
    ],

    //4、腹部
    movementNameArrayAbdomen: [
      '仰卧起坐',
      '仰卧卷腹',
      '仰卧屈膝两头起',
      '仰卧举腿',
      '悬垂举腿',
      '平板支撑',
      '侧身卷腹',
      '负重体侧屈',
      '空中蹬车',
      '侧平板支撑',
    ],

    //5、肱二头
    movementNameArrayArmBiceps: [
      '站姿杠铃弯举',
      '坐姿哑铃弯举',
      '托板弯举',
      '拉力器弯举',
    ],

    //6、肱三头
    movementNameArrayArmTriceps: [
      '杠铃颈后臂屈伸',
      '哑铃颈后臂屈伸',
      '双杆臂屈伸',
      '仰卧杠铃臂屈伸',
      '哑铃俯身臂屈伸',
      '拉力器屈臂下压',
      '凳上反屈伸',
      '窄握杠铃推举',
      '窄距俯卧撑',
    ],

    //7、小臂
    movementNameArrayForeArm: [
      '卷重物',
      '哑铃腕弯举',
      '杠铃背后腕腕举',
      '杠铃腕弯举',
      '绳索腕弯举',
      '引体悬挂',
    ],

    //8、股二头
    movementNameArrayFemorisBiceps: [
      '俯卧腿弯举',
      '单腿山羊挺身',
      '杠铃直腿硬拉',
      '反向腿弯举',
      '跪姿髋部伸展',
    ],

    //9、股四头
    movementNameArrayFemorisQuadriceps: [
      '杠铃深蹲',
      '史密斯深蹲',
      '哈克深蹲',
      'T杠深蹲',
      '哑铃深蹲',
      '负重箭步蹲',
      '单腿前蹲',
      '箭步蹲',
      '斜卧负重腿举',
      '坐姿水平蹬腿',
      '坐姿腿屈伸',
    ],

    //10、小腿
    movementNameArrayShank: ['站姿杠铃提踵',
      '站姿单腿哑铃提踵 ',
      '坐姿杠铃负重提踵',
    ],

    movementNoMultiArray: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], //group count
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 20, 25, 30, 35, 40, 45, 50], //movement count
      [2, 4, 6, 8, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120]//movement weight
    ],
  },

})

// plan.js
import util from '../../utils/util.js'
import datamodel from '../datamodel/datamodel.js'

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //用来保存当前选中的日期，默认是当天
    // selectedDate: util.formatDateToString(app.globalData.selectedDate),
    selectedDate: util.formatDateToString(new Date()),

    //存放所有Storage中的计划记录
    allTrainPlan: [],
    curTrainPlan: '',

    //初始化，这些数据一是用来显示初始化设置
    //仅用来记录当天记录号
    curMovementAmount: 1,

    //指定当前修改的记录ID
    curSelectedMovementId: '',

    //临时存放新建，或者正在修改的动作
    tmpMovement: '',

    //2D 数组，用来存放动作
    movementMultiArray: app.globalData.movementMultiArray,
    //动作索引
    multiMovementIndex: [0, 0],
    multiMovementNoIndex: [0, 0, 0],

    //3D 数组，用来存放动作组数，次数和重量
    movementNoMultiArray: app.globalData.movementNoMultiArray,


    //组件控制
    scrollY: true,
    scrollHeight: 500,
    actionName: '',
    showModal: false
  },

  swipeCheckX: 35, //激活检测滑动的阈值
  swipeCheckState: 0, //0未激活 1激活
  maxMoveLeft: 185, //消息列表项最大左滑距离
  correctMoveLeft: 175, //显示菜单时的左滑距离
  thresholdMoveLeft: 75,//左滑阈值，超过则显示菜单
  lastShowMovementId: '', //记录上次显示菜单的消息id
  moveX: 0,  //记录平移距离
  showState: 0, //0 未显示菜单 1显示菜单
  touchStartState: 0, // 开始触摸时的状态 0 未显示菜单 1 显示菜单
  swipeDirection: 0, //是否触发水平滑动 0:未触发 1:触发水平滑动 2:触发垂直滑动

  //------------------------------------------------------
  //以下是监听函数，及其对应的处理操作

  onLastDate: function () {
    this.moveDay(false);
  },

  onNextDate: function () {
    this.moveDay(true);
  },

  moveDay: function (isNext) {
    this.savePlan();

    var dateAfterMove = util.getMoveDays(this.data.selectedDate, isNext, 1);
    this.setData({
      selectedDate: dateAfterMove
    });

    this.loadData();
  },

  /**
   * 响应点击日期按钮，跳转日历页面
   */
  onSelectDate: function () {
    //TODO 增加读取数据功能
    //离开页面前，先保存
    console.log("select date");
    // this.savePlan();
    wx.navigateTo({
      url: '../ui/calender/calender',
    });
  },

  /**
   * 响应界面调用的函数
   */
  onAddMovement: function () {
    if (util.isExpired(this.data.selectedDate)) {
      console.log("isExpired!!!!!!!!!!");
      return;
    } else {
      this.setData({
        actionName: "添加动作",
        showModal: true
      });
    }
  },

  /**
 * 具体处理添加动作的业务
 */
  addMovement: function () {
    var success = false;
    console.log("in addMovement: ", this.data.curTrainPlan);

    if (!this.checkParameter())
      return success;
    //判断重复
    this.data.tmpMovement.date = this.data.selectedDate;
    console.log("id is: ", this.data.tmpMovement.id);
    this.data.tmpMovement.id = this.data.curMovementAmount;
    console.log("id is: ", this.data.tmpMovement.id);
    var toBeAdd = new datamodel.Movement();

    //必须要使用copyfrom，否则添加的都是一样的。不能使用：toBeAdd = this.data.tmpMovement
    toBeAdd.fullCopyFrom(this.data.tmpMovement);
    console.log("this.data.tmpMovement is: ", this.data.tmpMovement);
    console.log("toBeAdd is: ", toBeAdd);
    if (!this.data.curTrainPlan.add(toBeAdd)) {
      wx.showToast({
        title: '您已添加该动作。',
        icon: 'warn'
      });
      success = false;
      return success;
    } else {
      console.log("add a new movement: ", toBeAdd);
      this.data.curMovementAmount++;
    }

    console.log("new length", this.data.curMovementAmount);

    this.setData({
      curMovementAmount: this.data.curMovementAmount,
      curTrainPlan: this.data.curTrainPlan
    });

    console.log('this.data.curMovementAmount', this.data.curMovementAmount);
    console.log("after add: ", this.data.curTrainPlan);
    success = true;

    return success;
  },

  /**
   * 响应处理修改动作的业务
   */
  onModifyMovement: function (e) {
    if (util.isExpired(this.data.selectedDate)) {
      console.log("isExpired!!!!!!!!!!");
      return;
    }

    //把这个Modify界面重置到该动作的参数
    var tmp = this.data.curTrainPlan.movementList[e.currentTarget.id - 1];
    this.setPickerIndex(tmp.partName, tmp.movementName, tmp.groupCount, tmp.movementCount, tmp.movementWeight);

    this.setData({
      curSelectedMovementId: e.currentTarget.id,
      tmpMovement: tmp,
      actionName: "修改动作",
      showModal: true
    });
  },

  /**
   * 具体处理修改动作的业务
   */
  modifyMovement: function () {
    var success = false;

    //准备修改的数据
    this.data.tmpMovement.id = this.data.curSelectedMovementId;
    console.log("new modify movement is: ", this.data.tmpMovement);

    success = this.data.curTrainPlan.modify(this.data.curSelectedMovementId, this.data.tmpMovement);

    if (!success) {
      wx.showToast({
        title: '动作重复了',
      });
    } else {
      this.setData({
        curTrainPlan: this.data.curTrainPlan
      });
      console.log('modify completed!');
    }



    return success;
  },

  /**
   * 检查输入的合法性
   */
  checkParameter: function () {
    if (typeof (this.data.tmpMovement.partName) == "undefined") {
      wx.showToast({
        title: '请选择部位',
      });
      return false;
    }
    if (typeof (this.data.tmpMovement.movementName) == "undefined") {
      wx.showToast({
        title: '请选择部位',
      });
      return false;
    }
    if (typeof (this.data.tmpMovement.groupCount) == "undefined") {
      wx.showToast({
        title: '请选择动作组数',
      });
      return false;
    }
    if (typeof (this.data.tmpMovement.movementCount) == "undefined") {
      wx.showToast({
        title: '请选择动作次数',
      });
      return false;
    }
    if (typeof (this.data.tmpMovement.movementWeight) == "undefined") {
      wx.showToast({
        title: '请选择动作重量',
      });
      return false;
    }

    return true;
  },

  /**
   * 根据当前选中的数据，设置动作索引，方便用户选中
   */
  setPickerIndex: function (partName, movementName, gCount, mCount, mWeight) {
    var partIdx;  //bodayPart Index
    var movementIndx; //movementName Index
    //部位搜索
    for (var idx = 0; idx < this.data.movementMultiArray[0].length; idx++) {
      if (this.data.movementMultiArray[0][idx] === partName) {
        console.log("match", partName);
        partIdx = idx;
        break;
      }
    }

    //动作搜索
    for (var idx = 0; idx < this.getMovementNamePickerList(partIdx).length; idx++) {
      if (this.getMovementNamePickerList(partIdx)[idx] === movementName) {
        console.log("match", movementName);
        movementIndx = idx;
        break;
      }
    }

    //置索引
    var movementMultiArray = this.data.movementMultiArray;
    movementMultiArray[1] = this.getMovementNamePickerList(partIdx);

    var multiMovementIndex = [partIdx, movementIndx];

    //组数，次数和重量
    // var gCountIdx;
    // var mCountIdx;
    // var mWeightIdx;
    // for (var idx = 0; idx < this.data.movementNoMultiArray[0].length; idx++) {
    //   if (gCount < this.data.movementNoMultiArray[0][0]) {
    //     gCountIdx = 0;
    //     break;
    //   }
    //   if (this.data.movementNoMultiArray[0][idx] === gCount) {
    //     console.log("match", gCount);
    //     gCountIdx = idx;
    //     break;
    //   }
    // }

    // for (var idx = 0; idx < this.data.movementNoMultiArray[0].length; idx++) {
    //   if (this.data.movementNoMultiArray[0][idx] === gCount) {
    //     console.log("match", gCount);
    //     gCountIdx = idx;
    //   }
    // }

    //暂时手动置在中间
    var multiMovementNoIndex = [5, 5, 5];

    this.setData({
      movementMultiArray: movementMultiArray,
      multiMovementIndex: multiMovementIndex,
      multiMovementNoIndex: multiMovementNoIndex
    });
  },

  /**
  * 
  */
  removeMovement: function (id) {
    console.log("this.data.curTrainPlan", this.data.curTrainPlan);
    this.data.curTrainPlan.remove(id);
    this.setData({
      curTrainPlan: this.data.curTrainPlan
    });
    // console.log('remove', e.detail.value)
  },

  //响应的是，picker点确定之后
  onMovementChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiMovementIndex: e.detail.value
    })
  },

  //
  /**
   *Picker动作选择的监听，改变部位，其随后的动作会改变
   */
  onMovementColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      movementMultiArray: this.data.movementMultiArray,
      multiMovementIndex: this.data.multiMovementIndex,
      tmpMovement: this.data.tmpMovement

    };

    data.multiMovementIndex[e.detail.column] = e.detail.value;
    var columnIdx = e.detail.column;
    var rowIdx = e.detail.value;

    switch (e.detail.column) {
      case 0:
        data.movementMultiArray[1] = this.getMovementNamePickerList(data.multiMovementIndex[0]);
        data.multiMovementIndex[1] = 0;
        break;
      case 1:
        {
          data.multiMovementIndex[1] = e.detail.value;
          break;
        }
    }

    data.tmpMovement.partName = data.movementMultiArray[0][data.multiMovementIndex[0]];
    data.tmpMovement.movementName = data.movementMultiArray[1][data.multiMovementIndex[1]];

    console.log(this.data.tmpMovement.partName, this.data.tmpMovement.movementName);

    this.setData(data);
  },

  /**
   * 根据第一列数据的变化，动态获取第二列的值
   */
  getMovementNamePickerList: function (idxOfColumn1) {

    var movementNamePickerList;
    switch (idxOfColumn1) {
      case 0:
        movementNamePickerList = app.globalData.movementNameArrayUpperPectorales;
        break;
      case 1:
        movementNamePickerList = app.globalData.movementNameArrayMiddlePectorales;
        break;
      case 2:
        movementNamePickerList = app.globalData.movementNameArrayDownPectorales;
        break;
      case 3:
        movementNamePickerList = app.globalData.movementNameArrayFrontShoulder;
        break;
      case 4:
        movementNamePickerList = app.globalData.movementNameArrayMiddleShoulder;
        break;
      case 5:
        movementNamePickerList = app.globalData.movementNameArrayBackShoulder;
        break;
      case 6:
        movementNamePickerList = app.globalData.movementNameArrayDorsal;
        break;
      case 7:
        movementNamePickerList = app.globalData.movementNameArrayAbdomen;
        break;
      case 8:
        movementNamePickerList = app.globalData.movementNameArrayThigh;
        break;
      default:
        break;
    };
    return movementNamePickerList;
  },

  /**
   * 数字选择Picker的坚挺
   */
  onNumberChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);

    var tmpMovement = this.data.tmpMovement;

    var selectedRowArr = e.detail.value;
    tmpMovement.groupCount = this.data.movementNoMultiArray[0][selectedRowArr[0]];
    tmpMovement.movementCount = this.data.movementNoMultiArray[1][selectedRowArr[1]];
    tmpMovement.movementWeight = this.data.movementNoMultiArray[2][selectedRowArr[2]];

    this.setData({
      tmpMovement: tmpMovement
    });
    console.log('组数：' + tmpMovement.groupCount + ', ' + '次数：' + tmpMovement.movementCount + ', ' + "重量：" + tmpMovement.movementWeight);

  },

  loadData: function () {
    //同步获取
    var allTrainPlan = wx.getStorageSync('TrainPlan');

    if (allTrainPlan.length == 0)
      allTrainPlan = [];

    console.log('load allTrainPlan data: ', allTrainPlan);

    var curTrainPlan = new datamodel.SingleDatePlan();
    //如果有记录，从存储数据里读，如果没有记录，就初始化
    var hasPlan = false;
    if (allTrainPlan.length > 0) {
      for (var item of allTrainPlan) {
        if (item.planDate == this.data.selectedDate) {
          curTrainPlan.planDate = this.data.selectedDate;
          curTrainPlan.movementList = item.movementList;
          hasPlan = true;
        }
      };

    }
    if (allTrainPlan.length === 0 || !hasPlan) {
      curTrainPlan.planDate = this.data.selectedDate;
      curTrainPlan.movementList = [];
    }

    console.log("after loadData, curTrainPlan: ", curTrainPlan);

    this.setData({
      curMovementAmount: curTrainPlan.movementList.length + 1,
      allTrainPlan: allTrainPlan,
      curTrainPlan: curTrainPlan
    });
  },

  savePlan: function () {
    //先看是否为空，为空直接增加，然后查重，日期重的直接替换，日期没有的直接增加
    var allTrainPlan = this.data.allTrainPlan;

    if (allTrainPlan.length == 0) {
      allTrainPlan.push(this.data.curTrainPlan);
    } else {
      //查重
      var hasThisDay = false;

      for (var item of allTrainPlan) {
        if (this.data.selectedDate == item.planDate) {
          console.log("we have this day");
          hasThisDay = true;
          break;
        } else {
          console.log("we dont have this day");
        }
      }

      //没有这天的记录，直接增加
      if (!hasThisDay) {
        allTrainPlan = allTrainPlan.concat(this.data.curTrainPlan);
      } else {  //有这天的记录，删除再增加
        var start = 0;  //删除开始的索引
        var count = 0;  //删除的个数

        for (var idx = 0; idx < allTrainPlan.length; idx++) {
          if (this.data.selectedDate == allTrainPlan[idx].planDate) {
            start = idx;
            break;
          }
        }

        for (var idx = 0; idx < allTrainPlan.length; idx++) {
          if (this.data.selectedDate == allTrainPlan[idx].planDate) {
            count++;
          }
        }

        allTrainPlan.splice(start, count);
        allTrainPlan = allTrainPlan.concat(this.data.curTrainPlan);
      }
    }

    console.log("all....", allTrainPlan);
    this.setData({
      allTrainPlan: allTrainPlan
    });
    console.log("this all....", this.data.allTrainPlan);
    wx.setStorageSync('TrainPlan', this.data.allTrainPlan);
  },

  // for modal control

  /**
   * 弹出框蒙层截断touchmove事件
   */
  preventTouchMove: function () {
  },
  /**
   * 隐藏模态对话框
   */
  hideModal: function () {
    this.setData({
      showModal: false
    });

  },
  /**
   * 对话框取消按钮点击事件
   */
  onCancel: function () {
    this.hideModal();
  },
  /**
   * 对话框确认按钮点击事件，处理添加或修改业务
   */
  onConfirm: function (e) {

    if (this.data.actionName === "修改动作") {
      if (this.modifyMovement())
        this.hideModal();
      else {
        // console.log("errrrr");
        // this.hideModal();
      }

    } else {
      if (this.addMovement())
        this.hideModal();
    }

  },

  //for input change in modal
  onInputGroupChange: function (e) {
    var tmp = this.data.tmpMovement;
    tmp.groupCount = e.detail.value;
    this.setData({
      tmpMovement: tmp
    });
  },

  onInputMvCountChange: function (e) {
    var tmp = this.data.tmpMovement;
    tmp.movementCount = e.detail.value;
    this.setData({
      tmpMovement: tmp
    });
  },

  onInputWeightChange: function (e) {
    var tmp = this.data.tmpMovement;
    tmp.movementWeight = e.detail.value;
    this.setData({
      tmpMovement: tmp
    });
  },

  //for left swipe delete

  onTouchStart: function (e) {
    if (util.isExpired(this.data.selectedDate)) {
      return;
    }
    if (this.showState === 1) {
      this.touchStartState = 1;
      this.showState = 0;
      this.moveX = 0;
      this.translateXMovementItem(this.lastShowMovementId, 0, 200);
      this.lastShowMovementId = "";
      return;
    }
    this.firstTouchX = e.touches[0].clientX;
    this.firstTouchY = e.touches[0].clientY;
    if (this.firstTouchX > this.swipeCheckX) {
      this.swipeCheckState = 1;
    }
    this.lastMoveTime = e.timeStamp;
  },

  onTouchMove: function (e) {
    if (this.swipeCheckState === 0) {
      return;
    }
    //当开始触摸时有菜单显示时，不处理滑动操作
    if (this.touchStartState === 1) {
      return;
    }
    var moveX = e.touches[0].clientX - this.firstTouchX;
    var moveY = e.touches[0].clientY - this.firstTouchY;
    //已触发垂直滑动，由scroll-view处理滑动操作
    if (this.swipeDirection === 2) {
      return;
    }
    //未触发滑动方向
    if (this.swipeDirection === 0) {
      console.log(Math.abs(moveY));
      //触发垂直操作
      if (Math.abs(moveY) > 4) {
        this.swipeDirection = 2;

        return;
      }
      //触发水平操作，同时禁用垂直滚动
      if (Math.abs(moveX) > 4) {
        this.swipeDirection = 1;
        this.setData({ scrollY: false });
      }
      else {
        return;
      }
    }
    this.lastMoveTime = e.timeStamp;
    //处理边界情况
    if (moveX > 0) {
      moveX = 0;
    }
    //检测最大左滑距离
    if (moveX < -this.maxMoveLeft) {
      moveX = -this.maxMoveLeft;
    }
    this.moveX = moveX;
    this.translateXMovementItem(e.currentTarget.id, moveX, 0);
  },

  onTouchEnd: function (e) {
    this.swipeCheckState = 0;
    var swipeDirection = this.swipeDirection;
    this.swipeDirection = 0;
    if (this.touchStartState === 1) {
      this.touchStartState = 0;
      this.setData({ scrollY: true });
      return;
    }
    //垂直滚动，忽略
    if (swipeDirection !== 1) {
      return;
    }
    if (this.moveX === 0) {
      this.showState = 0;
      //不显示菜单状态下,激活垂直滚动
      this.setData({ scrollY: true });
      return;
    }
    if (this.moveX === this.correctMoveLeft) {
      this.showState = 1;
      this.lastShowMovementId = e.currentTarget.id;
      return;
    }
    if (this.moveX < -this.thresholdMoveLeft) {
      this.moveX = -this.correctMoveLeft;
      this.showState = 1;
      this.lastShowMovementId = e.currentTarget.id;
    }
    else {
      this.moveX = 0;
      this.showState = 0;
      //不显示菜单,激活垂直滚动
      this.setData({ scrollY: true });
    }
    this.translateXMovementItem(e.currentTarget.id, this.moveX, 500);

  },

  onDeleteMovementTap: function (e) {
    this.deleteMovementItem(e);
  },
  onDeleteMovementLongtap: function (e) {
    console.log(e);
  },
  onModifyMovementTap: function (e) {
    console.log("e.currentTarget.id ", e.currentTarget.id);
    this.modifyMovement(e.currentTarget.id);
  },
  onModifyMovementLongtap: function (e) {
    console.log(e);
  },

  getItemIndex: function (id) {
    // console.log("left id: ", id);
    var curTrainPlan = this.data.curTrainPlan;
    // console.log("getItemIndex:", curTrainPlan);

    for (var i = 0; i < curTrainPlan.movementList.length; i++) {
      // console.log("getItemIndex:", curTrainPlan.movementList[i].id, String(curTrainPlan.movementList[i].id) === String(id));
      if (String(curTrainPlan.movementList[i].id) === String(id)) {
        console.log("getItemIndex:", i);
        return i;
      }
    }
    return -1;
  },

  deleteMovementItem: function (e) {
    var animation = wx.createAnimation({ duration: 200 });
    animation.height(0).opacity(0).step();
    this.animationMovementWrapItem(e.currentTarget.id, animation);
    var s = this;
    setTimeout(function () {
      console.log("e.currentTarget.id: ", e.currentTarget.id);

    }, 200);
    var index = s.getItemIndex(e.currentTarget.id);
    console.log("delete id: ", index);
    this.removeMovement(index + 1);
    this.showState = 0;
    this.setData({ scrollY: true });
  },

  translateXMovementItem: function (id, x, duration) {
    var animation = wx.createAnimation({ duration: duration });
    animation.translateX(x).step();
    this.animationMovementItem(id, animation);
  },

  animationMovementItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'curTrainPlan.movementList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },

  animationMovementWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'curTrainPlan.movementList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
  },


  //-------------------------------------------------------------------------------
  //生命周期函数，页面跳转等等

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.data.curTrainPlan = new datamodel.SingleDatePlan();
    this.data.tmpMovement = new datamodel.Movement();
    this.data.tmpMovement.checked = false;
    this.data.tmpMovement.measurement = app.system.userConfig.measurement;

    console.log("onLoad, this.data.curTrainPlan: ", this.data.curTrainPlan);
    console.log("onLoad, this.data.tmpMovement: ", this.data.tmpMovement);
    console.log("onLoad call");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log("onReady call");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("onShow call");
    this.setData({
      selectedDate: util.formatDateToString(app.globalData.selectedDate)
    });
    this.loadData();

    if (util.isExpired(this.data.selectedDate)) {
      wx.showToast({
        title: '不能修改历史',
      });
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.savePlan();
    console.log("onHide call: data saved");
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("onUnload call");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("onPullDownRefresh call");
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("onReachBottom call");
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
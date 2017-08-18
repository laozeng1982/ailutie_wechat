/**
 * plan.js
 * 计划页面，响应各种操作
 */

import util from '../../utils/util.js'
import controller from '../../utils/controller.js'
import SingleDatePlan from '../../datamodel/SingleDatePlan.js'
import Movement from '../../datamodel/Movement.js'
import Record from '../../datamodel/Record.js'

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //用来保存当前选中的日期，初始进程序，显示当天
    selectedDate: util.formatDateToString(new Date()),

    //存放所有Storage中的计划记录
    allTrainPlan: [],
    curTrainPlan: '',

    //初始化，这些数据一是用来显示初始化设置

    //指定当前修改的记录ID
    curSelectedMovementId: '',

    //临时存放新建，或者正在修改的动作
    tmpMovement: '',
    //缓存数据
    tmpAmount: '',

    //2D 数组，用来存放动作
    movementMultiArray: app.globalData.movementMultiArray,
    //动作索引
    multiMovementIndex: [0, 0],
    multiMovementNoIndex: [0, 0, 0],

    //3D 数组，用来存放动作组数，次数和重量
    movementNoMultiArray: app.globalData.movementNoMultiArray,


    //组件控制
    scrollY: true,
    scrollHeight: 850,
    actionName: '',
    showModal: false,

    tipMvCount: '', //如果固定次数，tipMvCount为“每组”，否则为“共”
    //列表中显示的值
    showGpCount: '',
    showMvCount: '',
    showMvWeight: '',
    tipMvWeight: '', //如果固定重量，tipMvWeight为“每组”，否则为“最大”

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

  /**
   * 响应往前一天的操作
   */
  onLastDate: function () {
    this.moveDay(false);
  },

  /**
   * 响应往前一天的操作
   */
  onNextDate: function () {
    this.moveDay(true);
  },

  moveDay: function (isNext) {
    this.savePlan();

    var dateAfterMove = util.getMoveDays(this.data.selectedDate, isNext, 1);
    // 需先设置日期
    this.setData({
      selectedDate: dateAfterMove,

    });

    this.setData({
      curTrainPlan: controller.loadPlan(this.data.selectedDate)
    });

    if (util.isExpired(this.data.selectedDate)) {
      util.showToast("历史数据不能修改哦^_^", this, 2000);
    }
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
    var toBeAdd = new Movement.Movement();

    //必须要使用copyfrom，否则添加的都是一样的。不能使用：toBeAdd = this.data.tmpMovement
    toBeAdd.fullCopyFrom(this.data.tmpMovement);
    toBeAdd.date = this.data.selectedDate;

    // 这样逻辑简单，仅在此一处产生ID，其他地方都不修改ID
    toBeAdd.id = this.data.curTrainPlan.planMvList.length + 1;
    console.log("in addMovement, this.data.tmpMovement is: ", this.data.tmpMovement);
    console.log("in addMovement, toBeAdd is: ", toBeAdd);
    if (!this.data.curTrainPlan.add(toBeAdd)) {
      util.showToast('您已添加该动作。', this, 2000);
      success = false;
      return success;
    } else {
      console.log("add a new movement: ", toBeAdd);
    }

    this.setData({
      curTrainPlan: this.data.curTrainPlan
    });
    console.log("in addMovement, this.data.curTrainPlan.length", this.data.curTrainPlan.length);
    console.log("in addMovement, after add: ", this.data.curTrainPlan);
    success = true;
    this.savePlan();
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
    console.log("in onModifyMovement, e.currentTarget.id: ", e.currentTarget.id);
    var tmp = this.data.curTrainPlan.planMvList[e.currentTarget.id - 1];
    this.setPickerIndex(tmp.partName, tmp.movementName, tmp.planGpCount, tmp.planAmount.count, tmp.planAmount.weight);

    this.setData({
      curSelectedMovementId: e.currentTarget.id,
      tmpMovement: tmp,
      actionName: "修改动作",
      showModal: true
    });
    console.log("in onModifyMovement, this.data.tmpMovement: ", this.data.tmpMovement);
  },

  /**
   * 具体处理修改动作的业务
   */
  modifyMovement: function () {
    var success = false;

    if (!this.checkParameter())
      return success;

    //准备修改的数据
    this.data.tmpMovement.id = this.data.curSelectedMovementId;
    console.log("new modify movement is: ", this.data.tmpMovement);

    success = this.data.curTrainPlan.modify(this.data.curSelectedMovementId, this.data.tmpMovement);

    if (!success) {
      util.showToast('动作重复了...', this, 2000);
    } else {
      this.setData({
        curTrainPlan: this.data.curTrainPlan
      });
      console.log('modify completed!');
    }



    return success;
  },

  /**
  * 
  */
  removeMovement: function (id) {

    var curTrainPlan = this.data.curTrainPlan;
    console.log("in removeMovement, before delele, this.data.curTrainPlan: ", curTrainPlan);
    curTrainPlan.remove(id);

    this.setData({
      curTrainPlan: curTrainPlan,
    });

    //很奇怪，没找到原因，必须要这么一下，才能刷新
    this.savePlan();

    console.log("in removeMovement, after delele, this.data.curTrainPlan, ", this.data.curTrainPlan);
    // console.log('remove', e.detail.value)
  },

  // savePlan: function () {
  //   // if (!util.isLogin()) {
  //   //   return;
  //   // }
  //   //先看是否为空，为空直接增加，然后查重，日期重的直接替换，日期没有的直接增加
  //   var allTrainPlan = this.data.allTrainPlan;

  //   if (allTrainPlan.length == 0) {
  //     allTrainPlan.push(this.data.curTrainPlan);
  //   } else {
  //     //查重
  //     var hasThisDay = false;

  //     for (var item of allTrainPlan) {
  //       if (this.data.selectedDate == item.planDate) {
  //         // console.log("in savePlan, we have this day");
  //         hasThisDay = true;
  //         break;
  //       } else {
  //         // console.log("in savePlan, we dont have this day");
  //       }
  //     }

  //     //没有这天的记录，直接增加
  //     if (!hasThisDay) {
  //       if (this.data.curTrainPlan.planMvList.length > 0)
  //         allTrainPlan = allTrainPlan.concat(this.data.curTrainPlan);
  //     } else {  //有这天的记录，删除再增加
  //       var start = 0;  //删除开始的索引
  //       var count = 0;  //删除的个数

  //       for (var idx = 0; idx < allTrainPlan.length; idx++) {
  //         if (this.data.selectedDate == allTrainPlan[idx].planDate) {
  //           start = idx;
  //           break;
  //         }
  //       }

  //       for (var idx = 0; idx < allTrainPlan.length; idx++) {
  //         if (this.data.selectedDate == allTrainPlan[idx].planDate) {
  //           count++;
  //         }
  //       }

  //       allTrainPlan.splice(start, count);
  //       allTrainPlan = allTrainPlan.concat(this.data.curTrainPlan);
  //     }
  //   }

  //   for (var idx = 0; idx < allTrainPlan.length; idx++) {
  //     //循环删除动画
  //     for (var i = 0; i < allTrainPlan[idx].planMvList.length; i++) {
  //       // console.log("in savePlan, before allTrainPlan[idx].planMvList.animation: ", allTrainPlan[idx].planMvList[i].animation);
  //       delete allTrainPlan[idx].planMvList[i].animation;
  //       delete allTrainPlan[idx].planMvList[i].wrapAnimation;
  //       // console.log("in savePlan, after allTrainPlan[idx].planMvList.animation: ", allTrainPlan[idx].planMvList[i].animation);
  //     }
  //   }

  //   this.setData({
  //     allTrainPlan: allTrainPlan
  //   });
  //   console.log("in savePlan, this.data.allTrainPlan ", this.data.allTrainPlan);
  //   wx.setStorageSync('TrainPlan', this.data.allTrainPlan);
  // },

  //---------------------------------------------------------------------
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

  onRemove: function (e) {

    if (this.data.actionName === "修改动作") {
      console.log("in onRemove, this.data.curSelectedMovementId: ", this.data.curSelectedMovementId)
      this.removeMovement(this.data.curSelectedMovementId)
      this.hideModal();

    } else {
      util.showToast('您这样让我很为难...', this, 2000);
    }
  },

  onSeperatingSelect: function (e) {
    var tmp = this.data.tmpMovement;

    // console.log(e);
    //点一次就反置，逻辑搞简单点
    tmp.seperateMake = !tmp.seperateMake;
    this.setData({
      tmpMovement: tmp
    });
    this.setAmount(this.data.tmpMovement.planGpCount);
    console.log("this.data.seperateMake: ", this.data.tmpMovement.seperateMake);
  },

  onSameMvCount: function (e) {
    var tmp = this.data.tmpMovement;
    tmp.sameMvCount = !tmp.sameMvCount;
    //点一次就反置，逻辑搞简单点
    this.setData({
      tmpMovement: tmp
    });
    console.log("this.data.sameMvCount: ", this.data.tmpMovement.sameMvCount);
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
        data.movementMultiArray[1] = util.getMovementNamePickerList(data.multiMovementIndex[0]);
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
   * 数字选择Picker的坚挺
   */
  onNumberChange: function (e) {
    if (this.data.seperateMake) {
      return;
    }

    console.log('picker发送选择改变，携带值为', e.detail.value);

    var tmpMovement = this.data.tmpMovement;

    var selectedRowArr = e.detail.value;
    tmpMovement.planGpCount = this.data.movementNoMultiArray[0][selectedRowArr[0]];
    tmpMovement.planAmount = [];

    for (var idx = 0; idx < tmpMovement.planGpCount; idx++) {
      var record = new Record.Record(idx + 1,
        this.data.movementNoMultiArray[1][selectedRowArr[1]],
        this.data.movementNoMultiArray[2][selectedRowArr[2]]);

      tmpMovement.planAmount.push(record);

    }

    this.setData({
      tmpMovement: tmpMovement
    });
    console.log('组数：', this.data.tmpMovement.planGpCount, ', ', '次数：', this.data.tmpMovement.planAmount.count, ', ', "重量：", this.data.tmpMovement.planAmount.weight);
  },

  //for input change in modal
  onInputGroupChange: function (e) {

    this.setAmount(e.detail.value);
    // console.log("this.data.tmpMovement", this.data.tmpMovement);
  },

  /**
   * 点击分组制定或者，组数改变的时候，重新计算表格
   */
  setAmount: function (gpCount) {
    console.log("set seperate!");
    var tmp = this.data.tmpMovement;

    console.log("in setAmount, this.data.tmpMovement", this.data.tmpMovement);

    //当为分组制定的时候，改变planGpCount的值，以当前参数制定分组
    //当不分组制定的时候，只修改组的值
    if (tmp.seperateMake) {
      tmp.planGpCount = gpCount;
      this.data.tmpAmount = tmp.planAmount;
      tmp.planAmount = [];

      console.log("in setAmount, gpCount: ", gpCount);
      for (var idx = 0; idx < gpCount; idx++) {
        //新建单条，加入列表中，重绘输入表格的，必须分开new，否则关联
        var record = new Record.Record(idx + 1, this.data.tmpAmount[idx].count, this.data.tmpAmount[idx].weight);
        tmp.planAmount.push(record);

      }
    } else {
      tmp.planGpCount = gpCount;
    }
    this.setData({
      tmpMovement: tmp
    });
    console.log("in setAmount, this.data.tmpMovement: ", this.data.tmpMovement);
  },

  onInputMvCountChange: function (e) {
    var tmp = this.data.tmpMovement;

    //分组制定时，给统一值
    if (tmp.seperateMake) {
      if (tmp.sameMvCount) {

        for (var idx = 0; idx < tmp.planAmount.length; idx++) {
          tmp.planAmount[idx].count = e.detail.value;
        }
        console.log("onInputMvCountChange", tmp);
      } else {
        tmp.planAmount[e.target.id - 1].count = e.detail.value;
        console.log("id is: ", e.currentTarget.id);
        console.log("id is: ", e.target.id);
      }
    } else {
      for (var idx = 0; idx < tmp.planAmount.length; idx++) {
        tmp.planAmount[idx].count = e.detail.value;
      }
    }

    console.log(tmp);
    this.setData({
      tmpMovement: tmp
    });
  },

  onInputWeightChange: function (e) {
    var tmp = this.data.tmpMovement;

    //分组设定，分别修改，否则统一修改
    if (tmp.seperateMake) {
      tmp.planAmount[e.target.id - 1].weight = e.detail.value;
    } else {
      for (var idx = 0; idx < tmp.planAmount.length; idx++) {
        tmp.planAmount[idx].weight = e.detail.value;
      }
    }


    this.setData({
      tmpMovement: tmp
    });
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
        console.log("in setPickerIndex, match partName: ", partName);
        partIdx = idx;
        break;
      }
    }

    //动作搜索
    var movementNamePickerList = util.getMovementNamePickerList(partIdx);
    for (var idx = 0; idx < movementNamePickerList.length; idx++) {
      if (movementNamePickerList[idx] === movementName) {
        console.log("in setPickerIndex, match movementName: ", movementName);
        movementIndx = idx;
        break;
      }
    }

    //置索引
    var movementMultiArray = this.data.movementMultiArray;
    movementMultiArray[1] = movementNamePickerList;

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
    var multiMovementNoIndex = [5, 6, 8];

    this.setData({
      movementMultiArray: movementMultiArray,
      multiMovementIndex: multiMovementIndex,
      multiMovementNoIndex: multiMovementNoIndex
    });
  },

  /**
 * 检查输入的合法性
 */
  checkParameter: function () {
    console.log("in checkPara", this.data.tmpMovement.partName);
    if (typeof (this.data.tmpMovement.partName) == "undefined" || this.data.tmpMovement.partName == '') {
      util.showToast('请选择部位...', this, 2000);

      return false;
    }
    if (typeof (this.data.tmpMovement.movementName) == "undefined") {
      util.showToast('请选择动作...', this, 2000);

      return false;
    }
    if (typeof (this.data.tmpMovement.planGpCount) == "undefined" ||
      this.data.tmpMovement.planGpCount <= 0) {
      util.showToast('动作组数不能为空或0...', this, 2000);
      return false;
    }

    //次数为数组，肯定不会是undefined，要判断数组中每个是不是空
    for (var item of this.data.tmpMovement.planAmount) {
      if (typeof (item.count) == "undefined" ||
        item.count <= 0) {
        util.showToast('动作次数不能为空或0...', this, 2000);
        return false;
      }
    }

    //重量为数组，肯定不会是undefined，要判断数组中每个是不是空
    for (var item of this.data.tmpMovement.planAmount) {
      if (typeof (item.weight) == "undefined" ||
        item.weight <= 0) {
        util.showToast('动作重量不能为空或0...', this, 2000);
        return false;
      }
    }

    return true;
  },

  //--------------------------------------------------------
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
      // console.log(Math.abs(moveY));
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

  /**
   * 响应删除操作，需弹窗确认
   */
  onDeleteMovementTap: function (e) {
    var vm = this;
    wx.showModal({
      title: '确认删除',
      content: '此操作将删除该动作，确认否？',
      cancelText: "取消",
      confirmText: "确定",
      success: function (res) {
        if (res.confirm) {
          console.log('用户删除数据')
          vm.deleteMovementItem(e);
        } else if (res.cancel) {
          console.log('用户取消删除')
        }
      }
    });

  },

  /**
   * 响应去锻炼操作，准备数据
   */
  onTrainTap: function (e) {
    console.log("e.currentTarget.id ", e.currentTarget.id);
    //TODO 准备锻炼数据，考虑使用checked属性，明天再思考，或许干脆不要这个按钮
    wx.switchTab({
      url: '../training/training',
    })
  },


  getItemIndex: function (id) {
    // console.log("left id: ", id);
    var curTrainPlan = this.data.curTrainPlan;
    // console.log("getItemIndex:", curTrainPlan);

    for (var i = 0; i < curTrainPlan.planMvList.length; i++) {
      // console.log("getItemIndex:", curTrainPlan.planMvList[i].id, String(curTrainPlan.planMvList[i].id) === String(id));
      if (String(curTrainPlan.planMvList[i].id) === String(id)) {
        // console.log("getItemIndex:", i);
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
      console.log("in deleteMovementItem, e.currentTarget.id: ", e.currentTarget.id);

    }, 200);
    var index = s.getItemIndex(e.currentTarget.id);
    console.log("deleteMovementItem, delete id: ", index);
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
    var indexString = 'curTrainPlan.planMvList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
    // console.log("in animationMovementItem, param: ", param);
  },

  animationMovementWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'curTrainPlan.planMvList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
    // console.log("in animationMovementWrapItem, param: ", param);
  },


  //-------------------------------------------------------------------------------
  //生命周期函数，页面跳转等等

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //初始化
    this.data.curTrainPlan = new SingleDatePlan.SingleDatePlan();
    var tmp = new Movement.Movement();
    tmp.planGpCount = 6;
    tmp.planAmount = [];
    for (var idx = 0; idx < tmp.planGpCount; idx++) {
      //新建单条，加入列表中
      var record = new Record.Record(idx + 1, 10, 30);

      tmp.planAmount.push(record);

    }

    tmp.selected = false;
    tmp.measurement = app.system.userConfig.measurement;

    this.setData({
      tmpMovement: tmp
    })
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
      selectedDate: util.formatDateToString(app.globalData.selectedDate),
    });

    this.setData({
      curTrainPlan: controller.loadPlan(this.data.selectedDate)
    });


    if (util.isExpired(this.data.selectedDate)) {
      util.showToast('历史数据不能修改哦^_^', this, 2000);
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
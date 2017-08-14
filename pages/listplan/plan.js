// plan.js
import util from '../../utils/util.js'
import datamodel from '../datamodel/datamodel.js'

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedDate: util.formatDateToString(app.globalData.selectedDate),

    allMovementsList: [],
    curMovementsList: [],

    //初始化，这些数据一是用来显示初始化设置
    //二是用来保存当前页面的选项，用以增加，修改记录
    curMovementIndex: 1,
    curPartName: '胸上部',
    curMovementName: '上斜杠铃推举',
    curGroupCount: 6,
    curMovementCount: 8,
    curMovementWeight: 30,
    curMeasurement: 'Kg',

    //临时存放部位，名字
    tmpMovement: new datamodel.createMovement(),
    tmpPartName: '胸上部',
    tmpMovementName: '上斜杠铃推举',

    //指定当前修改的记录ID
    curModifyMovementId: '',

    //2D 数组，用来存放动作
    movementMultiArray: app.globalData.movementMultiArray,
    //动作索引
    multiMovementIndex: [0, 0],

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

  //
  createMovement: function () {
    var newMovement = new datamodel.createMovement(
      this.data.selectedDate,
      this.data.curMovementIndex + "",
      this.data.curPartName,
      this.data.curMovementName,
      this.data.curGroupCount,
      this.data.curMovementCount,
      this.data.curMovementWeight,
      false, //记录时，一律不记录选中状态
      app.system.userConfig.measurement);

    return newMovement;
  },

  //------------------------------------------------------
  //以下是监听函数

  onLastDate: function () {
    this.moveDay(false);
  },

  onNextDate: function () {
    this.moveDay(true);
  },

  moveDay: function (isNext) {
    this.savePlan();
    var selectedDayTimeMills = util.formatStringToDate(this.data.selectedDate, '-').getTime();
    var moveDayTimeMills;
    //时间改变一天，直接加上、或减去一天的毫秒数
    if (isNext) {
      moveDayTimeMills = selectedDayTimeMills + 3600 * 24 * 1000;
    } else {
      moveDayTimeMills = selectedDayTimeMills - 3600 * 24 * 1000;
    }
    var moveDayDate = new Date();
    moveDayDate.setTime(moveDayTimeMills);
    console.log("move to ", moveDayDate +".............");
    this.setData({
      selectedDate: util.formatDateToString(moveDayDate),
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



  isExpired: function () {
    var isExpired = false;

    var nowString = util.formatDateToString(new Date());
    var now = util.formatStringToDate(nowString, '-').getTime() / (3600 * 24 * 1000);
    var selected = util.formatStringToDate(this.data.selectedDate, '-').getTime() / (3600 * 24 * 1000);

    console.log("now: ", now);
    console.log("selected: ", selected);
    if (selected < now) {
      isExpired = true;
    } else {
      isExpired = false;
    }

    return isExpired;
  },

  /**
   * 响应界面调用的函数
   */
  onAddMovement: function () {
    if (this.isExpired()) {
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
    console.log(this.data.curMovementsList);
    //判断重复
    if (this.data.curMovementsList.length > 0)
      for (var item of this.data.curMovementsList) {
        if (this.data.curPartName.indexOf(item.partName) !== -1 &&
          this.data.curMovementName.indexOf(item.movementName) !== -1) {
          console.log("repeat, skip adding!");
          wx.showToast({
            title: '您已添加该动作。',
            icon: 'warn'
          })
          success = false;
          return success;
          break;
        }
      }

    this.data.curMovementsList.push(this.createMovement());

    var curMovementIndex = this.data.curMovementIndex + 1;

    console.log("new length", curMovementIndex);

    this.setData({
      curMovementIndex: curMovementIndex,
      curMovementsList: this.data.curMovementsList
    });
    console.log('this.data.curMovementIndex', this.data.curMovementIndex);
    console.log("after add: ", this.data.curMovementsList);
    success = true;

    return success;
  },

  /**
   * 响应处理修改动作的业务
   */
  onModifyMovement: function (e) {
    if (this.isExpired()) {
      console.log("isExpired!!!!!!!!!!");
      return;
    }
    console.log("in modifyMovement, before : ", this.data.curPartName + ", " + this.data.curMovementName);
    //防止用户什么都选，就使用了默认值
    this.data.curPartName = this.data.curMovementsList[e.currentTarget.id - 1].partName;
    this.data.curMovementName = this.data.curMovementsList[e.currentTarget.id - 1].movementName;

    console.log("in modifyMovement, after  : ", this.data.curPartName + ", " + this.data.curMovementName);

    this.setData({
      curModifyMovementId: e.currentTarget.id,
      actionName: "修改动作",
      showModal: true
    });
  },

  /**
   * 具体处理修改动作的业务
   */
  modifyMovement: function () {
    var success = false;
    var modifyIndex = this.data.curModifyMovementId + '';
    console.log("in modifyMovement, modifyIndex: ", modifyIndex);

    for (var item of this.data.curMovementsList) {
      //先判断是否修改成了重复的
      if (modifyIndex != item.movementIndex &&
        this.data.tmpPartName.indexOf(item.partName) !== -1 &&
        this.data.tmpMovementName.indexOf(item.movementName) !== -1) {
        console.log("repeat, skip modify!");
        wx.showToast({
          title: '您已添加该动作。',
        })
        success = false;
        return success;
      }
    }

    console.log("here");


    //如果不重复，直接修改
    //TODO 应该可以直接createMovement，然后替换，代码更简洁
    for (var idx = 0; idx < this.data.curMovementsList.length; idx++) {
      if (this.data.curMovementsList[idx].movementIndex === modifyIndex) {
        console.log("moddddddd");
        this.data.curMovementsList[idx].partName = this.data.tmpPartName;
        this.data.curMovementsList[idx].movementName = this.data.tmpMovementName;
        this.data.curMovementsList[idx].groupCount = this.data.curGroupCount;
        this.data.curMovementsList[idx].movementCount = this.data.curMovementCount;
        this.data.curMovementsList[idx].movementWeight = this.data.curMovementWeight;
        this.data.curMovementsList[idx].measurement = this.data.curMeasurement;
        break;

      }
    }


    this.setData({
      curMovementsList: this.data.curMovementsList
    });
    console.log('modify completed!');
    success = true;

    return success;
  },

  /**
  * 
  */
  removeMovement: function (id) {
    console.log("remove ", id);
    var tempList = this.data.curMovementsList;

    var removedId = id + '';
    for (var idx = 0; idx < tempList.length; idx++) {
      var tempString = tempList[idx].movementIndex;
      console.log("input id: ", removedId);
      console.log("currment id: ", tempString);
      console.log(removedId === tempString);
      if (tempString === removedId) {
        console.log("this is true");
        tempList.splice(idx, 1);
      }
    }


    //生成新数组，并重新排序
    var restListMovement = [];
    for (var idx = 0; idx < tempList.length; idx++) {
      console.log(tempList[idx]);
      if (tempList[idx].movementIndex > 0) {
        tempList[idx].movementIndex = idx + 1 + "";
        console.log(tempList[idx].movementIndex);
        restListMovement.push(tempList[idx]);
      }
    }

    //清空选中列表，重置index
    console.log(restListMovement);
    this.setData({
      curMovementIndex: this.data.curMovementIndex - 1,
      curMovementsList: restListMovement
    });
    console.log("tempList", tempList);
    // console.log('remove', e.detail.value)
  },

  onGroupCountChange: function (e) {
    this.setData({
      curGroupCount: e.detail.value
    })
  },

  onMovementCountChange: function (e) {
    this.setData({
      curMovementCount: e.detail.value
    })
  },

  onMovementWeightChange: function (e) {
    this.setData({
      curMovementWeight: e.detail.value
    })
  },

  onCheckboxChange: function (e) {
    var checked = e.detail.value;
    console.log("checked: " + checked);
    console.log(checked);
    var changed = {};
    //这里不能绑定纯数字的item，否则无法监听，所以，movementIndex变成了字符串
    for (var i = 0; i < this.data.curMovementsList.length; i++) {
      if (checked.indexOf(this.data.curMovementsList[i].movementIndex) !== -1) {
        console.log("true");
        changed['curMovementsList[' + i + '].checked'] = true
      } else {
        changed['curMovementsList[' + i + '].checked'] = false
        console.log("false");
      }
    }
    this.setData({
    });
    this.setData(changed);
  },

  //响应的是，picker点确定之后
  onMovementChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiMovementIndex: e.detail.value
    })
  },

  //响应的是picker列改变，及其后面的值跟随变化
  onMovementColumnChange: function (e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      movementMultiArray: this.data.movementMultiArray,
      multiMovementIndex: this.data.multiMovementIndex,
      curPartName: this.data.curPartName,
      curMovementName: this.data.curMovementName
    };

    data.multiMovementIndex[e.detail.column] = e.detail.value;
    var columnIdx = e.detail.column;
    var rowIdx = e.detail.value;

    switch (e.detail.column) {
      case 0:
        switch (data.multiMovementIndex[0]) {
          case 0:
            data.movementMultiArray[1] = app.globalData.movementNameArrayUpperPectorales;
            break;
          case 1:
            data.movementMultiArray[1] = app.globalData.movementNameArrayMiddlePectorales;
            break;
          case 2:
            data.movementMultiArray[1] = app.globalData.movementNameArrayDownPectorales;
            break;
          case 3:
            data.movementMultiArray[1] = app.globalData.movementNameArrayFrontShoulder;
            break;
          case 4:
            data.movementMultiArray[1] = app.globalData.movementNameArrayMiddleShoulder;
            break;
          case 5:
            data.movementMultiArray[1] = app.globalData.movementNameArrayBackShoulder;
            break;
          case 6:
            data.movementMultiArray[1] = app.globalData.movementNameArrayDorsal;
            break;
          case 7:
            data.movementMultiArray[1] = app.globalData.movementNameArrayAbdomen;
            break;
          case 8:
            data.movementMultiArray[1] = app.globalData.movementNameArrayThigh;
            break;
          default:
            break;
        };
        data.multiMovementIndex[1] = 0;
        break;
      case 1:
        {
          data.multiMovementIndex[1] = e.detail.value;

          break;
        }
    };


    data.tmpPartName = data.movementMultiArray[0][data.multiMovementIndex[0]];
    data.tmpMovementName = data.movementMultiArray[1][data.multiMovementIndex[1]];

    console.log(data.tmpPartName, data.tmpMovementName);

    this.setData(data);
  },

  onNumberChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    var selectedRowArr = e.detail.value;
    var curGroupCount = this.data.movementNoMultiArray[0][selectedRowArr[0]];
    var curMovementCount = this.data.movementNoMultiArray[1][selectedRowArr[1]];
    var curMovementWeight = this.data.movementNoMultiArray[2][selectedRowArr[2]];

    console.log(curGroupCount + ', ' + curMovementCount + ', ' + curMovementWeight);

    this.setData({
      curGroupCount: curGroupCount,
      curMovementCount: curMovementCount,
      curMovementWeight: curMovementWeight
    });

  },

  onChangeMeasure: function (e) {
    var measurement;
    if (e.detail.value) {
      measurement = 'Kg';
    } else {
      measurement = 'Lb';
    }
    this.setData({
      curMeasurement: measurement
    });

    console.log(e.detail.value);
    console.log(this.data.curMeasurement);
  },

  onSavePlan: function (e) {
    this.savePlan();
    wx.showToast({
      title: '保存了',
    });
  },

  onSavePlanAndTrain: function (e) {
    this.savePlan();
    wx.switchTab({
      url: '../training/training',
    })
  },

  loadData: function () {
    //同步获取
    var allMovementsList = wx.getStorageSync('TrainPlan');

    console.log('load: ', allMovementsList);

    var curMovementsList = [];
    for (var item of allMovementsList) {
      if (item.date == this.data.selectedDate) {
        curMovementsList.push(item);
      }
    };

    console.log('current list: ', curMovementsList);
    this.setData({
      curMovementIndex: curMovementsList.length + 1,
      allMovementsList: allMovementsList,
      curMovementsList: curMovementsList
    });
  },

  savePlan: function () {
    //先看是否为空，为空直接增加，然后查重，日期重的直接替换，日期没有的直接增加
    var allMovementsList = this.data.allMovementsList;
    for (var item of this.data.curMovementsList) {
      //删除动画属性，否则每次进入不显示
    }
    if (allMovementsList.length == 0) {
      allMovementsList = this.data.curMovementsList;
    } else {
      //查重
      var hasThisDay = false;

      for (var idx = 0; idx < allMovementsList.length; idx++) {
        if (this.data.selectedDate == allMovementsList[idx].date) {
          hasThisDay = true;
          break;
        }
      }

      //没有这天的记录，直接增加
      if (!hasThisDay) {
        allMovementsList = allMovementsList.concat(this.data.curMovementsList);
      } else {  //有这天的记录，删除再增加
        var start = 0;  //删除开始的索引
        var count = 0;  //删除的个数

        for (var idx = 0; idx < allMovementsList.length; idx++) {
          if (this.data.selectedDate == allMovementsList[idx].date) {
            start = idx;
            break;
          }
        }

        for (var idx = 0; idx < allMovementsList.length; idx++) {
          if (this.data.selectedDate == allMovementsList[idx].date) {
            count++;
          }
        }

        allMovementsList.splice(start, count);
        allMovementsList = allMovementsList.concat(this.data.curMovementsList);
      }
    }

    console.log("all....", allMovementsList);
    this.setData({
      allMovementsList: allMovementsList
    });
    console.log("this all....", this.data.allMovementsList);
    wx.setStorageSync('TrainPlan', this.data.allMovementsList);
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
    this.setData({
      curGroupCount: e.detail.value
    })
  },

  onInputMvCountChange: function (e) {
    this.setData({
      curMovementCount: e.detail.value
    })
  },

  onInputWeightChange: function (e) {
    this.setData({
      curMovementWeight: e.detail.value
    })
  },

  //for left swipe delete

  onTouchStart: function (e) {
    if (this.isExpired()) {
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
    console.log("left id: ", id);
    var curMovementsList = this.data.curMovementsList;
    for (var i = 0; i < curMovementsList.length; i++) {
      if (curMovementsList[i].movementIndex === id) {
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
    var indexString = 'curMovementsList[' + index + '].animation';
    param[indexString] = animation.export();
    this.setData(param);
  },

  animationMovementWrapItem: function (id, animation) {
    var index = this.getItemIndex(id);
    var param = {};
    var indexString = 'curMovementsList[' + index + '].wrapAnimation';
    param[indexString] = animation.export();
    this.setData(param);
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
    this.setData({
      selectedDate: util.formatDateToString(app.globalData.selectedDate)
    });
    this.loadData();
    this.data.curMovementIndex = this.data.curMovementsList.length + 1;
    if (this.isExpired()) {
      wx.showToast({
        title: '不能修改过去计划',
      });
    }

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.savePlan();
    console.log("saved");
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
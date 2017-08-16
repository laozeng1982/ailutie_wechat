// plan.js
import util from '../../utils/util.js'
import datamodel from '../../datamodel/datamodel.js'

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedDate: util.formatDateToString(app.globalData.selectedDate),

    allMovementsList: [],
    curMovementsList: [],


    //选中的行编号
    listSelectedItemIdx: [],

    //初始化，这些数据一是用来显示初始化设置
    //二是用来保存当前页面的选项，用以增加，修改记录
    curMovementIndex: 1,
    curPartName: '胸上部',
    curMovementName: '上斜杠铃推举',
    curGroupCount: 6,
    curMovementCount: 8,
    curMovementWeight: 30,
    curMeasurement: 'Kg',

    //2D 数组，用来存放动作
    movementMultiArray: app.globalData.movementMultiArray,
    //动作索引
    multiMovementIndex: [0, 0],

    //3D 数组，用来存放动作组数，次数和重量
    movementNoMultiArray: app.globalData.movementNoMultiArray,
    
  },

  //
  createMovement: function () {

    var newMovement = {
      date: this.data.selectedDate,
      movementIndex: this.data.curMovementIndex + "",
      partName: this.data.curPartName,
      movementName: this.data.curMovementName,
      groupCount: this.data.curGroupCount,
      movementCount: this.data.curMovementCount,
      movementWeight: this.data.curMovementWeight,
      checked: false, //记录时，一律不记录选中状态
      measurement: this.data.curMeasurement
    };

    return newMovement;
  },

  //------------------------------------------------------
  //以下是监听函数
  bindSelectDate: function () {
    //TODO 增加读取数据功能
    //离开页面前，先保存
    console.log("select date");
    // this.savePlan();
    wx.navigateTo({
      url: '../ui/calender/calender',
    });
  },

  bindAddMovement: function () {
    console.log(this.data.curMovementsList);
    //判断重复
    if (this.data.curMovementsList.length > 0)
      for (var i = 0; i < this.data.curMovementsList.length; i++) {
        if (this.data.curPartName.indexOf(this.data.curMovementsList[i].partName) !== -1 &&
          this.data.curMovementName.indexOf(this.data.curMovementsList[i].movementName) !== -1) {
          console.log("repeat, skip adding!");
          wx.showToast({
            title: '您已添加该动作。',
            icon: 'warn'
          })
          return;
        } else {
          console.log("add a new movement!");
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
  },

  /**
   * 
   */
  bindModifyMovement: function (e) {
    if (this.data.listSelectedItemIdx.length <= 0) {
      wx.showToast({
        title: '请选一组',
      });
      return;
    } else if (this.data.listSelectedItemIdx.length > 1) {
      wx.showToast({
        title: '一次只能改一组',
      });
      return;
    }

    var modifyIndex = this.data.listSelectedItemIdx[0];
    console.log(modifyIndex);
    for (var idx = 0; idx < this.data.curMovementsList.length; idx++) {
      console.log(idx + ", " + this.data.curMovementsList.length + ", " + this.data.curMovementsList[idx].movementIndex);
      //先判断是否修改成了重复的
      // if (this.data.partName.indexOf(this.data.curMovementsList[idx].partName) !== -1 &&
      //   this.data.curMovementName.indexOf(this.data.curMovementsList[idx].movementName) !== -1) {
      //   console.log("repeat, skip modify!");
      //   wx.showToast({
      //     title: '您已添加该动作。',
      //   })
      //   return;
      // } else {
      //   console.log("modify a this movement!");
      // }

      //如果不重复，直接修改
      //TODO 应该可以直接createMovement，然后替换，代码更简洁
      if (this.data.curMovementsList[idx].movementIndex === modifyIndex) {
        this.data.curMovementsList[idx].partName = this.data.curPartName;
        this.data.curMovementsList[idx].movementName = this.data.curMovementName;
        this.data.curMovementsList[idx].groupCount = this.data.curGroupCount;
        this.data.curMovementsList[idx].movementCount = this.data.curMovementCount;
        this.data.curMovementsList[idx].movementWeight = this.data.curMovementWeight;
        this.data.curMovementsList[idx].measurement = this.data.curMeasurement;
      }
    }

    this.setData({
      curMovementsList: this.data.curMovementsList
    });
    console.log('modify', e.detail.value)
  },

  /**
  * 
  */
  bindRemoveMovement: function (e) {
    console.log("remove ", e.detail.value);
    var tempList = this.data.curMovementsList;


    var removedId = this.data.listSelectedItemIdx[0];
    for (var cnt = 0; cnt < tempList.length; cnt++) {
      var tempString = tempList[cnt].movementIndex;
      console.log(removedId);
      console.log(tempString);
      if (tempString === removedId) {
        console.log("this is true");
        tempList.splice(cnt, 1, []);
      }
    }


    //生成新数组，并重新排序
    var restListMovement = [];
    var newIdx = 1;
    for (var idx = 0; idx < tempList.length; idx++) {
      console.log(tempList[idx]);
      if (tempList[idx].movementIndex > 0) {
        tempList[idx].movementIndex = newIdx + "";
        console.log(tempList[idx].movementIndex);
        restListMovement.push(tempList[idx]);
        newIdx++;
      }
    }

    //清空选中列表，重置index
    // listSelectedItemIdx=[];
    console.log(restListMovement);
    this.setData({
      curMovementIndex: this.data.curMovementIndex - this.data.listSelectedItemIdx.length,
      listSelectedItemIdx: [],
      curMovementsList: restListMovement
    });
    console.log("tempList", tempList);
    // console.log('remove', e.detail.value)
  },

  bindGroupCountChange: function (e) {
    this.setData({
      curGroupCount: e.detail.value
    })
  },

  bindMovementCountChange: function (e) {
    this.setData({
      curMovementCount: e.detail.value
    })
  },

  bindMovementWeightChange: function (e) {
    this.setData({
      curMovementWeight: e.detail.value
    })
  },

  bindCheckboxChange: function (e) {
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
      listSelectedItemIdx: checked
    });
    this.setData(changed);
  },

  //响应的是，picker点确定之后
  bindMovementChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      multiMovementIndex: e.detail.value
    })
  },

  //响应的是picker列改变，及其后面的值跟随变化
  bindMovementColumnChange: function (e) {
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


    data.curPartName = data.movementMultiArray[0][data.multiMovementIndex[0]];
    data.curMovementName = data.movementMultiArray[1][data.multiMovementIndex[1]];

    console.log(data.curPartName, data.curMovementName);

    this.setData(data);
  },

  bindNumberChange: function (e) {
    console.log("id: ", e.detail);
    console.log('picker发送选择改变，携带值为', e.detail.value)

  },

  bindChangeMeasure: function (e) {
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

  bindSavePlan: function (e) {
    this.savePlan();
    wx.showToast({
      title: '保存了',
    });
  },

  bindSavePlanAndTrain: function (e) {
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
    for (var idx = 0; idx < allMovementsList.length; idx++) {
      if (allMovementsList[idx].date == this.data.selectedDate) {
        curMovementsList.push(allMovementsList[idx]);
      }
    };

    console.log('current list: ', curMovementsList);
    this.setData({
      allMovementsList: allMovementsList,
      curMovementsList: curMovementsList
    });
  },

  savePlan: function () {
    //先看是否为空，为空直接增加，然后查重，日期重的直接替换，日期没有的直接增加
    var allMovementsList = this.data.allMovementsList;
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
    console.log("this.data.movementMultiArray ", this.data.movementMultiArray);
    console.log("this.data.movementNoMultiArray ", this.data.movementNoMultiArray);
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
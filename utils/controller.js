/**
 * MVC分离，这里主要是数据操作部分
 * 1、loadData数据读入
 * 2、saveData数据存储，目前存储在localStorage里
 */

import DataType from '../datamodel/DataType.js'
import SingleDatePlan from '../datamodel/SingleDatePlan.js'

//获取一个DataType作为全局变量用
const DATATYPE = new DataType.DataType();

/**
 * 从选中的日期读取指定内容
 * 参数selectedDate：选中的日期
 * 参数dataType：数据类型（DataType）
 */
function loadData(selectedDate, dataType) {
  //同步获取
  // if (!util.isLogin()) {
  //   return;
  // }

  console.log('in controller.loadData, DataType: ', dataType.value);

  // 读取该类别所有数据
  var allRequestData = wx.getStorageSync(dataType.value);
  // 当天请求的数据
  var requestData = '';

  console.log('in controller.loadData, read allRequestData data: ', allRequestData);

  switch (dataType.id) {
    case 0:
      // 0. UserInfo
      requestData = allRequestData;
      break;
    case 1:
      // 1. UserProfile
      requestData = allRequestData;
      break;
    case 2:
      // 2. TrainPlan
      requestData = new SingleDatePlan.SingleDatePlan();
      //如果有记录，从存储数据里读，如果没有记录，就初始化
      var hasPlan = false;
      if (allRequestData.length > 0) {
        for (var item of allRequestData) {
          if (item.planDate == selectedDate) {
            requestData.planDate = selectedDate;
            requestData.planMvList = item.planMvList;
            hasPlan = true;
          }
        };

      }
      if (allRequestData.length === 0 || !hasPlan) {
        requestData.planDate = selectedDate;
        requestData.planMvList = [];
      }
      break;
    case 3:
      // 3. TrainRecord
      break;
    default:
      break;
  }

  console.log("in controller.loadData, after loadData, curTrainPlan: ", requestData);

  return requestData;

}

/**
 * 调用loadData，从选中的日期读取TrainPlan
 * 参数selectedDate：选中的日期
 * 
 */
function loadPlan(selectedDate) {
  //同步获取
  // if (!util.isLogin()) {
  //   return;
  // }
  var curTrainPlan = loadData(selectedDate, DATATYPE.TrainPlan);

  // if (allTrainPlan.length == 0)
  //   allTrainPlan = [];
  console.log('in controller.loadPlan, DataType: ', DATATYPE);
  // console.log('in controller.loadPlan, read allTrainPlan data: ', allTrainPlan);

  // var curTrainPlan = new SingleDatePlan.SingleDatePlan();
  // //如果有记录，从存储数据里读，如果没有记录，就初始化
  // var hasPlan = false;
  // if (allTrainPlan.length > 0) {
  //   for (var item of allTrainPlan) {
  //     if (item.planDate == selectedDate) {
  //       curTrainPlan.planDate = selectedDate;
  //       curTrainPlan.planMvList = item.planMvList;
  //       hasPlan = true;
  //     }
  //   };

  // }
  // if (allTrainPlan.length === 0 || !hasPlan) {
  //   curTrainPlan.planDate = selectedDate;
  //   curTrainPlan.planMvList = [];
  // }

  console.log("in controller.loadPlan, after loadPlan, curTrainPlan: ", curTrainPlan);

  return curTrainPlan;

}

/**
 * 存储计划
 * 参数
 */
function savePlan() {
  // if (!util.isLogin()) {
  //   return;
  // }
  // 先判断目前记录是否为空
  // 为空直接增加数据
  // 不为空，数据查重，日期重复的直接替换，日期没有的直接增加
  var allTrainPlan = this.data.allTrainPlan;

  if (allTrainPlan.length == 0) {
    allTrainPlan.push(this.data.curTrainPlan);
  } else {
    //查重
    var hasThisDay = false;

    for (var item of allTrainPlan) {
      if (this.data.selectedDate == item.planDate) {
        // console.log("in savePlan, we have this day");
        hasThisDay = true;
        break;
      } else {
        // console.log("in savePlan, we dont have this day");
      }
    }

    //没有这天的记录，直接增加
    if (!hasThisDay) {
      if (this.data.curTrainPlan.planMvList.length > 0)
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

  for (var idx = 0; idx < allTrainPlan.length; idx++) {
    //循环删除动画
    for (var i = 0; i < allTrainPlan[idx].planMvList.length; i++) {
      // console.log("in savePlan, before allTrainPlan[idx].planMvList.animation: ", allTrainPlan[idx].planMvList[i].animation);
      delete allTrainPlan[idx].planMvList[i].animation;
      delete allTrainPlan[idx].planMvList[i].wrapAnimation;
      // console.log("in savePlan, after allTrainPlan[idx].planMvList.animation: ", allTrainPlan[idx].planMvList[i].animation);
    }
  }

  this.setData({
    allTrainPlan: allTrainPlan
  });
  console.log("in savePlan, this.data.allTrainPlan ", this.data.allTrainPlan);
  wx.setStorageSync('TrainPlan', this.data.allTrainPlan);
}


module.exports = {
  loadPlan: loadPlan,
  savePlan: savePlan
}
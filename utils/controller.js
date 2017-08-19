/**
 * MVC分离，这里主要是数据操作部分
 * 1、loadData数据读入
 * 2、saveData数据存储，目前存储在localStorage里
 */

import DataType from '../datamodel/DataType.js'
import SingleDayRecords from '../datamodel/SingleDayRecords.js'

//获取一个DataType作为全局变量用
const DATATYPE = new DataType.DataType();

/**
 * 功能：从选中的日期读取指定内容
 * 参数1：selectedDate，选中的日期
 * 参数2：dataType，数据类型（DataType）
 * 返回：选择日期的制定内容
 * 调用关系：外部函数，开放接口
 */
function loadData(selectedDate, dataType) {
  // TODO，判断是否同步获取
  // if (!util.isLogin()) {
  //   return;
  // }

  // 读取该类型数据已存储的内容
  var allRequestData = wx.getStorageSync(dataType.value);
  // 当天请求的数据
  var requestData = '';

  // 根据类型来抽取需要的数据
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
      // 2. SingleDayRecords
      requestData = makeLoadRecords(selectedDate, allRequestData);
      break;
    default:
      break;
  }

  console.log("in controller.loadData, after loadData, requestData: ", requestData);

  return requestData;

}

/**
 * 功能：获取selectedDate的记录数据
 * 参数1：selectedDate，即选中的日期
 * 参数2：sourceData，源数据
 * 调用关系：内部函数，被loadData调用
 */
function makeLoadRecords(selectedDate, sourceData) {
  var record = new SingleDayRecords.SingleDayRecords();
  // 如果有记录，从存储数据里读，如果没有记录，就初始化
  var hasData = false;
  if (sourceData.length > 0) {
    for (var item of sourceData) {
      if (item.date == selectedDate) {
        record.date = selectedDate;
        record.movementList = item.movementList;
        hasData = true;
      }
    };
  }
  if (!hasData) {
    record.date = selectedDate;
    record.movementList = [];
  }

  console.log("in makeLoadRecords, record is: ", record);

  return record;
}

/**
 * 功能：存储数据
 * 参数1：selectedDate，选中的日期
 * 参数2：dataType，数据类型（DataType）
 * 参数3：dataToSave，要存储的数据
 * 调用关系：外部函数，开放接口
 */
function saveData(selectedDate, dataType, dataToSave) {
  // if (!util.isLogin()) {
  //   return;
  // }

  // 读取该类型数据已存储的内容
  var allTargetData = wx.getStorageSync(dataType.value);
  // console.log("in saveData, selectedDate: ", selectedDate);
  // console.log("in saveData, dataType.value: ", dataType.value);
  // console.log("in saveData, allTargetData: ", allTargetData);
  var targetToSave = '';

  // 根据类型来判断是否需要替换其中的数据，还是直接覆盖
  switch (dataType.id) {
    case 0:
      // 0. UserInfo
      targetToSave = dataToSave;
      break;
    case 1:
      // 1. UserProfile
      targetToSave = dataToSave;
      break;
    case 2:
      // 2. SingleDayRecords
      targetToSave = makeSaveRecords(selectedDate, dataToSave, allTargetData);
      break;
    default:
      break;
  }

  console.log("in saveData, targetToSave: ", targetToSave);

  wx.setStorageSync(dataType.value, targetToSave);
}

/**
 * 功能：寻找和替换现有记录中的片段
 * 参数1：selectedDate，选中的日期
 * 参数2：dataToSave，要存储的数据
 * 参数3：originData，记录中已经有的数据
 * 返回：经过修改之后的内容
 * 调用关系：内部调用，被saveData调用
 */
function makeSaveRecords(selectedDate, dataToSave, originData) {
  // 先判断目前记录是否为空
  // 为空直接增加数据
  // 不为空，数据查重，日期重复的直接替换，日期没有的直接增加
  // console.log("in makeSaveRecords, dataToSave: ", dataToSave);
  // console.log("in makeSaveRecords, before, originData: ", originData);
  if (originData.length == 0) {
    originData = [];
    originData.push(dataToSave);
  } else {
    // 1、查重
    var hasThisDay = false;

    for (var item of originData) {
      // console.log("in makeSaveRecords, ----------------------------");
      // console.log("in makeSaveRecords, ----------------------------selectedDate",selectedDate);
      // console.log("in makeSaveRecords, ----------------------------item.date", item.date);
      if (selectedDate == item.date) {
        hasThisDay = true;
        break;
      }
    }

    // 2、没有这天的记录，直接增加
    if (!hasThisDay) {
      if (dataToSave.movementList.length > 0)
        originData = originData.concat(dataToSave);
    } else {
      // 3、有这天的记录，删除再增加
      var start = 0;  //删除开始的索引
      var count = 0;  //删除的个数

      for (var idx = 0; idx < originData.length; idx++) {
        if (selectedDate == originData[idx].date) {
          start = idx;
          break;
        }
      }

      for (var idx = 0; idx < originData.length; idx++) {
        if (selectedDate == originData[idx].date) {
          count++;
        }
      }

      originData.splice(start, count);
      originData = originData.concat(dataToSave);
    }
  }

  for (var idx = 0; idx < originData.length; idx++) {
    //循环删除动画
    for (var i = 0; i < originData[idx].movementList.length; i++) {
      // console.log("in saveData, before originData[idx].movementList.animation: ", originData[idx].movementList[i].animation);
      delete originData[idx].movementList[i].animation;
      delete originData[idx].movementList[i].wrapAnimation;
      // console.log("in saveData, after originData[idx].movementList.animation: ", originData[idx].movementList[i].animation);
    }
  }
  console.log("in makeSaveRecords, after, originData: ", originData);

  return originData;

}

module.exports = {
  loadData: loadData,
  saveData: saveData
}
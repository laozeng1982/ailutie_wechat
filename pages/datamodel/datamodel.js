/**
 * datamodel，用来创建数据模型
 */


function TrainPlan() {

}

/**
 * 
 */
function SingleDatePlan() {
  this.planDate = '';
  this.movementList = [];

  this.hasPlan = function (obj) {
    for (var item of this.movementList) {
      console.log("obj  in hasPlan ", obj);
      console.log("item in hasPlan ", item);
      console.log("in hasPlan ", this.movementList);
      if (obj.id != item.id &&
        obj.partName === item.partName &&
        obj.movementName === item.movementName) {
        return true;
      }
    }
    return false;
  };

  this.add = function (obj) {
    var sucess = false;
    if (!this.hasPlan(obj)) {
      this.movementList.push(obj);
      sucess = true;
    }

    return sucess;
  }

  this.remove = function (index) {
    console.log("remove ", index);
    var tempList = this.movementList;

    var removedId = index + '';
    for (var idx = 0; idx < tempList.length; idx++) {
      var tempString = tempList[idx].id;
      console.log("input id: ", removedId);
      console.log("currment id: ", tempString);
      console.log(removedId === tempString);
      if (String(tempString) === String(removedId)) {
        console.log("this is true");
        tempList.splice(idx, 1);
      }
    }

    //生成新数组，并重新排序
    var resetList = [];
    for (var idx = 0; idx < tempList.length; idx++) {
      console.log(tempList[idx]);
      if (tempList[idx].id > 0) {
        tempList[idx].id = idx + 1 + "";
        console.log(tempList[idx].id);
        resetList.push(tempList[idx]);
      }
    }

    //清空选中列表，重置index
    console.log("after deleted: ", resetList);

    this.movementList = resetList;
    console.log("tempList", tempList);
  }

  //检查是否重复，不重复的话，根据序号找到并且替换
  this.modify = function (index, obj) {
    var sucess = false;
    if (!this.hasPlan(obj)) {
      console.log("this.movementList", this.movementList);
      this.movementList.splice(index - 1, 1, obj);
      sucess = true;
    }

    return sucess;
  }
}


/**
 * 定义动作类
 */
function Movement(stringDate, id, pName, mName, gCount, mCount, mWeight, check, measurement) {
  var app = getApp();
  this.date = stringDate;
  this.id = id + '';
  this.partName = pName;
  this.movementName = mName;
  this.groupCount = gCount;
  this.movementCount = mCount;
  this.movementWeight = mWeight;
  this.checked = check; //记录时，一律不记录选中状态
  this.measurement = measurement;

  // this.init = function() {
  //   this.date = "";
  //   this.id = "";
  //   this.partName = "";
  //   this.movementName = "";
  //   this.groupCount = "";
  //   this.movementCount = "";
  //   this.movementWeight = "";
  //   this.checked = false; //记录时，一律不记录选中状态
  //   this.measurement = app.system.userConfig.measurement;
  // }

  // this.setDate = function (stringDate) {
  //   this.date = stringDate;
  // }

  // this.setId = function (id) {
  //   this.id = id + '';
  // }

  // this.setPartName = function (pName) {
  //   this.partName = pName;
  // }

  // this.setMovementName = function (mName) {
  //   this.movementName = mName;
  // }

  // this.setGroupCount = function (gCount) {
  //   this.groupCount = gCount;
  // }

  // this.setMovementCount = function (mCount) {
  //   this.movementCount = mCount;
  // }

  // this.setMovementWeight = function (mWeight) {
  //   this.movementWeight = mWeight;
  // }

  // this.setMovementCount = function (mCount) {
  //   this.movementCount = mCount;
  // }

  // this.setChecked = function (check) {
  //   this.checked = check;
  // }

  // this.setMeasurement = function (measurement) {
  //   this.measurement = measurement;
  // }

  /**
   * 判断两个动作是否相同，只考虑部位和名称，其他不考虑
   * 基本无法用，读进来的数据直接变成了Object
   */
  this.equals = function (movement) {
    console.log(this.partName, movement.partName);
    console.log(this.movementName, movement.movementName);
    console.log("fuck   ", this.partName === movement.partName);
    console.log("fuck2   ", this.movementName === movement.movementName);
    return (this.partName === movement.partName) && (this.movementName === movement.movementName);
  };

  /**
   * 从一个对象拷贝
   */
  this.fullCopyFrom = function (movement) {
    this.date = movement.date;
    this.id = movement.id;
    this.partName = movement.partName;
    this.movementName = movement.movementName;
    this.groupCount = movement.groupCount;
    this.movementCount = movement.movementCount;
    this.movementWeight = movement.movementWeight;
    this.checked = movement.checked; //记录时，一律不记录选中状态
    this.measurement = movement.measurement;
  };
}

module.exports = {
  TrainPlan: TrainPlan,
  SingleDatePlan: SingleDatePlan,
  Movement: Movement,
}

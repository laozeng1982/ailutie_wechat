/**
 * 每天的记录
 */
function SingleDayRecords() {
  this.date = '';
  this.source = ''; //计划来源
  this.movementList = [];

  this.hasPlan = function (obj) {
    for (var item of this.movementList) {
      // console.log("obj  in hasPlan ", obj);
      // console.log("item in hasPlan ", item);
      // console.log("in hasPlan ", this.movementList);
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
    // console.log("in SingleDayRecords.remove, remove ", index);
    var tempList = this.movementList;

    var removedId = index + '';
    for (var idx = 0; idx < tempList.length; idx++) {
      var tempString = tempList[idx].id;
      // console.log("in SingleDayRecords.remove, input id: ", removedId, ", current id: ", tempString, ", ", removedId === tempString);
      if (String(tempString) === String(removedId)) {
        tempList.splice(idx, 1);
        // console.log("in SingleDayRecords.remove, deleted!");
        break;
      }
    }

    //生成新数组，并重新排序
    var resetList = [];
    for (var idx = 0; idx < tempList.length; idx++) {
      // console.log(tempList[idx]);
      if (tempList[idx].id > 0) {
        tempList[idx].id = String(idx + 1);
        // console.log(tempList[idx].id);
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

module.exports = {
  SingleDayRecords: SingleDayRecords,

}
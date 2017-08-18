/**
 * 
 */
function SingleDateRecord() {
  this.trainDate = '';
  this.planSource = ''; //计划来源
  this.finishedMvList = [];

  this.hasMovement = function (obj) {
    for (var item of this.finishedMvList) {
      console.log("obj  in hasMovement ", obj);
      console.log("item in hasMovement ", item);
      console.log("in hasMovement ", this.finishedMvList);
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
    if (!this.hasMovement(obj)) {
      this.finishedMvList.push(obj);
      sucess = true;
    }

    return sucess;
  }

  this.remove = function (index) {
    console.log("remove ", index);
    var tempList = this.finishedMvList;

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

    this.finishedMvList = resetList;
    console.log("tempList", tempList);
  }

  //检查是否重复，不重复的话，根据序号找到并且替换
  this.modify = function (index, obj) {
    var sucess = false;
    if (!this.hasMovement(obj)) {
      console.log("this.finishedMvList", this.finishedMvList);
      this.finishedMvList.splice(index - 1, 1, obj);
      sucess = true;
    }

    return sucess;
  }
}

module.exports = {
  SingleDateRecord: SingleDateRecord,

}
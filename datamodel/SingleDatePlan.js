/**
 * 
 */
function SingleDatePlan() {
  this.planDate = '';
  this.planSource = ''; //计划来源
  this.planMvList = [];

  this.hasPlan = function (obj) {
    for (var item of this.planMvList) {
      // console.log("obj  in hasPlan ", obj);
      // console.log("item in hasPlan ", item);
      // console.log("in hasPlan ", this.planMvList);
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
      this.planMvList.push(obj);
      sucess = true;
    }

    return sucess;
  }

  this.remove = function (index) {
    // console.log("in SingleDatePlan.remove, remove ", index);
    var tempList = this.planMvList;

    var removedId = index + '';
    for (var idx = 0; idx < tempList.length; idx++) {
      var tempString = tempList[idx].id;
      // console.log("in SingleDatePlan.remove, input id: ", removedId, ", current id: ", tempString, ", ", removedId === tempString);
      if (String(tempString) === String(removedId)) {
        tempList.splice(idx, 1);
        // console.log("in SingleDatePlan.remove, deleted!");
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

    this.planMvList = resetList;
    console.log("tempList", tempList);
  }

  //检查是否重复，不重复的话，根据序号找到并且替换
  this.modify = function (index, obj) {
    var sucess = false;
    if (!this.hasPlan(obj)) {
      console.log("this.planMvList", this.planMvList);
      this.planMvList.splice(index - 1, 1, obj);
      sucess = true;
    }

    return sucess;
  }
}

module.exports = {
  SingleDatePlan: SingleDatePlan,

}
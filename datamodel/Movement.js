/**
 * 定义动作类
 * 同时记录完成情况
 */
function Movement() {
  this.date = '';
  this.id = '';
  this.partName = '';
  this.pictureSrc = '';
  this.movementName = '';
  this.planGpCount = '';
  this.actualGpCount = '';
  this.seperateMake = false;  //是否分组制定
  this.sameMvCount = false; //是否每组次数相同
  this.planAmount = [];   //数组，单组计划汇总，计划完成的次数和重量，大小和计划的一样，元素用record来记
  this.actualAmount = []; //数组，单组记录汇总，计划完成的次数和重量，大小和计划的一样，元素用record来记
  this.totalFeeling = ''; //加权平均
  this.selected = false;  //使用时，是否选中
  this.gpFinished = false; //记录时，一律不记录选中状态
  this.measurement = '';

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
    this.pictureSrc = movement.pictureSrc;
    this.movementName = movement.movementName;
    this.planGpCount = movement.planGpCount;
    this.actualGpCount = movement.actualGpCount;
    this.seperateMake = movement.seperateMake;
    this.sameMvCount = movement.sameMvCount;
    this.planAmount = movement.planAmount;
    this.actualAmount = movement.actualAmount;
    this.totalFeeling = movement.totalFeeling;
    this.selected = movement.selected;
    this.gpFinished = movement.gpFinished;
    this.measurement = movement.measurement;
  };
}

module.exports = {
  Movement: Movement,
}

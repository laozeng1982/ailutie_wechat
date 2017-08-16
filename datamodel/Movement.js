/**
 * datamodel，用来创建数据模型
 */


/**
 * 定义动作类
 */
function Movement(stringDate, id, pName, mName, gCount, mCount, mWeight, check, measurement) {
  var app = getApp();
  this.date = stringDate;
  this.id = id + '';
  this.partName = pName;
  this.pictureSrc ='';
  this.movementName = mName;
  this.groupCount = gCount;
  this.movementCount = mCount;
  this.movementWeight = mWeight;
  this.checked = check; //记录时，一律不记录选中状态
  this.measurement = measurement;

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
    this.groupCount = movement.groupCount;
    this.movementCount = movement.movementCount;
    this.movementWeight = movement.movementWeight;
    this.checked = movement.checked; //记录时，一律不记录选中状态
    this.measurement = movement.measurement;
  };
}

module.exports = {
  Movement: Movement,
}

/**
 * datamodel，用来创建数据模型
 */


function createTrainPlan(){

}

function createMovement () {

  var movement = {
    date: '',
    movementIndex: '',
    partName: '',
    movementName: '',
    groupCount: 6,
    movementCount: 8,
    movementWeight: 30,
    checked: false, //记录时，一律不记录选中状态
    measurement: ''
  };

  return movement;
}

function createMovement(stringDate, id, pName, mName, gCount, mCount, mWeight, check, measurement) {

  var movement = {
    date: stringDate,
    movementIndex: id + "",
    partName: pName,
    movementName: mName,
    groupCount: gCount,
    movementCount: mCount,
    movementWeight: mWeight,
    checked: check, //记录时，一律不记录选中状态
    measurement: measurement
  };

  return movement;
}

module.exports = {
  createTrainPlan: createTrainPlan,
  createMovement: createMovement,
}

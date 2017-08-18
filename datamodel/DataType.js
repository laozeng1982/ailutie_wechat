/**
 * 
 */
function DataType() {
  this.UserInfo = new Record(0, "UserInfo");
  this.UserProfile = new Record(1, "UserProfile");
  this.TrainPlan = new Record(2, "TrainPlan");
  this.TrainRecord = new Record(3, "TrainRecord");
}

function Record(id, value) {
  return {
    id: id,
    value: value
  };
}

module.exports = {
  DataType: DataType,
}
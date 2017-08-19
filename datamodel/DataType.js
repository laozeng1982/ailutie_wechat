/**
 * 
 */
function DataType() {
  this.UserInfo = new Record(0, "UserInfo");
  this.UserProfile = new Record(1, "UserProfile");
  this.SingleDayRecords = new Record(2, "SingleDayRecords");

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
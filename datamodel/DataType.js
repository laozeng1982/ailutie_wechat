/**
 * 数据类型
 */
class DataType {
    // 用户信息
    constructor() {
        this.UserInfo = new Record(0, "UserInfo");
        // 用户个人身体测试数据
        this.UserProfile = new Record(1, "UserProfile");
        // 每天记录
        this.DailyRecords = new Record(2, "DailyRecords");
    }

}

class Record {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }
}

module.exports = {
    DataType: DataType,
}
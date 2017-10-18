/**
 * 数据类型
 */
class StorageType {
    // 用户信息
    constructor() {
        this.UserInfo = new Record(0, "UserInfo");
        // 用户个人身体测试数据
        this.UserProfile = new Record(1, "UserProfile");
        // 每天记录
        this.RealitySet = new Record(2, "RealitySet");
        // 系统内部信息
        this.SystemSetting = new Record(3, "SystemSetting");
        // 计划
        this.PlanSet = new Record(4, "PlanSet");
        this.TodayPlan = new Record(5, "TodayPlan");
    }

}

class Record {
    constructor(id, value) {
        this.id = id;
        this.key = value;
    }
}

module.exports = {
    StorageType: StorageType,
}
class StorageType {
    // 用户信息
    constructor() {
        this.UserInfo = new Record(0, "UserInfo");
        // 用户个人身体测试数据
        this.UserProfile = new Record(1, "UserProfile");
        // 每天记录
        this.RealitySet = new Record(2, "RealitySet");
        // 计划
        this.PlanSet = new Record(3, "PlanSet");
        // 系统内部信息
        this.PartsWithActions = new Record(4, "PartsWithActions");
        // 同步标志
        this.SyncTag = new Record(5, "SyncTag");
    }
}

class Record {
    constructor(id, value) {
        this.id = id;
        this.key = value;
    }
}

class SyncTag {
    constructor() {
        this.UserInfo = false;
        // 用户个人身体测试数据
        this.UserProfile = false;
        // 每天记录
        this.RealitySet = false;
        // 系统内部信息
        this.PartsWithActions = false;
        // 计划
        this.PlanSet = false;
        // 同步标志
        this.SyncTag = false;
    }
}

module.exports = {
    StorageType: StorageType,
    SyncTag: SyncTag,
};
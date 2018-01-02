class Settings {
    constructor() {
        this.Storage = new Storage();

    }
}

class Storage {
    // 用户信息
    constructor() {
        this.UserInfo = new Record(0, "UserInfo", "用户信息");
        // 用户个人身体测试数据
        this.UserProfile = new Record(1, "UserProfile", "身体指标");
        // 计划
        this.UserPlanSet = new Record(2, "UserPlanSet", "训练计划");
        // 每天记录
        this.RealitySet = new Record(3, "RealitySet", "训练记录");
        // 系统计划
        this.SystemPlanSet = new Record(4, "SystemPlanSet", "推荐计划");
        // 系统内部信息
        this.PartsWithActions = new Record(5, "PartsWithActions", "动作信息");
        // 同步标志
        this.Settings = new Record(6, "Settings", "同步标志");
    }
}

class Record {
    constructor(id, value, name) {
        this.id = id;
        this.key = value;
        this.name = name;
        this.syncedTag = true;
    }
}

/**
 * 同步标志
 * 标志为True，表示已经同步过了，False表示还未同步
 */
class SyncedTag {
    constructor() {
        // 用户基本信息
        this.UserInfo = true;
        // 用户个人身体测试数据
        this.UserProfile = true;
        // 用户计划
        this.UserPlanSet = true;
        // 每天记录
        this.RealitySet = true;
        // 推荐计划
        this.SystemPlanSet = true;
        // 系统内部信息
        this.PartsWithActions = true;
        // 同步标志
        this.SyncedTag = true;
    }
}

module.exports = {
    Settings: Settings,
    // Storage: Storage,
    // SyncedTag: SyncedTag,
};
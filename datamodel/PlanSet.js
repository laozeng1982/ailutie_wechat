/**
 * 定义计划列表
 *
 */

class PlanSet {
    constructor() {
        this.data = []; // 存放Plan的数组
    }
}

/**
 * 一个计划，一段时间内的计划
 */
class Plan {
    constructor() {
        this.id = '';
        this.name = '';      // 计划的名字
        this.source = '';    // 计划来源：爱撸铁推荐，教练推荐，朋友推荐，自定义计划
        this.privacy = '';   // 计划权限设置：Public谁都可以看，Protect只给朋友看，Private只能自己看。

        this.target = ''; // 计划的类型：减脂，塑性，增肌
        this.level = '';    // 计划的级别：初级，中级，高级
        this.place = '';    // 健身地点
        this.frequence = 0; // 健身频率，一周N次

        this.fromDate = '';     // 计划开始的日期，格式：2017-09-25
        this.dateLength = 0;    // 计划的天数

        this.description = '';  // 计划描述

        this.reading = 0;   // 阅读数
        this.comments = [];  // 评论
        this.agree = 0;     // 点赞数

        this.partSet = [];  // 存放部位信息

    }
}


/**
 * 定义计划中的部位列表
 */
class PartSet {
    constructor(id, name) {
        this.id = id;
        this.name = name;       // 部位名字
        this.description = '';  // 部位描述
        this.imageUrl = '';
        this.trainDate = [];    // 该部位每周几锻炼，存放数字0,1,2,3,4,5,6代表周日到周六
        this.actionSet = [];    // 存放动作列表
    }

    fullCopyFrom(part) {
        this.id = part.id;
        this.name = part.name;
        this.imageUrl = part.imageUrl;
        this.trainDate = part.trainDate;
        this.description = part.description;
        this.actionSet = part.actionSet;
    }
}

/**
 * 每组动作的具体内容，包括：
 * 1.计划组数
 * 2.完成组数
 * 3.目前完成的组数
 * 4.每组感觉
 * 5.每组的详细信息，见Details
 */
class ActionSet {
    constructor() {
        this.id = '';
        this.name = '';
        this.equipment = '';
        this.description = '';
        this.imageUrl = '';
        this.trainDate = [];    // 该动作每周几锻炼，存在不和部位同步的情况，存放数字0,1,2,3,4,5,6代表周日到周六
        this.groupSet = [];     // 存放每组的计划

    }
}

class GroupData {
    constructor(id, quantity, uom, weight) {
        this.id = id;
        this.quantity = quantity;
        this.weight = weight;
        this.uom = uom;
    }
}

module.exports = {
    PlanSet: PlanSet,
    PartSet: PartSet,
    ActionSet: ActionSet,
    GroupData: GroupData,
};

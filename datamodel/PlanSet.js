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
        this.predefined = false;
        this.privacy = '';   // 计划权限设置：Public谁都可以看，Protect只给朋友看，Private只能自己看。

        this.purpose = '';   // 计划的类型：减脂，塑性，增肌
        this.level = '';    // 计划的级别：初级，中级，高级

        this.fromDate = '';     // 计划开始的日期，格式：2017-09-25
        this.toDate = '';     // 计划结束的日期，格式：2017-09-25

        this.description = '';  // 计划描述

        this.reading = 0;   // 阅读数
        this.comments = [];  // 评论
        this.agree = 0;     // 点赞数

        this.circleDaySet = [];   // 存放计划的具体信息，即CircleDay数组，只使用固定的7天一周期，即每周一循环

    }
}

class CircleDay {
    constructor(id, weekDay) {
        this.id = id;   // 这个部位锻炼的天次，该部位每周期内锻炼天次，存放数字0,1,2,3等，代表周期内的第N天
        this.weekDay = weekDay;
        this.exerciseSet = [];  // 存放计划的数据，既Exercise数组
    }
}

/**
 * 定义计划中的部位列表
 */
class Exercise {
    constructor(id, name) {
        this.id = id;
        this.forPlan = true;
        this.action = '';  // 这个Exercise的动作，Action的对象
        this.groupSet = [];    // 存放该动作每组的具体数据
    }

}

class GroupSet {
    constructor(id, quantity, uom, weight) {
        this.id = id;
        this.quantity = quantity;
        this.weight = weight;
        this.uom = uom;
    }
}

module.exports = {
    PlanSet: PlanSet,
    Plan: Plan,
    CircleDay: CircleDay,
    Exercise: Exercise,
    GroupSet: GroupSet,
};

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
        this.source = '';
        this.currentUse = false;

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

    /**
     * 从一个对象复制数据过来，保留本对象的方法
     * @param obj
     */
    cloneDataFrom(obj) {
        // 递归
        for (let item in obj) {
            if (obj.hasOwnProperty(item)) {
                this[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
            }
        }
    }

    /**
     *
     * @param dayIdx
     */
    getPlanPartByDay(dayIdx) {
        this.setPlanParts();

    }

    /**
     *
     * @param dayIdx
     * @returns {Array|*}
     */
    getPlanPartArrayByDay(dayIdx) {
        this.setPlanParts();
        return this.circleDaySet[dayIdx].partArray;
    }

    /**
     *
     * @param dayIdx
     * @returns {Array|*}
     */
    getPlanActionArrayByDay(dayIdx) {
        this.setPlanParts();
        // return this.circleDaySet[dayIdx].partArray;
    }


    /**
     * 重组一下Plan的结构，方便显示和逻辑判断
     * 作为展示用，并不改变Plan的结构
     * @param dayIdx
     */
    getReGroupExerciseSetByDay(dayIdx) {
        let exerciseSet = [];

        for (let partName of this.getPlanPartArrayByDay(dayIdx)) {
            let reGroupExercise = {name: partName, exerciseSet: []};
            for (let exercise of this.circleDaySet[dayIdx].exerciseSet) {
                if (exercise.action.partSet[0] === partName) {
                    reGroupExercise.exerciseSet.push(exercise);
                }
            }
            exerciseSet.push(reGroupExercise);
        }

        return exerciseSet;
    }

    /**
     * 设置计划的部位信息
     */
    setPlanParts() {
        for (let circleDay of this.circleDaySet) {
            let partArray = [];
            for (let exercise of circleDay.exerciseSet) {
                if (!partArray.includes(exercise.action.partSet[0])) {
                    partArray.push(exercise.action.partSet[0]);
                }
            }
            circleDay.partArray = partArray;
        }
    }
}

class CircleDay {
    constructor(id, weekDay) {
        this.id = id;
        this.enWeekDay = weekDay;
        this.chWeekDay = CircleDay.getChWeekDay(weekDay);
        this.exerciseSet = [];  // 存放计划的数据，既Exercise数组
    }

    static getChWeekDay(weekDay) {
        let chWeekDay = '';
        switch (weekDay) {
            case "Sunday":
                chWeekDay = "周日";
                break;
            case "Monday":
                chWeekDay = "周一";
                break;
            case "Tuesday":
                chWeekDay = "周二";
                break;
            case "Wednesday":
                chWeekDay = "周三";
                break;
            case "Thursday":
                chWeekDay = "周四";
                break;
            case "Friday":
                chWeekDay = "周五";
                break;
            case "Saturday":
                chWeekDay = "周六";
                break;
        }
        return chWeekDay;
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
    constructor(id, quantity, weight, uom) {
        this.id = id;
        this.quantity = quantity;
        this.weight = weight;
        this.uom = uom;
    }
}

/**
 * 深度克隆数据的方法
 * @param obj
 * @returns {*}
 */
function deepClone(obj) {

    let clone = obj.constructor === Array ? [] : {};

    // 递归
    for (let item in obj) {
        if (obj.hasOwnProperty(item)) {
            clone[item] = typeof obj[item] === "object" ? deepClone(obj[item]) : obj[item];
        }
    }

    return clone;
}

module.exports = {
    PlanSet: PlanSet,
    Plan: Plan,
    CircleDay: CircleDay,
    Exercise: Exercise,
    GroupSet: GroupSet,
};

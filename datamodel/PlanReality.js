/**
 * 定义计划列表
 *
 */

/**
 * 一个计划，一段时间内的计划
 */
class Plan {
    constructor(userUID) {
        this.id = 0;        // 由后台数据库生成，修改（PUT）的时候先获取后台id，PUT的时候用
        this.name = '';      // 计划的名字
        this.user = {id: userUID};    // 用户在后台系统的id
        this.predefined = false;    // 是否是由爱撸铁预定义的计划，false代表用户自定义，true代表爱撸铁预定义计划
        this.temporary = false; // 计划标志位之一，是否为临时计划
        this.fromDate = '';     // 计划开始的日期，格式：2017-09-25
        this.toDate = '';     // 计划结束的日期，格式：2017-09-25
        this.purpose = '';   // 计划的类型：减脂，塑性，增肌
        this.grade = '';    // 计划的级别：初级，中级，高级
        this.description = '';  // 计划描述
        this.circleDaySet = [];   // 存放计划的具体信息，即CircleDay数组，只使用固定的7天一周期，即每周一循环

        // 第二期内容，可以作为本地显示用

        this.privacy = '';   // 计划权限设置：Public谁都可以看，Protect只给朋友看，Private只能自己看。
        this.source = '';
        this.currentUse = false;

        this.targetUser = '';   // 目标人群
        this.place = '';     // 健身场地
        this.facility = ''; // 健身设备
        this.reading = 0;   // 阅读数
        this.comments = [];  // 评论
        this.agree = 0;     // 点赞数

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
        return this.circleDaySet[dayIdx].displayPartArray;
    }

    /**
     *
     * @param dayIdx
     * @returns {Array|*}
     */
    getPlanActionArrayByDay(dayIdx) {
        this.setPlanParts();
        // return this.circleDaySet[dayIdx].displayPartArray;
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
                if (exercise.action.target[0] === partName) {
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
                if (!partArray.includes(exercise.action.displayPartSet[0])) {
                    partArray.push(exercise.action.displayPartSet[0]);
                }
            }
            circleDay.displayPartArray = partArray;
        }
    }
}

/**
 * 每天的记录数据
 * 挂接每天执行的部位列表
 */
class Reality {
    constructor(date, userUID) {
        // this.id = 0;    // 该Reality在后台数据库的id
        this.date = date;   // Reality生成的日期
        this.exerciseSet = []; // ExerciseSet数组
        this.user = {id: userUID}; // 用户在后台系统的id
    }
}

/**
 * 计划中循环的每天
 */
class CircleDay {
    constructor(id, weekDay) {
        // this.id = id;   // 该数据在后台数据库的id
        this.weekDay = weekDay; //
        this.chWeekDay = CircleDay.getChWeekDay(weekDay);   //
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
 * 每个动作，不分部位，直接记
 * 挂接每个动作的执行组列表
 */
class Exercise {
    constructor(type) {
        // this.id = '';
        this.forPlan = type === 'plan';
        this.target = '';   // 锻炼的部位，string字段，取值参考：enumeration
        this.action = {id: 0};  // 该动作在后台数据库的id
        this.groupSet = [];    // 存放元素为：group对象
    }
}

/**
 * 每组动作的信息，如果是执行的结果，则有executedQuantity 和 executedQuantityPerAction
 */
class Group {
    constructor(type, order, quantityPerGroup, uomOfPerGroup, quantityPerAction, uomOfPerAction) {
        // this.id = id;    // 由后台数据库生成，上传不需要
        this.orderNumber = order;   // 本地产生group数据的序号，上传需要
        this.quantityPerGroup = quantityPerGroup;      // 计划中每组的数量
        this.groupUom = uomOfPerGroup;  // 每组的计量单位
        this.quantityPerAction = quantityPerAction;        // 计划中每组每个动作的数量
        this.actionUom = uomOfPerAction; // 每个动作的计量单位
        if (type === 'plan') {
            this.forPlan = true;   // Reality的标志位
        } else {
            this.forPlan = false;
            this.executedQuantityPerGroup = 0;  // 实际执行每组的数量
            this.executedQuantityPerAction = 0;    // 实际执行每个动作的数量
        }
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
    Plan: Plan,
    Reality: Reality,
    CircleDay: CircleDay,
    Exercise: Exercise,
    Group: Group,
};

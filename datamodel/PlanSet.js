/**
 * 定义计划列表
 * 包含id，
 */

class PlanSet {
    constructor() {
        this.id = '';
        this.dateList = [];
        this.name = '';
        this.description = '';

        this.partSet = [];

    }


    /**
     * 判断两个动作是否相同，只考虑部位和名称，其他不考虑
     * 读进来的数据直接变成了Object，实际使用时要把以PlanSet类声明的放在前面
     */
    equals(planSet, fullyEqual) {
        // console.log(this.mvId, movement.mvId, String(this.mvId) === String(movement.mvId));
        // console.log(this.mvInfo.partName, movement.mvInfo.partName);
        // console.log(this.mvInfo.mvName, movement.mvInfo.mvName);
        var isEqual = this.name === planSet.name &&
            this.partSet.equals(planSet.partSet);
        if (fullyEqual) {
            isEqual = (String(this.id) !== String(planSet.id)) && isEqual;
        }

        console.log("in equals, isEqual is: ", isEqual);
        return (isEqual);
    }

    /**
     * 从一个PlanSet完全拷贝
     */
    fullCopyFrom(planSet) {
        this.id = planSet.id;
        this.dateList = planSet.dateList;
        this.name = planSet.name;
        this.description = planSet.description;

        this.partSet = planSet.partSet;
    }
}

/**
 * 定义计划中的部位列表
 */
class Part {
    constructor(id, name, description) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.imageUrl = '';
        this.actionSet = [];
    }

    fullCopyFrom(part) {
        this.id = part.id;
        this.name = part.name;
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
        this.imageUrl = false;
        this.description = '';    // 这个动作的感觉
        this.groupSet = [];

    }
}

class GroupData {
    constructor(id, quantity, uom, weight) {
        this.id = id;
        this.quantity = quantity;
        this.uom = uom;
        this.weight = weight;
    }
}

/**
 * 单条记录器
 * 用来记录id和每组次数、对应重量和单位，是否完成，及感觉
 */
class DetailRecord {

    constructor(id, planCount, planWeight, actualCount, actualWeight) {
        this.id = id;
        this.planCount = planCount;
        this.planWeight = planWeight;
        this.actualCount = actualCount;
        this.actualWeight = actualWeight;
        this.gpMeasurement = '';
        this.measurement = '';
        this.finished = false;
        this.groupFeeling = ''; //这一组的感觉
    }

    fullCopyFrom(record) {
        this.id = record.id;
        this.planCount = record.planCount;
        this.planWeight = record.planWeight;
        this.actualCount = record.actualCount;
        this.actualWeight = record.actualWeight;
        this.gpMeasurement = record.gpMeasurement;
        this.measurement = record.measurement;
        this.finished = record.finished;
        this.groupFeeling = record.groupFeeling;
    }
}

module.exports = {
    PlanSet: PlanSet,
    Part: Part,
    ActionSet: ActionSet,
    GroupData: GroupData,
    DetailRecord: DetailRecord
}

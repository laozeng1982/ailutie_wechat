/**
 * 定义动作类
 * 同时记录完成情况
 */

class Movement {
    constructor() {
        this.date = '';
        this.mvId = '';
        this.mvInfo = new MvInfo();
        this.contents = new Contents();
        this.controller = new Controls();
    }


    /**
     * 判断两个动作是否相同，只考虑部位和名称，其他不考虑
     * 读进来的数据直接变成了Object，实际使用时要把以Movement类声明的放在前面
     */
    equals(movement, fullyEqual) {
        console.log(this.mvId, movement.mvId, String(this.mvId) === String(movement.mvId));
        console.log(this.mvInfo.partName, movement.mvInfo.partName);
        console.log(this.mvInfo.mvName, movement.mvInfo.mvName);
        var isEqual = this.mvInfo.partName === movement.mvInfo.partName &&
            this.mvInfo.mvName === movement.mvInfo.mvName;
        if (fullyEqual) {
            isEqual = (String(this.mvId) !== String(movement.mvId)) && isEqual;
        }

        console.log("in equals, isEqual is: ", isEqual);
        return (isEqual);
    }

    clearActualDetails() {
        this.contents.curFinishedGpCount = 0;
        this.contents.mvFeeling = 0;
        for (var idx = 0; idx < this.contents.details.length; idx++) {
            this.contents.details[idx].actualCount = 0;
            this.contents.details[idx].actualWeight = 0;
            this.contents.details[idx].finished = false;
            this.contents.details[idx].groupFeeling = 0;
        }
    }

    /**
     * 从一个Movement完全拷贝
     */
    fullCopyFrom(movement) {
        this.date = movement.date;
        this.mvId = movement.mvId;

        this.mvInfo = new MvInfo();
        this.mvInfo.fullCopyFrom(movement.mvInfo);

        this.contents = new Contents();
        this.contents.fullCopyFrom(movement.contents);

        this.controller = new Controls();
        this.controller.fullCopyFrom(movement.controller);
    }
}

/**
 * 定义每个具体的动作
 */
class MvInfo {
    constructor(pName, mName, mvPicSr) {
        this.partName = pName;
        this.mvName = mName;
        this.mvPictureSrc = mvPicSr;
    }

    fullCopyFrom(mvInfo) {
        this.partName = mvInfo.partName;
        this.mvName = mvInfo.mvName;
        this.mvPictureSrc = mvInfo.mvPictureSrc;
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
class Contents {
    constructor() {
        this.planGpCount = '';
        this.actualGpCount = '';
        this.curFinishedGpCount = '';
        this.mvFeeling = '';    // 这个动作的感觉
        this.details = [];
    }


    fullCopyFrom(content) {
        this.planGpCount = content.planGpCount;
        this.actualGpCount = content.actualGpCount;
        this.curFinishedGpCount = content.curFinishedGpCount;
        this.mvFeeling = content.mvFeeling;
        this.details = content.details;
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
        this.measurement = record.measurement;
        this.finished = record.finished;
        this.groupFeeling = record.groupFeeling;
    }
}

class Controls {
    constructor() {
        this.selected = false;  //使用时，是否选中
        this.seperateMake = false;  //是否分组制定
        this.sameMvCount = true; //是否每组次数相同
        this.camelMvCount = false; // 次数是否使用驼峰法
        this.camelMvCountMin = '';    // 驼峰次数最小
        this.camelMvCountMax = '';    // 驼峰次数最大
        this.camelMvWeight = false;   // 重量是否使用驼峰法
        this.camelMvWeightMin = '';   // 驼峰重量最小
        this.camelMvWeightMax = '';   // 驼峰重量最大

    }

    fullCopyFrom(controller) {
        this.selected = controller.selected;  //使用时，是否选中
        this.seperateMake = controller.seperateMake;  //是否分组制定
        this.sameMvCount = controller.sameMvCount; //是否每组次数相同
        this.camelMvCount = controller.camelMvCount; // 次数是否使用驼峰法
        this.camelMvCountMin = controller.camelMvCountMin;    // 驼峰次数最小
        this.camelMvCountMax = controller.camelMvCountMax;    // 驼峰次数最大
        this.camelMvWeight = controller.camelMvWeight;   // 重量是否使用驼峰法
        this.camelMvWeightMin = controller.camelMvWeightMin;   // 驼峰重量最小
        this.camelMvWeightMax = controller.camelMvWeightMax;   // 驼峰重量最大
    }
}

module.exports = {
    Movement: Movement,
    Contents: Contents,
    Controls: Controls,
    DetailRecord: DetailRecord
}

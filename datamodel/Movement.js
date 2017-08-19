/**
 * 定义动作类
 * 同时记录完成情况
 */
function Movement() {
    this.date = '';
    this.id = '';
    this.partName = '';
    this.movementName = '';
    this.pictureSrc = '';
    this.contents = new Contents();
    this.controller = new Controller();

    /**
     * 判断两个动作是否相同，只考虑部位和名称，其他不考虑
     * 基本无法用，读进来的数据直接变成了Object
     */
    this.equals = function (movement) {
        console.log(this.partName, movement.partName);
        console.log(this.movementName, movement.movementName);
        return (this.partName === movement.partName) && (this.movementName === movement.movementName);
    };

    /**
     * 从一个Movement完全拷贝
     */
    this.fullCopyFrom = function (movement) {
        this.date = movement.date;
        this.id = movement.id;
        this.partName = movement.partName;
        this.movementName = movement.movementName;
        this.pictureSrc = movement.pictureSrc;
        this.contents = movement.contents;
        this.controller = movement.controller;
    };
}

function Contents() {
    this.planGpCount = '';
    this.actualGpCount = '';
    this.curFinishedGpCount = '';
    this.groupFeeling = '';
    this.details = '';

    this.fullCopyFrom = function (content) {
        this.planGpCount = content.planGpCount;
        this.actualGpCount = content.actualGpCount;
        this.curFinishedGpCount = content.curFinishedGpCount;
        this.groupFeeling = content.groupFeeling;
        this.details = content.details;
    }
}

function Controller() {
    this.selected = false;  //使用时，是否选中
    this.seperateMake = false;  //是否分组制定
    this.sameCount = true; //是否每组次数相同
    this.camelCount = false; // 次数是否使用驼峰法
    this.camelCountMin = '';    // 驼峰次数最小
    this.camelCountMax = '';    // 驼峰次数最大
    this.camelWeight = false;   // 重量是否使用驼峰法
    this.camelWeightMin = '';   // 驼峰重量最小
    this.camelWeightMax = '';   // 驼峰重量最大

    this.fullCopyFrom = function (controller) {
        this.selected = controller.selected;  //使用时，是否选中
        this.seperateMake = controller.seperateMake;  //是否分组制定
        this.sameCount = controller.sameCount; //是否每组次数相同
        this.camelCount = controller.camelCount; // 次数是否使用驼峰法
        this.camelCountMin = controller.camelCountMin;    // 驼峰次数最小
        this.camelCountMax = controller.camelCountMax;    // 驼峰次数最大
        this.camelWeight = controller.camelWeight;   // 重量是否使用驼峰法
        this.camelWeightMin = controller.camelWeightMin;   // 驼峰重量最小
        this.camelWeightMax = controller.camelWeightMax;   // 驼峰重量最大
    }
}

module.exports = {
    Movement: Movement,
    Contents: Contents,
    Controller: Controller
}

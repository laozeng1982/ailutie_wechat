/**
 * 每天的记录数据
 * 挂接每天执行的部位列表
 */
class Reality {
    constructor(date) {
        this.id = '';
        this.date = date;
        this.exerciseSet = []; // 存放ExecutedPartSet
    }
}

/**
 * 每天执行的动作，不分部位，直接记
 * 挂接每个动作的执行组列表
 */
class ExecutedSet {
    constructor() {
        this.id = '';
        this.name = '';
        this.imageUrl = '';
        this.description = '';
        this.equipment = '';
        this.executedGroupSet = [];    // 存放ExecutedGroupSet
    }
}

/**
 * 每组动作的执行结果
 */
class ExecutedGroupSet {
    constructor() {
        this.id = 0;
        this.executedQuantity = 0;
        this.executedWeight = 0;
        this.quantity = 0;
        this.weight = 0;
        this.uom = '';
        this.weight = 0;
    }
}

module.exports = {
    Reality: Reality,
    ExecutedSet: ExecutedSet,
    ExecutedGroupSet: ExecutedGroupSet
}
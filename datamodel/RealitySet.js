/**
 * 每天的记录数据
 * 挂接每天执行的部位列表
 */
class Reality {
    constructor() {
        this.id = '';
        this.date = '';
        this.executedPartSets = []; // 存放ExecutedPartSet
    }
}

/**
 * 每天执行的部位
 * 挂接每个动作的执行列表
 */
class ExecutedPartSet {
    constructor() {
        this.id = '';
        this.name = '';
        this.imageUrl = '';
        this.description = '';
        this.equipment = '';
        this.executedGroupSets = [];    // 存放ExecutedGroupSet
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
    ExecutedPartSet: ExecutedPartSet,
    ExecutedGroupSet: ExecutedGroupSet
}
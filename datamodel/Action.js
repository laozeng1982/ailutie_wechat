/**
 * 具体的动作
 */
class Action {
    constructor() {
        this.id = '';
        this.name = '';
        this.equipment = '';
        this.description = '';
        this.imageUrl = '';
        this.predefined = true;    // 是否为系统内置
        this.target = [];  // 该动作关联的部位，一个动作可能会练到多个部位
        this.displayPartSet = [];
        this.defaultQuantity = {};
        // just for UI
        this.selected = false;
    }
}

module.exports = {
    Action: Action
};
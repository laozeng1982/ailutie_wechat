/**
 * 身体部位
 */
class BodyPart {
    constructor() {
        this.id = '';
        this.bodyPart = '';
        this.name = '';
        this.imageUrl = '';
        this.description = '';
        this.predefined = true;
        this.actionSet = [];  // 这个部位关联的动作
        // for UI control
        this.selected = false;
    }
}

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
        this.partSet = [];  // 该动作关联的部位，一个动作可能会练到多个部位
        // just for UI
        this.selected = false;
    }
}

module.exports = {
    BodyPart: BodyPart,
    Action: Action
};
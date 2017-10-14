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

module.exports = {
    BodyPart: BodyPart,
};
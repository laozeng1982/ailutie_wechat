/**
 * Bod
 */
class BodyPart {
    constructor() {
        this.partId = '';
        this.partName = '';
        this.partPictureSrc = '';
        this.partDescription = '';
        this.actionList = [];
    }
}

class Action {
    constructor() {
        this.actionId = '';
        this.actionName ='';
        this.actionEquipment ='';
        this.actionPictureSrc = '';
        this.actionDescription ='';
    }
}

module.exports = {
    BodyPart: BodyPart
}
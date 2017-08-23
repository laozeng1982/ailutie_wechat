import BodyPartList from './BodyPart.js'

class SystemSetting {
    constructor() {
        this.bodyPartList = new BodyPartList.BodyPartList();
    }
}

module.exports = {
    SystemSetting: SystemSetting
}
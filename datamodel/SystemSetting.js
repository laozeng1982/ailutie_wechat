import Body from './Body.js'

class SystemSetting {
    constructor() {
        this.body = new Body.Body();
        this.body.makeDefaultDefaultPartList();
    }
}

module.exports = {
    SystemSetting: SystemSetting
}
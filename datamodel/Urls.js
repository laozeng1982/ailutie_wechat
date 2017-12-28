let baseUrl = 'https://www.newpictown.com/';

class Urls {
    constructor() {
        this.action = new action();
        this.enumeration = baseUrl + "enumerations";
        this.part = new part();
        this.plan = new plan();
        this.user = new user();
    }
}

class action {

}

class part {

}

class plan {

}

class user {
    getOpenId(js_code) {
        return baseUrl + "user/wechatMPOpenId/" + js_code;
    }

    byId(id) {
        return baseUrl + "user/" + id;
    }

    byOpenId(openId) {
        return baseUrl + "user/byWechatMPOpenId/" + openId;
    }

    byUnionId(unionId) {
        return baseUrl + "user/byWechatUnionId/" + unionId;
    }
}


module.exports = {
    Urls: Urls,
};
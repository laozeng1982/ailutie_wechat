/**
 * 账户基本信息
 */

class UserInfo {

    constructor() {
        //以下数据，一旦建立，不可修改
        this.userUID = ''; //系统分配，所有数据的唯一识别号，系统验证使用，
        this.wechatUserInfo = new WechatUserInfo(); //微信获取的信息
        this.gender = ''; //就俩，男或者女
        this.birthday = ''; //格式：1990-08-10

        //以下数据可以修改：
        this.defaultWechatLogin = false;
        this.type = [];  //用户类型，可以多选：user，coach，gym
        this.nickName = ''; //昵称
        this.height = '';
        this.weight = '';
        this.cellPhoneNo = '';  //电话
        this.privacy = '';  //隐私权限设置
        this.gym = '';  //健身房信息
        this.relationship = ''; //教练，朋友
        this.hasPlanDateList = [];
        this.hasTrainedDateList = [];
        this.userSetting = '';
    }

}

class WechatUserInfo {
    constructor() {
        this.avatarUrl = '';
        this.city = '';
        this.country = '';
        this.gender = '';
        this.language = '';
        this.nickName = '';
        this.province = '';

    }

    // constructor(userInfo) {
    //     this.avatarUrl = userInfo.avatarUrl;
    //     this.city = userInfo.city;
    //     this.country = userInfo.country;
    //     this.gender = userInfo.gender;
    //     this.language = userInfo.language;
    //     this.nickName = userInfo.nickName;
    //     this.province = userInfo.province;
    //
    // }
}

module.exports = {
    UserInfo: UserInfo,

}
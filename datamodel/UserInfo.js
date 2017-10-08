/**
 * 账户基本信息
 */

class UserInfo {

    constructor() {
        //以下数据，一旦建立，不可修改
        this.userUID = ''; //系统分配，所有数据的唯一识别号，系统验证使用，
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
        this.userSetting = '';
    }

}

module.exports = {
    UserInfo: UserInfo,

}
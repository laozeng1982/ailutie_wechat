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

class UserProfile {
    constructor() {
        this.profiles = [

            new UserProfileItem(1, "General", "身高", "", "cm"),
            new UserProfileItem(2, "General", "体重", "", "Kg"),
            new UserProfileItem(3, "General", "BMI", "", ""),
            new UserProfileItem(4, "General", "体脂率", "", "%"),

            new UserProfileItem(1, "Circumference", "肩宽", "", "cm"),
            new UserProfileItem(2, "Circumference", "胸围", "", "cm"),
            new UserProfileItem(3, "Circumference", "腰围", "", "cm"),
            new UserProfileItem(4, "Circumference", "上臂围", "", "cm"),
            new UserProfileItem(5, "Circumference", "小臂维", "", "cm"),
            new UserProfileItem(6, "Circumference", "臀围", "", "cm"),
            new UserProfileItem(7, "Circumference", "大腿维", "", "cm"),
            new UserProfileItem(8, "Circumference", "小腿维", "", "cm"),

            new UserProfileItem(1, "Strength", "上斜卧推", "", "Kg"),
            new UserProfileItem(2, "Strength", "平卧推举", "", "Kg"),
            new UserProfileItem(3, "Strength", "下斜卧推", "", "Kg"),
            new UserProfileItem(4, "Strength", "直腿硬拉", "", "Kg"),
            new UserProfileItem(5, "Strength", "屈腿硬拉", "", "Kg"),
            new UserProfileItem(6, "Strength", "哑铃弯举", "", "Kg"),
            new UserProfileItem(7, "Strength", "杠铃弯举", "", "Kg"),

        ];
    }
}

class UserProfileItem {
    constructor(key, type, name, value, measurement) {
        this.key = key;
        this.type = type;
        this.name = name;
        this.value = value;
        this.measurement = measurement;
    }
}

module.exports = {
    UserInfo: UserInfo,
    UserProfile: UserProfile

}
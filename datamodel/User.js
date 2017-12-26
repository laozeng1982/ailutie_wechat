/**
 * 账户基本信息
 */

import Body from './Body'

class UserInfo {

    constructor() {
        //以下数据，一旦建立，不可修改
        this.userUID = -1; //系统分配，所有数据的唯一识别号，系统验证使用
        this.wechatOpenId = '';
        this.wechatUnionId = '';
        this.gender = ''; //男、女或者不知道
        this.birthday = ''; //格式：1990-08-10

        //以下数据可以修改：
        this.defaultWechatLogin = false;
        this.type = [];  //用户类型，可以多选：user，coach，gym
        this.nickName = ''; //昵称
        this.height = '';
        this.weight = '';
        this.mobileNumber = '';  //电话
        this.privacy = '';  //隐私权限设置
        this.gym = '';  //健身房信息
        this.relationship = ''; //教练，朋友
        this.userSetting = '';
    }
}

class UserProfile {
    constructor() {
        this.date = '';
        this.profiles =
            // 一般指标
            {
                general: {
                    name: "总体",
                    data: [
                        new UserProfileItem(1, "General", "height", "身高", "", "cm"),
                        new UserProfileItem(2, "General", "weight", "体重", "", "Kg"),
                        new UserProfileItem(3, "General", "bmi", "BMI", "", ""),
                        new UserProfileItem(4, "General", "bodyFatRate", "体脂率", "", "%"),
                    ],
                },

                // 维度指标
                circumference: {
                    name: "围度",
                    data: [
                        new UserProfileItem(1, "Circumference", "shoulder_width", "肩宽", "", "cm"),
                        new UserProfileItem(2, "Circumference", "chest_perimeter", "胸围", "", "cm"),
                        new UserProfileItem(3, "Circumference", "waist_perimeter", "腰围", "", "cm"),
                        new UserProfileItem(6, "Circumference", "buttocks_perimeter", "臀围", "", "cm"),
                        new UserProfileItem(4, "Circumference", "upper_arm_perimeter", "上臂围", "", "cm"),
                        new UserProfileItem(5, "Circumference", "forearm_perimeter", "小臂围", "", "cm"),
                        new UserProfileItem(7, "Circumference", "thigh_perimeter", "大腿围", "", "cm"),
                        new UserProfileItem(8, "Circumference", "shank_perimeter", "小腿围", "", "cm"),
                    ],
                },

                // 力量指标

                strength: {
                    name: "力量",
                    data: [],
                }
            }

        ;

        let body = new Body.Body();
        body.makeDefaultDefaultPartList();
        let idx = 1;
        let actionNameArray = [];
        for (let part of body.parts) {
            for (let action of part.actionSet) {
                if (!actionNameArray.includes(action.name)) {
                    actionNameArray.push(action.name);
                    this.profiles.strength.data.push(new UserProfileItem(idx, "Strength", "", action.name, "", "Kg"));
                    idx++;
                }
            }
        }
    }
}

class UserProfileItem {
    constructor(key, type, enName, chName, value, measurement) {
        this.key = key;
        this.type = type;
        this.enName = enName;
        this.chName = chName;
        this.value = value;
        this.measurement = measurement;
    }
}

module.exports = {
    UserInfo: UserInfo,
    UserProfile: UserProfile

}
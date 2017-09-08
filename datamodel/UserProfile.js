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
    UserProfile: UserProfile
    // UserProfileItem: UserProfileItem
};
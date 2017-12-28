/**
 * 建立一个健身词典
 */

class Dictionary {
    constructor() {
        this.data = [
            // body parts
            {english: "Whole", chinese: "全身"},
            {english: "Chest", chinese: "胸部"},
            {english: "Shoulder", chinese: "肩部"},
            {english: "Back", chinese: "背部"},
            {english: "Waist", chinese: "腰部"},
            {english: "Abdomen", chinese: "腹部"},
            {english: "Arm", chinese: "手臂"},
            {english: "Leg", chinese: "腿部"},
            // 健身目标
            {english: "Muscle", chinese: "增肌"},
            {english: "Weight", chinese: "减脂"},
            {english: "Physique", chinese: "塑性"},
            // 健身水平
            {english: "Primary", chinese: "初级"},
            {english: "Medium", chinese: "中级"},
            {english: "Senior", chinese: "高级"},
            // 目标人群
            {english: "Male", chinese: "男"},
            {english: "Female", chinese: "女"},
            {english: "All", chinese: "全部"},
            // 健身设备
            {english: "Equipment", chinese: "器械"},
            {english: "Hands", chinese: "徒手"},
            // 健身地点
            {english: "Gym", chinese: "健身房"},
            {english: "Playground", chinese: "操场"},
            {english: "Home", chinese: "家里"},
            // 计划权限
            {english: "Public", chinese: "全部公开"},
            {english: "Protect", chinese: "仅朋友可见"},
            {english: "Private", chinese: "仅自己可见"},
        ]
    }

    getEnFromCh(chinese) {
        for (let item of this.data) {
            if (item.chinese === chinese) {
                return item.english;
            }
        }
        return chinese;
    }

    getChFromEn(english) {
        for (let item of this.data) {
            if (item.english === english) {
                return item.chinese;
            }
        }
        return english;
    }
}

module.exports = {
    Dictionary: Dictionary
}


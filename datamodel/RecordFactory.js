/**
 * 数据原型
 */


/**
 * 单条记录器
 * 用来记录id和每组次数、对应重量和单位，是否完成，及感觉
 */
class DetailRecord {

    constructor(id, planCount, planWeight, actualCount, actualWeight) {
        this.id = id;
        this.planCount = planCount;
        this.planWeight = planWeight;
        this.actualCount = actualCount;
        this.actualWeight = actualWeight;
        this.measurement = '';
        this.finished = false;
        this.groupFeeling = ''; //这一组的感觉
    }


    fullCopyFrom(record) {
        this.id = record.id;
        this.planCount = record.planCount;
        this.planWeight = record.planWeight;
        this.actualCount = record.actualCount;
        this.actualWeight = record.actualWeight;
        this.measurement = record.measurement;
        this.finished = record.finished;
        this.groupFeeling = record.groupFeeling;
    }
}

class DateItem {
    constructor(id, dateString) {
        this.id = id;
        this.date = dateString;
    }

}

module.exports = {
    DetailRecord: DetailRecord,
    DateItem: DateItem
}
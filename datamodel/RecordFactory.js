/**
 * 数据原型
 */


/**
 * 单条记录器
 * 用来记录id和每组次数、对应重量和单位，是否完成，及感觉
 */
function DetailRecord(id, planCount, planWeight, actualCount, actualWeight) {
    this.id = id;
    this.planCount = planCount;
    this.planWeight = planWeight;
    this.actualCount = actualCount;
    this.actualWeight = actualWeight;
    this.measurement = '';
    this.finished = false;
    this.feeling = '';

    this.fullCopyFrom = function (record) {
        this.id = record.id;
        this.planCount = record.planCount;
        this.planWeight = record.planWeight;
        this.actualCount = record.actualCount;
        this.actualWeight = record.actualWeight;
        this.measurement = record.measurement;
        this.finished = record.finished;
        this.feeling = record.feeling;
    }
}

function DateItem(id, dateString) {
    this.id = id;
    this.date = dateString;
}

module.exports = {
    DetailRecord: DetailRecord,
    DateItem: DateItem
}
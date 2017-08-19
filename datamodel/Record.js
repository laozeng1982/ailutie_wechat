/**
 * 简单记录器
 * 用来记录id和每组次数及对应重量，是否完成，及感觉
 */

function Record(id, planCount, planWeight, actualCount, actualWeight) {
    this.id = id;
    this.planCount = planCount;
    this.planWeight = planWeight;
    this.actualCount = actualCount;
    this.actualWeight = actualWeight;
    this.finished = false;
    this.feeling = '';
}

module.exports = {
    Record: Record
}
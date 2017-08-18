/**
 * 简单记录器
 * 用来记录id和每组次数及对应重量，是否完成，及感觉
 */

function Record(id, count, weight) {
  this.id = id;
  this.count = count;
  this.weight = weight;
  this.finished = false;
  this.feeling = '';
}

module.exports = {
  Record: Record
}
/**
 * 账户基本信息
 */

function UserBasicInfo(){

  //以下数据，一旦建立，不可修改
  this.userUID = ''; //系统分配，所有数据的唯一识别号，系统验证使用，
  this.wechatUserInfo=''; //微信名字
  this.gender=''; //就俩，男或者女
  this.birthday=''; //格式：1990-08-10

  //用户类型，可以多选
  this.defaultWechatLogin = false;
  this.type='';  //以下数据可以修改：user，coach，gym

  this.height='';
  this.weight='';
  this.nickName=''; //昵称
  this.cellPhoneNo = '';  //电话
  this.privacy='';  //隐私权限设置
  this.gym='';  //健身房信息
  this.profile='';  //个人体测数据
  this.relationship=''; //教练，朋友
}

module.exports = {
  UserBasicInfo: UserBasicInfo,

}
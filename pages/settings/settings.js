// settings.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    list: [
      {
        list_tool: [
          {
            img: "../../pages/image/photo.png",
            name: "朋友圈"
          },
          {
            img: "../../pages/image/money.png",
            name: "个人状态记录",
            url: "../audio/audio"
          },

        ]
      },
      {
        list_tool: [
          {
            img: "../../pages/image/card.png",
            name: "收藏",
            url: "../picker/picker"

          },
          {
            img: "../../pages/image/money.png",
            name: "健身知识（重点）",
            url: "../audio/audio"
          },
          {
            img: "../../pages/image/sc_2.png",
            name: "我们吃什么(三个页面：增肌、减脂和营养)",
            url: "../upload/upload"
          }
        ]
      },
      {
        list_tool: [
          {
            img: "../../pages/image/bq_2.png",
            name: "表情"
          },
          {
            img: "../../pages/image/setting.png",
            name: "设置（软件和基础信息）",
            url: "../info/info"
          }
        ]
      },
      {
        list_tool: [
          {
            img: "../../pages/image/money.png",
            name: "打赏~~",
            url: "../audio/audio"
          },
          {
            img: "../../pages/image/card.png",
            name: "卡包",
            url: "../picker/picker"
          }
        ]
      },
    ]
  },

  goPage: function (event) {
    console.log(event.currentTarget.dataset.log);
    wx.navigateTo({
      url: event.currentTarget.dataset.url
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})
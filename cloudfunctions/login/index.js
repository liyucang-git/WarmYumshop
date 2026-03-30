// 登录云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  try {
    const { code, userInfo } = event
    
    // 调用微信登录接口获取 openid
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID
    
    // 查询用户是否已存在
    const userResult = await usersCollection.where({ openid }).get()
    
    if (userResult.data.length > 0) {
      // 用户已存在，返回用户信息
      return {
        success: true,
        data: userResult.data[0]
      }
    } else {
      // 用户不存在，创建新用户
      const newUser = {
        openid,
        nickname: userInfo?.nickName || '',
        avatarUrl: userInfo?.avatarUrl || '',
        familyId: '',
        role: '',
        joinTime: '',
        createTime: new Date()
      }
      
      const addResult = await usersCollection.add({ data: newUser })
      newUser._id = addResult._id
      
      return {
        success: true,
        data: newUser,
        isNewUser: true
      }
    }
  } catch (error) {
    console.error('登录失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
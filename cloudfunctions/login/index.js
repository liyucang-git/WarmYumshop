// 登录云函数
const cloud = require('wx-server-sdk')

// 使用显式的环境ID初始化
cloud.init({
  env: 'tangyuan-3gqjbda947233e77'
})

const db = cloud.database()
const usersCollection = db.collection('users')

console.log('login云函数初始化完成')

exports.main = async (event, context) => {
  try {
    console.log('登录云函数调用, event:', event)

    const { code, userInfo } = event

    // 调用微信登录接口获取 openid
    const wxContext = cloud.getWXContext()
    const openid = wxContext.OPENID

    console.log('获取到 openid:', openid)

    if (!openid) {
      return {
        success: false,
        error: '无法获取用户 openid'
      }
    }

    // 查询用户是否已存在
    const userResult = await usersCollection.where({ openid }).get()
    console.log('查询用户结果:', userResult.data)

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

      console.log('创建新用户:', newUser)
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
    console.error('错误堆栈:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}
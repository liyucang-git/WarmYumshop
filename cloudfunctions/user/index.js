// 用户管理云函数
const tcb = require('@cloudbase/node-sdk')

// 初始化
const app = tcb.init({ env: 'tangyuan-3gqjbda947233e77' })
const db = app.database()
const usersCollection = db.collection('users')

exports.main = async (event, context) => {
  console.time('user-execution-time')
  try {
    console.log('用户管理云函数调用, event:', event)

    const { action, data } = event

    if (action === 'updateUserInfo') {
      // 更新用户信息
      const { userId, nickname, avatarUrl } = data
      
      console.log('更新用户信息:', { userId, nickname, avatarUrl })
      
      const updateData = {}
      if (nickname) updateData.nickname = nickname
      if (avatarUrl) updateData.avatarUrl = avatarUrl
      
      const result = await usersCollection.doc(userId).update({
        data: updateData
      })
      
      console.log('更新用户信息结果:', result)
      
      return {
        success: true,
        data: result
      }
    }

    return {
      success: false,
      error: '未知的操作'
    }
  } catch (error) {
    console.error('用户管理云函数失败:', error)
    console.error('错误堆栈:', error.stack)
    return {
      success: false,
      error: error.message
    }
  } finally {
    console.timeEnd('user-execution-time')
  }
}
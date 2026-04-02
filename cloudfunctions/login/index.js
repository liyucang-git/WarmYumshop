// 登录云函数
const tcb = require('@cloudbase/node-sdk')

// 初始化
const app = tcb.init({ env: 'tangyuan-3gqjbda947233e77' })
const db = app.database()
const usersCollection = db.collection('users')

console.log('login云函数初始化完成')

// 从 environment 字符串中解析出 WX_OPENID
function getOpenIdFromEnv(context) {
  try {
    // 方法1: 直接从 context 获取
    if (context.WX_OPENID) {
      return context.WX_OPENID
    }
    
    // 方法2: 从 environment 字符串中解析
    if (typeof context.environment === 'string') {
      const match = context.environment.match(/WX_OPENID=([^;]+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    // 方法3: 从 environ 字符串中解析
    if (typeof context.environ === 'string') {
      const match = context.environ.match(/WX_OPENID=([^;]+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  } catch (error) {
    console.error('解析 openid 失败:', error)
    return null
  }
}

exports.main = async (event, context) => {
  console.time('login-execution-time')
  try {
    console.log('登录云函数调用, event:', event)

    const { action, data, code, userInfo } = event

    if (action === 'getUserInfo') {
      // 获取用户信息
      const { userId } = data
      
      console.log('获取用户信息:', { userId })
      
      // 检查userId是否存在
      if (!userId) {
        return {
          success: false,
          error: '缺少用户ID参数'
        }
      }
      
      // 确保userId是字符串类型
      if (typeof userId !== 'string' && typeof userId !== 'number') {
        return {
          success: false,
          error: '无效的用户ID'
        }
      }
      
      const userResult = await usersCollection.doc(String(userId)).get()
      console.log('查询用户结果:', userResult.data)
      
      if (userResult.data) {
        return {
          success: true,
          data: userResult.data
        }
      } else {
        return {
          success: false,
          error: '用户不存在'
        }
      }
    }

    // 从 context 中获取微信登录信息
    const openid = getOpenIdFromEnv(context)

    console.log('获取到 openid:', openid)
    console.log('WX_OPENID from environment:', getOpenIdFromEnv(context))

    if (!openid) {
      console.error('无法获取用户 openid')
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
      const addResult = await usersCollection.add(newUser)
      newUser._id = addResult.id

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
  } finally {
    console.timeEnd('login-execution-time')
  }
}
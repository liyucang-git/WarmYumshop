// 家庭管理云函数
const cloud = require('wx-server-sdk')

// 使用显式的环境ID初始化
cloud.init({
  env: 'tangyuan-3gqjbda947233e77'
})

const db = cloud.database()
const familiesCollection = db.collection('families')
const usersCollection = db.collection('users')

console.log('family云函数初始化完成')

// 生成随机邀请码
function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

exports.main = async (event, context) => {
  try {
    console.log('家庭管理云函数调用, event:', event)

    const { action, data } = event

    switch (action) {
      case 'createFamily': {
        const { name, creatorId } = data

        console.log('创建家庭:', { name, creatorId })

        // 生成邀请码
        const inviteCode = generateInviteCode()

        // 创建家庭
        const newFamily = {
          name,
          creatorId,
          inviteCode,
          members: [{
            userId: creatorId,
            joinTime: new Date()
          }],
          createTime: new Date()
        }

        console.log('插入家庭数据:', newFamily)
        const addResult = await familiesCollection.add({ data: newFamily })
        newFamily._id = addResult._id
        console.log('家庭创建成功, ID:', newFamily._id)

        // 更新用户信息
        await usersCollection.doc(creatorId).update({
          data: {
            familyId: newFamily._id,
            role: 'creator',
            joinTime: new Date()
          }
        })

        return {
          success: true,
          data: newFamily
        }
      }

      case 'joinFamily': {
        const { inviteCode, userId } = data

        console.log('加入家庭:', { inviteCode, userId })

        // 查找家庭
        const familyResult = await familiesCollection.where({ inviteCode }).get()
        if (familyResult.data.length === 0) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        const family = familyResult.data[0]

        // 检查用户是否已在家庭中
        const userResult = await usersCollection.doc(userId).get()
        if (userResult.data.familyId) {
          return {
            success: false,
            error: '您已加入其他家庭'
          }
        }

        // 更新家庭成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(family._id).get()
        const currentMembers = currentFamily.data.members || []
        currentMembers.push({
          userId,
          joinTime: new Date()
        })
        
        await familiesCollection.doc(family._id).update({
          data: {
            members: currentMembers
          }
        })

        // 更新用户信息
        await usersCollection.doc(userId).update({
          data: {
            familyId: family._id,
            role: 'member',
            joinTime: new Date()
          }
        })

        return {
          success: true,
          data: family
        }
      }

      case 'getFamilyInfo': {
        const { familyId } = data

        console.log('获取家庭信息:', familyId)

        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        return {
          success: true,
          data: familyResult.data
        }
      }

      case 'removeMember': {
        const { familyId, memberId } = data

        // 检查成员是否存在
        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        // 移除成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(familyId).get()
        const currentMembers = currentFamily.data.members || []
        const newMembers = currentMembers.filter(member => member.userId !== memberId)
        
        await familiesCollection.doc(familyId).update({
          data: {
            members: newMembers
          }
        })

        // 清除用户家庭信息
        await usersCollection.doc(memberId).update({
          data: {
            familyId: '',
            role: '',
            joinTime: ''
          }
        })

        return {
          success: true
        }
      }

      case 'dissolveFamily': {
        const { familyId } = data

        // 获取家庭信息
        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        const family = familyResult.data

        // 清除所有成员的家庭信息
        for (const member of family.members) {
          await usersCollection.doc(member.userId).update({
            data: {
              familyId: '',
              role: '',
              joinTime: ''
            }
          })
        }

        // 删除家庭
        await familiesCollection.doc(familyId).remove()

        return {
          success: true
        }
      }

      case 'leaveFamily': {
        const { familyId, userId } = data

        // 检查用户是否是创建者
        const userResult = await usersCollection.doc(userId).get()
        if (userResult.data.role === 'creator') {
          return {
            success: false,
            error: '创建者不能离开家庭，请先解散家庭'
          }
        }

        // 移除成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(familyId).get()
        const currentMembers = currentFamily.data.members || []
        const newMembers = currentMembers.filter(member => member.userId !== userId)
        
        await familiesCollection.doc(familyId).update({
          data: {
            members: newMembers
          }
        })

        // 清除用户家庭信息
        await usersCollection.doc(userId).update({
          data: {
            familyId: '',
            role: '',
            joinTime: ''
          }
        })

        return {
          success: true
        }
      }

      default:
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('家庭管理失败:', error)
    console.error('错误堆栈:', error.stack)
    return {
      success: false,
      error: error.message
    }
  }
}
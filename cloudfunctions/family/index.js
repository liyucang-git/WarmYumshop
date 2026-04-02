// 家庭管理云函数
const tcb = require('@cloudbase/node-sdk')

// 初始化
const app = tcb.init({ env: 'tangyuan-3gqjbda947233e77' })
const db = app.database()
const _ = db.command
const familiesCollection = db.collection('families')
const usersCollection = db.collection('users')
const dishesCollection = db.collection('dishes')


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

    const { action, data } = event

    switch (action) {
      case 'createFamily': {
        const { name, creatorId } = data


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

        const addResult = await familiesCollection.add(newFamily)
        newFamily._id = addResult.id

        // 更新用户信息
        await usersCollection.doc(creatorId).update({
          familyId: newFamily._id,
          role: 'creator',
          joinTime: new Date()
        })

        return {
          success: true,
          data: newFamily
        }
      }

      case 'joinFamily': {
        const { inviteCode, userId } = data


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
        if (userResult.data.length > 0 && userResult.data[0].familyId) {
          return {
            success: false,
            error: '您已加入其他家庭'
          }
        }

        // 更新家庭成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(family._id).get()
        const currentMembers = currentFamily.data[0].members || []
        currentMembers.push({
          userId,
          joinTime: new Date()
        })
        
        await familiesCollection.doc(family._id).update({
          members: currentMembers
        })

        // 更新用户信息
        await usersCollection.doc(userId).update({
          familyId: family._id,
          role: 'member',
          joinTime: new Date()
        })

        return {
          success: true,
          data: family
        }
      }

      case 'getFamilyInfo': {
        const { familyId } = data


        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data || familyResult.data.length === 0) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        return {
          success: true,
          data: familyResult.data[0]
        }
      }

      case 'removeMember': {
        const { familyId, memberId } = data

        // 检查成员是否存在
        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data || familyResult.data.length === 0) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        // 移除成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(familyId).get()
        const currentMembers = currentFamily.data[0].members || []
        const newMembers = currentMembers.filter(member => member.userId !== memberId)
        
        await familiesCollection.doc(familyId).update({
          members: newMembers
        })

        // 清除用户家庭信息
        await usersCollection.doc(memberId).update({
          familyId: _.remove(),
          role: _.remove(),
          joinTime: _.remove()
        })

        return {
          success: true
        }
      }

      case 'dissolveFamily': {
        const { familyId } = data

        // 获取家庭信息
        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data || familyResult.data.length === 0) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        const family = familyResult.data[0]

        // 删除家庭的所有菜品
        const dishesResult = await dishesCollection.where({ familyId }).get()
        if (dishesResult.data && dishesResult.data.length > 0) {
          for (const dish of dishesResult.data) {
            await dishesCollection.doc(dish._id).remove()
          }
        }

        // 清除所有成员的家庭信息
        for (const member of family.members) {
          await usersCollection.doc(member.userId).update({
            familyId: _.remove(),
            role: _.remove(),
            joinTime: _.remove()
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
        if (userResult.data.length > 0 && userResult.data[0].role === 'creator') {
          return {
            success: false,
            error: '创建者不能离开家庭，请先解散家庭'
          }
        }

        // 移除成员 - 先获取现有成员
        const currentFamily = await familiesCollection.doc(familyId).get()
        const currentMembers = currentFamily.data[0].members || []
        const newMembers = currentMembers.filter(member => member.userId !== userId)
        
        await familiesCollection.doc(familyId).update({
          members: newMembers
        })

        // 清除用户家庭信息
        await usersCollection.doc(userId).update({
          familyId: _.remove(),
          role: _.remove(),
          joinTime: _.remove()
        })

        return {
          success: true
        }
      }

      case 'updateFamilyName': {
        const { familyId, newName, userId } = data

        // 检查家庭是否存在
        const familyResult = await familiesCollection.doc(familyId).get()
        if (!familyResult.data || familyResult.data.length === 0) {
          return {
            success: false,
            error: '家庭不存在'
          }
        }

        // 检查用户是否是创建者
        const userResult = await usersCollection.doc(userId).get()
        if (userResult.data.length === 0 || userResult.data[0].role !== 'creator') {
          return {
            success: false,
            error: '只有创建者才能修改家庭名称'
          }
        }

        // 更新家庭名称
        await familiesCollection.doc(familyId).update({
          name: newName
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
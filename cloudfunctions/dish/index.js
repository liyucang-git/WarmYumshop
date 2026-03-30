// 菜品管理云函数
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const dishesCollection = db.collection('dishes')
const storage = cloud.storage()

exports.main = async (event, context) => {
  try {
    const { action, data } = event
    
    switch (action) {
      case 'addDish': {
        const { name, categories, description, imageUrl, familyId } = data
        
        const newDish = {
          name,
          categories,
          description,
          imageUrl,
          familyId,
          createTime: new Date(),
          updateTime: new Date()
        }
        
        const addResult = await dishesCollection.add({ data: newDish })
        newDish._id = addResult._id
        
        return {
          success: true,
          data: newDish
        }
      }
      
      case 'getDishes': {
        const { familyId, category, searchQuery, sortBy } = data
        
        let query = dishesCollection.where({ familyId })
        
        // 分类筛选
        if (category && category !== 'all') {
          query = query.where({
            categories: db.command.includes(category)
          })
        }
        
        // 搜索筛选
        if (searchQuery) {
          query = query.where({
            name: db.command.regex({ regex: searchQuery, options: 'i' })
          })
        }
        
        // 排序
        if (sortBy === 'latest') {
          query = query.orderBy('createTime', 'desc')
        } else if (sortBy === 'oldest') {
          query = query.orderBy('createTime', 'asc')
        }
        
        const result = await query.get()
        
        return {
          success: true,
          data: result.data
        }
      }
      
      case 'getDishById': {
        const { dishId } = data
        
        const result = await dishesCollection.doc(dishId).get()
        if (!result.data) {
          return {
            success: false,
            error: '菜品不存在'
          }
        }
        
        return {
          success: true,
          data: result.data
        }
      }
      
      case 'updateDish': {
        const { dishId, name, categories, description, imageUrl } = data
        
        const updateData = {
          name,
          categories,
          description,
          updateTime: new Date()
        }
        
        if (imageUrl) {
          updateData.imageUrl = imageUrl
        }
        
        await dishesCollection.doc(dishId).update({ data: updateData })
        
        const updatedDish = await dishesCollection.doc(dishId).get()
        
        return {
          success: true,
          data: updatedDish.data
        }
      }
      
      case 'deleteDish': {
        const { dishId, imageUrl } = data
        
        // 删除菜品
        await dishesCollection.doc(dishId).remove()
        
        // 删除云存储中的图片
        if (imageUrl) {
          try {
            const fileId = imageUrl
            await storage.deleteFile({ fileList: [fileId] })
          } catch (error) {
            console.error('删除图片失败:', error)
            // 图片删除失败不影响菜品删除
          }
        }
        
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
    console.error('菜品管理失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}
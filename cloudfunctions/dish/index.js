// 菜品管理云函数
const cloud = require('wx-server-sdk')

// 使用显式的环境ID初始化
cloud.init({
  env: 'tangyuan-3gqjbda947233e77'
})

const db = cloud.database()
const dishesCollection = db.collection('dishes')

console.log('dish云函数初始化完成')

exports.main = async (event, context) => {
  console.log('dish云函数被调用:', event)
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

        console.log('getDishes 参数:', { familyId, category, searchQuery, sortBy })

        if (!familyId) {
          return {
            success: false,
            error: 'familyId 不能为空'
          }
        }

        let query = dishesCollection.where({ familyId })

        // 分类筛选
        if (category && category !== 'all' && category !== '') {
          query = query.where({
            categories: db.RegExp({
              regexp: category,
              options: 'i'
            })
          })
        }

        // 搜索筛选
        if (searchQuery && searchQuery.trim()) {
          query = query.where({
            name: db.RegExp({
              regexp: searchQuery,
              options: 'i'
            })
          })
        }

        // 排序
        if (sortBy === 'latest') {
          query = query.orderBy('createTime', 'desc')
        } else if (sortBy === 'oldest') {
          query = query.orderBy('createTime', 'asc')
        }

        console.log('开始查询数据库...')
        const result = await query.get()
        console.log('查询结果:', result)

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
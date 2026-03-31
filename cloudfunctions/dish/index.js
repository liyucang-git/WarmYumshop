// 菜品管理云函数
const tcb = require('@cloudbase/node-sdk')

// 初始化
const app = tcb.init({ env: 'tangyuan-3gqjbda947233e77' })
const db = app.database()
const dishesCollection = db.collection('dishes')

console.log('dish云函数初始化完成')

exports.main = async (event, context) => {
  console.time('dish-execution-time')
  console.log('dish云函数被调用:', JSON.stringify(event))
  
  try {
    const { action, data } = event
    
    if (!action) {
      console.error('缺少 action 参数')
      return {
        success: false,
        error: '缺少 action 参数'
      }
    }
    
    if (!data) {
      console.error('缺少 data 参数')
      return {
        success: false,
        error: '缺少 data 参数'
      }
    }
    
    console.log('执行操作:', action)
    
    switch (action) {
      case 'addDish': {
        const { name, categories, description, imageUrl, familyId } = data
        
        console.log('添加菜品参数:', { name, categories, description, imageUrl, familyId })
        
        if (!name || !familyId) {
          return {
            success: false,
            error: 'name 和 familyId 不能为空'
          }
        }
        
        const newDish = {
          name,
          categories: categories || [],
          description: description || '',
          imageUrl: imageUrl || '',
          familyId,
          createTime: new Date(),
          updateTime: new Date()
        }
        
        const addResult = await dishesCollection.add(newDish)
        newDish._id = addResult.id
        
        console.log('添加菜品成功:', newDish._id)
        
        return {
          success: true,
          data: newDish
        }
      }
      
      case 'getDishes': {
        const { familyId, category, searchQuery, sortBy } = data

        console.log('getDishes 参数:', { familyId, category, searchQuery, sortBy })

        if (!familyId) {
          console.error('familyId 不能为空')
          return {
            success: false,
            error: 'familyId 不能为空'
          }
        }

        try {
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
          console.log('查询结果数量:', result.data.length)
          
          // 确保categories字段是数组
          const processedData = result.data.map(dish => {
            if (!dish.categories || !Array.isArray(dish.categories)) {
              dish.categories = []
            }
            return dish
          })

          console.log('返回菜品列表，数量:', processedData.length)

          return {
            success: true,
            data: processedData
          }
        } catch (error) {
          console.error('查询数据库失败:', error)
          return {
            success: false,
            error: error.message
          }
        }
      }
      
      case 'getDishById': {
        const { dishId } = data
        
        console.log('获取菜品详情, dishId:', dishId)
        
        if (!dishId) {
          return {
            success: false,
            error: 'dishId 不能为空'
          }
        }
        
        try {
          const result = await dishesCollection.doc(dishId).get()
          if (!result.data || result.data.length === 0) {
            return {
              success: false,
              error: '菜品不存在'
            }
          }
          
          const dish = result.data[0]
          if (!dish.categories || !Array.isArray(dish.categories)) {
            dish.categories = []
          }
          
          console.log('获取菜品详情成功:', dish._id)
          
          return {
            success: true,
            data: dish
          }
        } catch (error) {
          console.error('获取菜品详情失败:', error)
          return {
            success: false,
            error: error.message
          }
        }
      }
      
      case 'updateDish': {
        const { dishId, name, categories, description, imageUrl } = data
        
        console.log('更新菜品参数:', { dishId, name, categories, imageUrl })
        
        if (!dishId || !name) {
          return {
            success: false,
            error: 'dishId 和 name 不能为空'
          }
        }
        
        const updateData = {
          name,
          categories: categories || [],
          description: description || '',
          updateTime: new Date()
        }
        
        if (imageUrl) {
          updateData.imageUrl = imageUrl
        }
        
        try {
          await dishesCollection.doc(dishId).update(updateData)
          
          const updatedDish = await dishesCollection.doc(dishId).get()
          
          console.log('更新菜品成功:', dishId)
          
          return {
            success: true,
            data: updatedDish.data[0]
          }
        } catch (error) {
          console.error('更新菜品失败:', error)
          return {
            success: false,
            error: error.message
          }
        }
      }
      
      case 'deleteDish': {
        const { dishId, imageUrl } = data
        
        console.log('删除菜品参数:', { dishId, imageUrl })
        
        if (!dishId) {
          return {
            success: false,
            error: 'dishId 不能为空'
          }
        }
        
        try {
          // 删除菜品
          await dishesCollection.doc(dishId).remove()
          
          console.log('删除菜品成功:', dishId)
          
          // 注意：CloudBase Node SDK 不支持直接删除文件，需要在控制台删除
          // 或者使用腾讯云 COS API 删除文件
          
          return {
            success: true
          }
        } catch (error) {
          console.error('删除菜品失败:', error)
          return {
            success: false,
            error: error.message
          }
        }
      }
      
      default:
        console.error('未知操作:', action)
        return {
          success: false,
          error: '未知操作'
        }
    }
  } catch (error) {
    console.error('云函数执行出错:', error)
    console.error('错误堆栈:', error.stack)
    return {
      success: false,
      error: error.message || '服务器错误'
    }
  } finally {
    console.timeEnd('dish-execution-time')
  }
}
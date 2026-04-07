// 生成小程序邀请二维码云函数
// 由于微信 API 需要小程序已发布，改用生成普通二维码图片
const cloud = require('wx-server-sdk')
const QRCode = require('qrcode')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { inviteCode } = event
  
  if (!inviteCode) {
    return { success: false, error: '邀请码不能为空' }
  }
  
  if (inviteCode.length > 64) {
    return { success: false, error: '邀请码过长' }
  }
  
  try {
    console.log('开始生成二维码，邀请码:', inviteCode)
    
    // 构造邀请链接（跳转到加入家庭页面）
    // 注意：小程序需要配置 URL Scheme 或在首页处理参数
    const inviteUrl = `warmyumshop://pages/join-family/join-family?inviteCode=${inviteCode}`
    
    // 生成二维码图片（base64）
    const qrCodeDataUrl = await QRCode.toDataURL(inviteUrl, {
      width: 280,
      margin: 2,
      color: {
        dark: '#FF6B35',  // 主题色
        light: '#FFFFFF'
      }
    })
    
    console.log('二维码生成成功')
    
    return {
      success: true,
      image: qrCodeDataUrl,
      inviteCode: inviteCode
    }
    
  } catch (error) {
    console.error('生成二维码失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

const tcb = require('@cloudbase/node-sdk')

/**
 * @param { prompt } event
 * @returns { image_url }
 */
exports.main = async (event, context) => {
    try {
        const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV })
        const ai = app.ai()
        
        // 安全获取环境变量
        const provider = process.env.PROVIDER || 'hunyuan-image'
        const imageModel = ai.createImageModel(provider)
        
        if (process.env.ENDPOINT_PATH) {
            imageModel.defaultGenerateImageSubUrl = process.env.ENDPOINT_PATH
        }

        if (!event || !event.prompt) {
            return {
                code: 'invalid_param',
                message: '缺少 prompt 参数'
            }
        }

        const { style, model = 'hunyuan-image', ...restEvent } = event


        const res = await imageModel.generateImage({
            model,
            ...(/hunyuan-image-v3.0/.test(model) ? {
                revise: { "value": false },
                enable_thinking: { "value": false }
            } : {}),
            ...restEvent,
        })


        const { data, error } = res

        if (error) {
            console.error('生成图片失败:', error)
            return { success: false, ...error }
        }

        const img = data?.[0] || {}
        const { url, ...rest } = img

        return {
            ...rest,
            imageUrl: url || '',
            success: true
        }
    } catch (e) {
        console.error('云函数执行出错:', e)
        return {
            success: false,
            code: 'request_error',
            message: e.message || '请求错误',
            stack: e.stack
        }
    }
}

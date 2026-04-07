const tcb = require('@cloudbase/node-sdk')
const https = require('https')
const http = require('http')

/**
 * 下载文件到本地Buffer
 */
function downloadImage(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http
        client.get(url, (res) => {
            if (res.statusCode === 302 || res.statusCode === 301) {
                // 处理重定向
                downloadImage(res.headers.location).then(resolve).catch(reject)
                return
            }
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () => resolve(Buffer.concat(chunks)))
            res.on('error', reject)
        }).on('error', reject)
    })
}

/**
 * 生成唯一文件名
 */
function generateFileName(prompt) {
    const timestamp = Date.now()
    const hash = prompt.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
    }, 0)
    return `ai_images/${Math.abs(hash)}_${timestamp}.png`
}

/**
 * @param { prompt } event
 * @returns { image_url }
 */
exports.main = async (event, context) => {
    try {
        const app = tcb.init({ env: tcb.SYMBOL_CURRENT_ENV })
        const ai = app.ai()
        
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

        console.log('开始生成图片, prompt:', event.prompt)

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
        let { url, ...rest } = img

        console.log('获取到图片URL:', url)

        // 如果是COS临时URL，下载并上传到云存储
        if (url && url.includes('cos.')) {
            try {
                console.log('开始下载图片...')
                const imageBuffer = await downloadImage(url)
                console.log('图片下载完成，大小:', imageBuffer.length)
                
                const fileName = generateFileName(event.prompt)
                const cloudPath = `dish-images/${fileName}`
                
                console.log('开始上传到云存储, path:', cloudPath)
                const uploadResult = await app.uploadFile({
                    cloudPath,
                    fileContent: imageBuffer
                })
                
                console.log('上传成功, fileID:', uploadResult.fileID)
                
                // 获取永久访问URL
                const getUrlResult = app.getTempFileURL({
                    fileList: [uploadResult.fileID]
                })
                
                const urlRes = await getUrlResult
                const permanentUrl = urlRes.fileList?.[0]?.tempFileURL || ''
                
                console.log('获取永久URL成功:', permanentUrl)
                
                return {
                    ...rest,
                    imageUrl: permanentUrl,
                    fileId: uploadResult.fileID,
                    success: true
                }
            } catch (uploadError) {
                console.error('图片上传失败:', uploadError)
                // 如果上传失败，返回原始URL
                return {
                    ...rest,
                    imageUrl: url || '',
                    success: true,
                    warning: '图片上传失败，使用临时URL'
                }
            }
        }

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

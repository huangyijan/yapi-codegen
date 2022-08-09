import { ApiNameRegex, illegalJsonRegex, quotaRegex } from './constants'


/** 将下划线和短横线命名的重命名为驼峰命名法 */
export const toHumpName = (str: string) => {
    return str.replace(ApiNameRegex, function (_keb, item) { return item.toUpperCase() })
}


/** hasOwnProperty太长了，写一个代理当简写 */
export const hasProperty = function (obj: object, key: string) {
    if (!obj) return false
    return Object.prototype.hasOwnProperty.call(obj, key)
}


/** 获取请求体（body）传输参数 */
export const getLegalJson = (reqBody: string) => {
    if (!reqBody|| reqBody.length<20) return ''
    const isIllegalJsonStr = illegalJsonRegex.test(reqBody) //判断后台返回的字符串是不是合法json字符串
    try {
        if (!isIllegalJsonStr) {
            return JSON.parse(reqBody)
        } else {
            const dealStr = reqBody.replace(illegalJsonRegex, '\n') // 删除注释
            const removeLestQuotaStr = dealStr.replace(quotaRegex, '}') // 删除多余的逗号
            return JSON.parse(removeLestQuotaStr)
        }
    } catch (error) {
        console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释, TODO
        return '' // 总有一些意外的情况没有考虑到，当字符创处理
    }

}

/** 获取通用请求头 */
export const getHeader = () => {
    const config = global.apiConfig
    const token = config.token
    const userId = config.userId
    const HeaderConfig = {
        Cookie: `_yapi_token=${token}; _yapi_uid=${userId}`,
        Accept: 'application/json, text/plain, */*'
    }
    return HeaderConfig
}


/** 如果在解析不出来interface类型的情况下返回any类型容错 */
export const getTypeName = (interfaceName: string, body: JsonSchema, typeString: string) => {
    if (!typeString) return 'any'
    return typeIsArray(body) ? `Array<${interfaceName}>` : interfaceName
}

/** 根绝数据判断类型是否为数组 */
const typeIsArray = (body: JsonSchema): boolean => {
    const outDataTypeIsArray = !!body?.items // 最外层的数据是否数组类型，下面的不合法的数据默认返回该类型
    const { dataParseName } = global.apiConfig
    if (!dataParseName) return outDataTypeIsArray
    if (body.items) body = body.items
    if (!body || !body.properties || !body.properties?.[dataParseName]) return outDataTypeIsArray
    return Object.prototype.hasOwnProperty.call(body.properties?.[dataParseName], 'items')
}
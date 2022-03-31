const LongPathNameRegex = /^\/\{{0,1}([a-zA-Z0-9-_]+)\}{0,1}\/.+/ // 长接口捕获路径名
const ShortPathNameRegex = /^\/([a-zA-Z0-9-_]+)/ // 短接口捕获路径名
const NameRegex = /[-|_]([a-zA-Z])/g // 重命名捕获替换字符串


const quotaRegex = /(,)\s*\n*.*\}/g // 匹配json字符串最后一个逗号
const illegalRegex = /(\/\/\s.*)\n/g // 非法json注释匹配


/** 将下划线和短横线命名的重命名为驼峰命名法 */
export const toHumpName = (str: string) => {
    return str.replace(NameRegex, function (_keb, item) { return item.toUpperCase() })
}
/** 捕获路径名作为API文件夹名称 */
export const getPathName = (path: string) => {
    let patchChunk: RegExpMatchArray | null = null
    if (LongPathNameRegex.test(path)) {
        patchChunk = path.match(LongPathNameRegex)
    } else {
        patchChunk = path.match(ShortPathNameRegex)
    }
    if (!patchChunk) return 'common' // 捕获不到就用common作为路径文件夹
    return toHumpName(patchChunk[1])
}
/** 获取对象里面times里面最大的键值 */
export const getMaxTimesObjectKeyName = (obj: TimesObject): string => {
    const times = Object.values(obj)
    const max = Math.max(...times)
    return Object.keys(obj).find(key => obj[key] === max) || 'common'
}

/** hasOwnProperty太长了，写一个代理当简写 */
export const hasProperty = function (obj: object, key: string) {
    return Object.prototype.hasOwnProperty.call(obj, key)
}


/** 数据结构处理后台嵌套的properties层 */
export const removeProperties = (data: { [key: string]: any }) => {
    if (hasProperty(data, 'properties')) {
        const description = data.description
        data = data['properties']
        if(description) data.__proto__.proDesc = description // 将外部的值储存在原型上
    }
    for (const item in data) {
        const type = getTypeByValue(data[item])
        if (type === 'object') data[item] = removeProperties(data[item])
    }
    return data
}


// 根据数据类型展示数据
export const showExampleStrByType = (value: unknown) => {
    const type = typeof value
    switch (type) {
    case 'object':
        return JSON.stringify(value)
    default:
        return value
    }
}

/** 后台类型转前端类型 */
export const transformType = (serviceType: string) => {
    switch (serviceType) {
    case 'integer':
        return 'number'
    case 'bool':
        return 'boolean'
    default:
        return serviceType
    }
}

/** 判断api数据里面的数据类型 */
export const getTypeByValue = (value: { constructor: ArrayConstructor }) => {
    const jsType = typeof value
    switch (jsType) {
    case 'object': // 引用类型都是object，需要处理不同引用类型
        return value.constructor === Array ? 'array' : 'object'
    default:
        return jsType
    }
}

/** 处理后台静态类型数据和错误状态的Api */
export const getCorrectType = (value: any) => {
    let type = getTypeByValue(value)
    if (type === 'object') {
        if (Object.prototype.hasOwnProperty.call(value, 'type')) {
            type = transformType(value.type)
        }
        if (Object.prototype.hasOwnProperty.call(value, 'ordinal')) {
            type = 'string' // yapi 文档自动生成问题，状态字段一般都是呈现出object，实际为string
        }
    }
    return type
}

/** 获取请求体（body）传输参数 */
export const getLegalJson = (reqBody: string) => {
    if (!reqBody) return ''
    const isIllegalJsonStr = illegalRegex.test(reqBody) //判断后台返回的字符串是不是合法json字符串
    try {
        if (!isIllegalJsonStr) {
            return JSON.parse(reqBody)
        } else {
            const dealStr = reqBody.replace(illegalRegex, '\n') // 删除注释
            const removeLestQuotaStr = dealStr.replace(quotaRegex, '}') // 删除多余的逗号
            return JSON.parse(removeLestQuotaStr)
        }
    } catch (error) {
        console.log('json序列化错误', error) // 正则如果没有考虑所有情况将会影响无法输出注释
    }

}

/** 处理子序列jsdoc类型 */
export const configJsdocType = (value: any) => {
    const type = getCorrectType(value)
    if (type === 'object') { // 真的要传object， TODO: 子Object 对象序列
    }
    return type
}


 export const getDescription = (value: { description?: string, proDesc?: string }) => {
    let description = ''

    //这里做了一个后台的枚举类型的处理，由于
    if (typeof value === 'object' && value.proDesc) description = value.proDesc

    if (hasProperty(value, 'description')) {
        description = value.description || ''
    }
    return description
}
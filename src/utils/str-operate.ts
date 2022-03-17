/* eslint-disable no-useless-escape */
const ApiNameRegex = /[\/|\-|_|{|}]+([a-zA-Z])/g // 獲取接口名稱
export const pathHasParamsRegex = /\/\{([a-zA-Z0-9]*)\}/g // 獲取接口参数名稱

/** 处理传Id的API请求参数 */
export const getAppendRequestParams = (path: string) => {
    let requestParams = ''
    path.replace(pathHasParamsRegex, (_, p1) => requestParams += `${p1}, `)
    requestParams = `(${requestParams}options)`
    return requestParams
}
/** 处理传Id的API请求URL */
export const getAppendPath = (path: string) => {
    return `\`${path.replace(pathHasParamsRegex, (_, p1) => `/$\{${p1}\}`)}\``
}
/** 接口名决策方案：如果有参数先去除参数，然后把接口path剩余数据转成驼峰命名，缺点：接口path如果太长，命名也会比较长 */
export const getApiName = (path: string) => {
    const dealNamePath = path.startsWith('/') ? path.substring(1) : path // TODO 首字母不处理驼峰，后面有如果正则方案可以更加优雅的处理 
    return dealNamePath.replace(pathHasParamsRegex, '').replace(ApiNameRegex, (_, item) => item.toUpperCase())
}

/**
 * 获取单个请求的请求名， 请求路径， 请求参数的字符串配置
 * @param path 需要处理的接口地址
 * @returns {Object} {请求名， 请求路径， 请求参数} string
 */
export const getOneApiConfig = (path: string): requestConfig => {
    const isHaveParams = pathHasParamsRegex.test(path) // 地址栏上是否有参数
    const requestPath = isHaveParams ? getAppendPath(path) : `'${path}'`
    const requestParams = isHaveParams ? getAppendRequestParams(path) : '(options)'
    const requestName = getApiName(path)
    return { requestName, requestPath, requestParams }
}
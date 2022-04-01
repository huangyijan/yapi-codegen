import { removeProperties, getDescription, configJsdocType, showExampleStrByType } from "../../../utils"

/** 处理请求体(data)的逻辑规则 */
export const getJsonToJsDocParams = (json: { properties: Properties }, requestName: string) => {
  let bodyStr = ''
  const properties = removeProperties(json)

  if (!Object.keys(properties).length) return '' // 空的对象不做处理，提高性能

  Object.entries(properties).forEach(([key, value]: any) => {

    const description = getDescription(value)
    const type = configJsdocType(value)
    bodyStr += `* @property {${type}} [${key}]  ${description}   example: ${showExampleStrByType(value.default) || '无'} \n   `
  })

  return (`/** 
   * @typedef ${requestName}
   ${bodyStr}*/\n`)
}
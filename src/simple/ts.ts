import { getOneApiConfigTs } from '../utils/str-operate'
/** 配置注释 */
const getNoteStringItem = (item: apiSimpleItem, config: ApiConfig) => {
    const { protocol, host } = config
    const { project_id } = item
    return `/**
   * @description ${item.title} 
   * @param {axiosConfig} options
   * @apiUpdateTime ${new Date(item.up_time * 1000).toLocaleDateString()}
   * @link ${protocol}//${host}/project/${project_id}/interface/api/${item._id}
   */`
}

/** 配置请求主方法 */
const getMainMethodItem = (item: apiSimpleItem, hasNoteData: boolean, project: ProjectConfig) => {

    const isGetMethod = item.method.toUpperCase() == 'GET' // TODO: get请求传params，post以及其他请求传data.希望后台不要搞骚操作。这里后面可以做的灵活一点
    const paramsName = isGetMethod ? 'params' : 'data'
    const { requestName, requestPath, requestParams } = getOneApiConfigTs(item.path, `${paramsName
    }: any`, hasNoteData, project)
    return `${requestName}: ${requestParams} => {
    const method = '${item.method}'
    return fetch(${requestPath}, { ${hasNoteData ? `${paramsName}, ` : ''}method, ...options })
  },`
}

export const handleTsFileString = (fileBufferStringChunk: Array<string>, item: apiSimpleItem, project: ProjectConfig, config: ApiConfig) => {
    /** 先配置注释再配置请求主方法 */
    fileBufferStringChunk.push(getNoteStringItem(item, config))
    fileBufferStringChunk.push(getMainMethodItem(item, true, project))
}

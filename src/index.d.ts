import {AxiosRequestConfig} from "axios"
import { Releases as ReleasesClass} from "./index"
import {Pattern as PatternInternal} from "fast-glob/out/types";
import {JSZipFileOptions} from "jszip";
export type ProjectName = string | number
export interface Config  {
    [key:string]:any
    token:string
    baseURL:string
    host:string
    projectName:ProjectName,
    zipOptions:JSZipFileOptions
    uploadAssetsFileBefore(data:Record<any,any>):Record<any,any>
    axiosBefore(data:Record<any,any>,config:Record<any,any>):Record<any,any>
    urlType:Record<any, AxiosRequestConfig>
}
export type GetApiPptions = {
    // 项目名称
    projectName:ProjectName
    // url变量
    urlData:Record<any, any>
    // 接口数据
    data:any
    // url参数
    params:any
    // 请求配置
    config:Partial<AxiosRequestConfig>
}
export type ReleasesImplements = {
    archive:any
    config:Config
    /**
     * 根据配置生成axiosApi入参
     * @param apiTypeName
     * @param options
     */
    getApi<T extends keyof UrlType>(apiTypeName:T, options?:Partial<GetApiPptions>):UrlType[T]

    getZipBuff(source:PatternInternal | PatternInternal[]):Promise<Buffer>
    uploadAssetsFile(zipDir:any, data:any, filename?:string):Promise<any>

    /**
     * 获取Releases列表
     */
    list():Promise<any[]>

    /**
     * 获取指定tag
     */
    getTag(tag_name:string):Promise<any>

    /**
     * 创建一个release
     * @param data
     */
    create(data:CreateOptopns):Promise<any>

    /**
     * 更新一个release
     * @param data
     */
    update(data:CreateOptopns):Promise<any>

    /**
     * 删除一个release
     * @param data
     */
    delete(data:CreateOptopns):Promise<any>
    uploadFile?():Promise<any>
}

export type UrlType = {
    [key in keyof ReleasesImplements]:AxiosRequestConfig
}

export type CreateOptopns = {
    id?:string
    name?:string
    tag_name?:string
    description?:string
    ref?:string
    milestones?:string[]
    assets?: {
        links:Array<{
            name:string
            url:string
        }>
    }
    released_at?:Date | string
    zipDir?:PatternInternal | PatternInternal[]
    filename?:string
}

export const Releases:typeof ReleasesClass

export default Releases

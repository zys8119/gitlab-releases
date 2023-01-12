import Axios, {AxiosRequestConfig} from "axios"
import {Config, UrlType, GetApiPptions, ReleasesImplements, CreateOptopns} from "./index.d"
import {template, merge, get} from "lodash"
import {resolve} from "path"
import {sync} from "fast-glob"
import {Pattern as PatternInternal} from "fast-glob/out/types";
import FormData from "form-data";
import dayjs from "dayjs";
const zip = require("node-native-zip");
export const urlType = {
    list: {
        method: 'get',
        url: '/projects/${id}/releases'
    },
    getTag: {
        method: 'get',
        url: '/projects/${id}/releases/${tag_name}'
    },
    create: {
        method: 'post',
        url: '/projects/${id}/releases'
    },
    update: {
        method: 'put',
        url: '/projects/${id}/releases/${tag_name}'
    },
    delete: {
        method: 'delete',
        url: '/projects/${id}/releases/${tag_name}'
    },
    uploadFile: {
        method: 'post',
        url: '/projects/${id}/uploads'
    },
} as UrlType

const axios = Axios.create({})

export class Releases implements ReleasesImplements {
    archive:any = {}
    constructor(config?: Partial<Config>) {
        this.config = merge(this.config, config)

        this.archive = new zip();
    }

    config = {
    } as Config

    getApi(apiTypeName: keyof UrlType, {
        projectName,
        urlData,
        data,
        params,
        config
    } = {} as Partial<GetApiPptions>) {
        const urlTypeConfig: AxiosRequestConfig = merge({}, urlType[apiTypeName])
        return merge({
            method: urlTypeConfig.method,
            baseURL: `${this.config.host}${this.config.baseURL}${template(urlTypeConfig.url || '')({
                id: encodeURIComponent(projectName || this.config.projectName),
                ...urlData,
            })}`,
            headers: {
                'PRIVATE-TOKEN': this.config.token
            },
            data: merge({}, urlTypeConfig.data, data),
            params: merge({}, urlTypeConfig.params, params),
        }, config)
    }

    async uploadAssetsFile(zipDir:any, data:any, filename?:string):Promise<any>{
        if(!zipDir){
            return data
        }
        const assetsFileName = `${filename || 'dist'}.zip`
        const file = await this.getZipBuff(zipDir)
        const form = new FormData();
        form.append('file', file, {
            filename:assetsFileName
        });
        const config = await this.getApi('uploadFile', {
            config:{
                headers:{
                    ...form.getHeaders()
                }
            }
        })
        config.data = form
        const {data:{markdown, url}} = await axios(config)
        const links = [{
            name: assetsFileName,
            url:`${this.config.host}/${this.config.projectName}${url}`
        }].concat(get(data, 'assets.links', []))
        return  {
            ...data,
            description:`${data.description}\n\n**Assets资源**：${markdown}\n\n**最新发布时间**：${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
            assets:{
                links
            }
        }
    }

    async getZipBuff(source:PatternInternal | PatternInternal[]):Promise<Buffer>{
        const files = sync(source, {cwd: process.cwd()}).map(e => ({name: e, path: resolve(process.cwd(), e)}))
        return await new Promise((r, j)=>{
            this.archive.addFiles(files, (err)=>{
                if (err) j(err);
                r(this.archive.toBuffer())
            })
        })
    }

    async list() {
        return (await axios(this.getApi('list'))).data
    }

    async getTag(tag_name: string) {
        return (await axios(this.getApi('getTag', {
            urlData: {
                tag_name
            }
        }))).data
    }

    async create({zipDir, filename, ...data}: CreateOptopns) {
        return (await axios(this.getApi('create', {
            data:await this.uploadAssetsFile(zipDir, data, filename)
        }))).data
    }

    async update({zipDir, filename, ...data}: CreateOptopns) {
        return (await axios(this.getApi('update', {
            data:await this.uploadAssetsFile(zipDir, data, filename),
            urlData:{
                tag_name:data.tag_name
            }
        }))).data
    }

    async delete(data: CreateOptopns) {
        return (await axios(this.getApi('delete', {
            data,
            urlData:{
                tag_name:data.tag_name
            }
        }))).data
    }
}

export default Releases

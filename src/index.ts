import Axios, {AxiosRequestConfig} from "axios"
import {Config, UrlType, GetApiPptions, ReleasesImplements, CreateOptopns} from "./index.d"
import {template, merge} from "lodash"
import {resolve} from "path"
import {writeFileSync} from "fs"
import {sync} from "fast-glob"
import {Pattern as PatternInternal} from "fast-glob/out/types";
import FormData from "form-data";
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
        token: "2dGoxoGhfNLcPzaSbr5e",
        host: 'https://gitlab.zhijiasoft.com',
        baseURL: '/api/v4',
        projectName: 'xuyi/testproject',
    }

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

    async create(data: CreateOptopns) {
        return (await axios(this.getApi('create', {
            data
        }))).data
    }

    async update({zipDir, ...data}: CreateOptopns) {
        const form = new FormData();
        form.append('file', (await this.getZipBuff('dist/*')).toString('binary'));
        axios(await this.getApi('uploadFile', {
            data: {
                file:form.getBuffer()
            },
            config:{
                headers:{
                    'Content-Type':"multipart/form-data;"
                }
            }
        })).then(res=>{
            console.log(111, res.data)
        }).catch(err=>{
            console.log(222,err.response.request.headers)
            console.log(222,err.response.request.data)
            console.log(222,err.response.data)
        })

        // return (await axios(this.getApi('update', {
        //     data,
        //     urlData:{
        //         tag_name:data.tag_name
        //     }
        // }))).data
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

const releasesObj = new Releases()

// releasesObj.list().then(res => {
//     console.log(res.find(e => e.name === 'New release'))
// })
//
// releasesObj.getTag('0.1.6').then(res => {
//     console.log(res)
// })

// releasesObj.create({
//     name: "release v0.1.7",
//     tag_name: "0.1.7",
//     description: "Super nice release",
//     // "milestones": ["v0.1.6"],
//     ref:'main',
//     assets: {"links": [{"name": "hoge", "url": "https://google.com"}]}
// }).then(res => {
//     console.log(res)
// })

releasesObj.update({
    "tag_name": "0.1.7",
    "description": `
        # asdasd
    `,
    zipDir:'dist/**',
    "assets": {"links": [{"name": "hoge", "url": "https://google.com"}]},
}).then(res => {
    console.log(res)
})

// releasesObj.delete({
//     "tag_name": "v0.1.7",
// }).then(res => {
//     console.log(res)
// })

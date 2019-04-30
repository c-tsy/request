import axios from 'axios';
const req = axios.create({ withCredentials: true })
const config = {
    host: ''
}
export class Request {
    name: string = "";
    host: string = "";
    /**
     * 请求对象，若需要使用WebSocket请求请替换成WebSocket对象
     */
    req: any = req;
    isRPC: boolean = false;
    constructor(name) {
        this.name = name;
    }
    useRPC(rpc: any) {
        if (rpc.request instanceof Function) {
            this.isRPC = true;
            this.req = {
                post: (url: string, data: any, opt: any = {}) => {
                    return this.req.request(url, data, Object.assign({ NeedReply: true, Timeout: 120000 }))
                }
            }
        } else {
            throw new Error('错误的请求对象')
        }
    }
    protected get_url(method: string) {
        return this.isRPC ? [this.name, method].join('/') : [this.host || config.host || window.location.host, this.name, method].join('/')
    }
    /**
     * Post请求
     * @param method 
     * @param data 
     */
    _post(method: string, data: any, opt: Object = {}) {
        return this.req.post(this.get_url(method), data, opt).then((v) => {
            if (v.data) {
                if (v.data.c == 200) {
                    return v.data.d;
                } else {
                    throw new Error('string' == typeof v.data.e ? v.data.e : (v.data.e.m || v.data.c))
                }
            } else {
                throw new Error(v.headers.state)
            }
        })
    }
}
export class Controller extends Request {
    pk: string = ""
    /**
     * 添加一个
     * @param data 
     */
    add(data: any) {
        return this._post('add', data);
    }
    /**
     * 批量添加
     * @param data 
     */
    adds(data: any) {
        return this._post('adds', data);
    }
    /**
     * 保存对象
     * @param ID 
     * @param data 
     */
    save(ID: number, data: any) {
        return this._post('save', { [this.pk]: ID, Params: data })
    }
    /**
     * 批量保存对象
     * @param ID 
     * @param data 
     */
    saveW(W: Object, data: any) {
        return this._post('saveW', { W, Params: data })
    }
    /**
     * 批量替换对象
     * @param ID 
     * @param data 
     */
    replaceW(W: Object, data: any) {
        return this._post('replaceW', { W, Data: data })
    }
    /**
     * 单个删除
     * @param ID 
     */
    del(ID: number) {
        return this._post('del', { [this.pk]: ID });
    }
    /**
     * 批量删除
     * @param W 
     */
    delW(W: Object) {
        return this._post('delW', { W })
    }
    /**
     * 发起获取单个对象请求
     * @param ID 
     */
    get(ID: number) {
        return this._post('get', { [this.pk]: ID })
    }
    /**
     * 发起搜索请求
     * @param W 
     * @param conf 
     */
    search(W: Object = {}, conf: { N: number, P: number, Keyword: string, Sort?: string } = { N: 10, P: 1, Keyword: '' }) {
        return this._post('search', {
            W,
            Keyword: conf.Keyword || "",
            N: conf.N || 10,
            P: conf.P || 1,
            Sort: conf.Sort || ''
        })
    }
}
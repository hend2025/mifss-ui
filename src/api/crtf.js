import request from './request'
import axios from 'axios'

// 获取认证记录列表
export const getCrtfList = (data) => {
    const { pageNum, pageSize, ...rest } = data
    return request({
        url: '/mifss/ipt/crtf/list',
        method: 'post',
        headers: {
            pageNum,
            pageSize
        },
        data: rest
    })
}

// 获取认证记录详情
export const getCrtfInfo = (id) => {
    return request({
        url: `/mifss/ipt/crtf/info/${id}`,
        method: 'get'
    })
}

// 上传照片到 OSS，返回 keyId
export const uploadCrtfPhoto = (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request({
        url: '/mifss/ipt/file/upload',
        method: 'post',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        data: formData
    })
}

// 人员认证接口
export const certify = (data) => {
    return request({
        url: '/mifss/ipt/crtf/certify',
        method: 'post',
        data
    })
}

import request from './request'

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

import request from './request'

// 获取系统参数列表
export const getSysParaList = (data) => {
  const { pageNum, pageSize, ...rest } = data
  return request({
    url: '/mifss/ipt/para/list',
    method: 'post',
    headers: {
      pageNum,
      pageSize
    },
    data: rest
  })
}

// 删除系统参数
export const deleteSysPara = (data) => {
  return request({
    url: '/mifss/ipt/para/delete',
    method: 'post',
    data
  })
}

// 人脸认证
export const authenticate = (data) => {
  return request({
    url: '/mifss/ipt/face/authenticate',
    method: 'post',
    data
  })
}

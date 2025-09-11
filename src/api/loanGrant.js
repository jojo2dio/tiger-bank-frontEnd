import request from '@/utils/request2'

/**
 * 创建放款记录
 * @param {Object} data - 放款记录信息
 * @returns {Promise}
 */
export function createGrantRecord(data) {
  return request({
    url: '/loan/grant',
    method: 'post',
    data
  })
}

/**
 * 根据ID查询放款记录
 * @param {number} id - 放款记录ID
 * @returns {Promise}
 */
export function getGrantRecordById(id) {
  return request({
    url: `/loan/grant/${id}`,
    method: 'get'
  })
}

/**
 * 根据贷款ID查询放款记录
 * @param {number} loanId - 贷款项目ID
 * @returns {Promise}
 */
export function getGrantRecordsByLoanId(loanId) {
  return request({
    url: `/loan/grant/loan/${loanId}`,
    method: 'get'
  })
}

/**
 * 根据企业ID查询放款记录
 * @param {number} customerId - 企业ID
 * @returns {Promise}
 */
export function getGrantRecordsByCustomerId(customerId) {
  return request({
    url: `/loan/grant/customer/${customerId}`,
    method: 'get'
  })
}

/**
 * 分页查询放款记录
 * @param {Object} params - 分页参数
 * @param {number} params.start - 起始索引
 * @param {number} params.limit - 每页条数
 * @returns {Promise}
 */
export function getGrantRecordsByPage(params) {
  return request({
    url: '/loan/grant/page',
    method: 'get',
    params
  })
}

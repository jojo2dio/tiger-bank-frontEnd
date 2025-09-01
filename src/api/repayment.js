import request from '@/utils/request2'

/**
 * 还款记录相关API
 */
const repaymentApi = {
  /**
   * 创建还款记录
   * @param {Object} data - 还款记录信息
   * @returns {Promise}
   */
  createRepayment: function(data) {
    return request({
      url: '/repayment',
      method: 'post',
      data: data
    })
  },

  /**
   * 根据ID查询还款记录
   * @param {Number} id - 还款记录ID
   * @returns {Promise}
   */
  getRepaymentById: function(id) {
    return request({
      url: `/repayment/${id}`,
      method: 'get'
    })
  },

  /**
   * 根据贷款ID查询还款记录
   * @param {Number} loanId - 贷款ID
   * @returns {Promise}
   */
  listByLoanId: function(loanId) {
    return request({
      url: `/repayment/loan/${loanId}`,
      method: 'get'
    })
  },

  /**
   * 根据企业ID查询还款记录
   * @param {Number} customerId - 企业ID
   * @returns {Promise}
   */
  listByCustomerId: function(customerId) {
    return request({
      url: `/repayment/customer/${customerId}`,
      method: 'get'
    })
  },

  /**
   * 查询所有还款记录
   * @returns {Promise}
   */
  listAll: function() {
    return request({
      url: '/repayment',
      method: 'get'
    })
  },

  /**
   * 分页查询还款记录
   * @param {Number} start - 起始位置
   * @param {Number} limit - 每页条数
   * @param {Object} params - 查询参数
   * @returns {Promise}
   */
  getRepaymentPage: function(start, limit, params) {
    return request({
      url: `/repayment/page`,
      method: 'get',
      params: {
        start: start,
        limit: limit,
        customerId: params.customerId || '',
        loanId: params.loanId || '',
        repaymentType: params.repaymentType || '',
        status: params.status || ''
      }
    })
  },

  /**
   * 查询贷款总还款金额
   * @param {Number} loanId - 贷款ID
   * @returns {Promise}
   */
  getTotalAmountByLoanId: function(loanId) {
    return request({
      url: `/repayment/total/amount/${loanId}`,
      method: 'get'
    })
  },

  /**
   * 查询贷款总还本金
   * @param {Number} loanId - 贷款ID
   * @returns {Promise}
   */
  getTotalPrincipalByLoanId: function(loanId) {
    return request({
      url: `/repayment/total/principal/${loanId}`,
      method: 'get'
    })
  }
}

export default repaymentApi

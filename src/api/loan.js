import request from '@/utils/request2'

/**
 * 贷款管理API
 */
const loanApi = {
  /**
   * 分页查询贷款
   * @param {number} start - 起始页
   * @param {number} limit - 每页条数
   * @param {object} params - 查询参数
   * @returns {Promise}
   */
  getLoanPage: (start, limit, params = {}) => {
    return request({
      url: '/loan/page',
      method: 'get',
      params: {
        start,
        limit,
        ...params
      }
    })
  },

  /**
   * 获取所有贷款
   * @returns {Promise}
   */
  getAllLoans: () => {
    return request({
      url: '/loan',
      method: 'get'
    })
  },

  /**
   * 根据ID获取贷款
   * @param {number} id - 贷款ID
   * @returns {Promise}
   */
  getLoanById: (id) => {
    return request({
      url: `/loan/${id}`,
      method: 'get'
    })
  },

  /**
   * 根据企业ID获取贷款
   * @param {number} customerId - 企业ID
   * @returns {Promise}
   */
  getLoansByCustomerId: (customerId) => {
    return request({
      url: `/loan/customer/${customerId}`,
      method: 'get'
    })
  },

  /**
   * 新增贷款
   * @param {object} loanDTO - 贷款信息
   * @returns {Promise}
   */
  addLoan: (loanDTO) => {
    return request({
      url: '/loan',
      method: 'post',
      data: loanDTO
    })
  },

  /**
   * 更新贷款
   * @param {object} loanDTO - 贷款信息
   * @returns {Promise}
   */
  updateLoan: (loanDTO) => {
    return request({
      url: '/loan',
      method: 'put',
      data: loanDTO
    })
  },

  /**
   * 删除贷款
   * @param {number} id - 贷款ID
   * @returns {Promise}
   */
  deleteLoan: (id) => {
    return request({
      url: `/loan/${id}`,
      method: 'delete'
    })
  },

  /**
   * 审批贷款
   * @param {object} approvalDTO - 审批信息
   * @returns {Promise}
   */
  approveLoan: (approvalDTO) => {
    return request({
      url: '/loan/approve',
      method: 'post',
      data: approvalDTO
    })
  }
}

export default loanApi

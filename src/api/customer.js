import request from '@/utils/request2'

/**
 * 客户管理相关API
 */
export default {
  /**
   * 分页查询客户
   * @param {Number} start 起始页
   * @param {Number} limit 每页条数
   * @param {Object} params 查询参数
   */
  getCustomerPage(start, limit, params) {
    return request({
      url: '/customer/page',
      method: 'get',
      params: {
        start,
        limit,
        ...params
      }
    })
  },

  /**
   * 查询所有客户
   */
  getAllCustomers() {
    return request({
      url: '/customer',
      method: 'get'
    })
  },

  /**
   * 根据ID查询客户
   * @param {Number} id 客户ID
   */
  getCustomerById(id) {
    return request({
      url: `/customer/${id}`,
      method: 'get'
    })
  },

  /**
   * 根据信用代码查询客户
   * @param {String} creditCode 统一社会信用代码
   */
  getCustomerByCreditCode(creditCode) {
    return request({
      url: `/customer/credit/${creditCode}`,
      method: 'get'
    })
  },

  /**
   * 新增客户
   * @param {Object} customerDTO 客户信息
   */
  addCustomer(customerDTO) {
    return request({
      url: '/customer',
      method: 'post',
      data: customerDTO
    })
  },

  /**
   * 更新客户
   * @param {Object} customerDTO 客户信息
   */
  updateCustomer(customerDTO) {
    return request({
      url: '/customer',
      method: 'put',
      data: customerDTO
    })
  },

  /**
   * 删除客户
   * @param {Number} id 客户ID
   */
  deleteCustomer(id) {
    return request({
      url: `/customer/${id}`,
      method: 'delete'
    })
  },

  queryCustomers(params) {
    return request({
      url: '/customer/queryParams',
      method: 'get',
      params
    })
  }
}

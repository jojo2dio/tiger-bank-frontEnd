import request from '@/utils/request2'

/**
 * 系统用户管理API
 * 完全适配后端接口设计
 */
const userApi = {
  /**
   * 添加用户
   * @param {Object} sysUser - 用户信息对象
   * @returns {Promise}
   */
  add: (sysUser) => {
    return request({
      url: '/sys/user/add',
      method: 'post',
      data: sysUser
    })
  },

  /**
   * 根据ID删除用户
   * @param {Number|String} id - 用户ID
   * @returns {Promise}
   */
  deleteById: (id) => {
    return request({
      url: `/sys/user/delete/${id}`,
      method: 'delete'
    })
  },

  /**
   * 更新用户信息
   * @param {Object} sysUser - 包含ID的用户信息对象
   * @returns {Promise}
   */
  update: (sysUser) => {
    return request({
      url: '/sys/user/update',
      method: 'put',
      data: sysUser
    })
  },

  /**
   * 根据ID获取用户详情
   * @param {Number|String} id - 用户ID
   * @returns {Promise}
   */
  getById: (id) => {
    return request({
      url: `/sys/user/get/${id}`,
      method: 'get'
    })
  },

  /**
   * 根据用户名获取用户
   * @param {String} username - 用户名
   * @returns {Promise}
   */
  getByUsername: (username) => {
    return request({
      url: `/sys/user/getByUsername/${username}`,
      method: 'get'
    })
  },

  /**
   * 获取所有用户列表
   * @returns {Promise}
   */
  getAllUsers: () => {
    return request({
      url: '/sys/user/list',
      method: 'get'
    })
  },

  /**
   * 分页获取用户列表
   * @param {Number} start - 起始索引（从0开始）
   * @param {Number} limit - 每页条数
   * @returns {Promise}
   */
  getUserPage: (start, limit) => {
    return request({
      url: '/sys/user/page',
      method: 'get',
      params: {
        start,
        limit
      }
    })
  }
}

export default userApi

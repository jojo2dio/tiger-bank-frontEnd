<template>
  <div class="app-container">
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-button
        type="primary"
        icon="el-icon-plus"
        @click="handleAdd"
      >
        新增用户
      </el-button>
    </div>

    <!-- 搜索区域 -->
    <el-form
      :inline="true"
      :model="queryParams"
      class="search-form"
      size="small"
    >
      <el-form-item label="用户名">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <i class="el-icon-search" /> 查询
        </el-button>
        <el-button @click="resetQuery">
          <i class="el-icon-refresh" /> 重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <el-table
      v-loading="loading"
      :data="userList"
      border
      stripe
      style="width: 100%;"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="用户ID" width="100" align="center" />
      <el-table-column prop="username" label="用户名" min-width="120" />
      <el-table-column prop="realName" label="真实姓名" min-width="120" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="180" />
      <el-table-column prop="role" label="角色" min-width="120" />
      <el-table-column
        prop="status"
        label="状态"
        width="100"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 1 ? 'success' : 'danger'"
          >
            {{ scope.row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column
        label="操作"
        width="180"
        fixed="right"
        align="center"
      >
        <template slot-scope="scope">
          <el-button size="mini" type="text" @click="handleView(scope.row)">查看</el-button>
          <el-button size="mini" type="text" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            size="mini"
            type="text"
            style="color: #F56C6C"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      :current-page="pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="total"
      layout="total, sizes, prev, pager, next, jumper"
      class="pagination"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="userForm"
        :model="form"
        :rules="formRules"
        label-width="120px"
        size="small"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :disabled="form.id !== undefined"
          />
        </el-form-item>

        <el-form-item
          label="密码"
          prop="password"
          :required="!form.id"
        >
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            type="password"
          />
          <div v-if="form.id" class="el-form__helper">不修改密码请留空</div>
        </el-form-item>

        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-input v-model="form.role" placeholder="请输入角色" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      title="用户详情"
      :visible.sync="detailVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-descriptions
        column="1"
        border
      >
        <el-descriptions-item label="用户ID">{{ detailForm.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ detailForm.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ detailForm.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailForm.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailForm.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ detailForm.role || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="detailForm.status !== undefined"
            :type="detailForm.status === 1 ? 'success' : 'danger'"
          >
            {{ detailForm.status === 1 ? '启用' : '禁用' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailForm.createTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ detailForm.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer">
        <el-button @click="detailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import userApi from '@/api/user2'

export default {
  name: 'SysUser',
  data() {
    return {
      // 表格数据
      userList: [],
      loading: false,
      total: 0, // 总条数
      pageNum: 1, // 当前页码（前端，从1开始）
      pageSize: 10, // 每页条数
      multipleSelection: [], // 表格选中项

      // 查询参数
      queryParams: {
        username: ''
      },

      // 弹窗状态
      dialogVisible: false,
      detailVisible: false,
      dialogTitle: '',

      // 表单数据
      form: {
        id: undefined,
        username: '',
        password: '',
        realName: '',
        phone: '',
        email: '',
        role: '',
        status: 1
      },

      // 详情数据
      detailForm: {},

      // 表单验证规则
      formRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
        ],
        password: [
          { min: 6, max: 32, message: '密码长度在6-32个字符之间', trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' }
        ],
        phone: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        role: [
          { required: true, message: '请输入角色', trigger: 'blur' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },

  created() {
    // 页面加载时获取数据
    this.fetchData()
  },

  methods: {
    /**
     * 同时获取分页数据和总条数
     */
    fetchData() {
      this.loading = true
      // 并行请求：获取分页数据和总条数
      Promise.all([
        this.getPageData(),
        this.getTotalCount()
      ]).then(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 获取分页数据
     */
    getPageData() {
      const start = (this.pageNum - 1) * this.pageSize
      return userApi.getUserPage(start, this.pageSize)
        .then(response => {
          if (response.success) {
            this.userList = response.data || []
          } else {
            this.$message.error(`获取用户列表失败: ${response.message || '未知错误'}`)
          }
        })
        .catch(error => {
          console.error('获取分页数据失败:', error)
          this.$message.error('获取用户列表失败')
        })
    },

    /**
     * 获取总条数（适配后端分页接口返回List的修改）
     */
    getTotalCount() {
      return userApi.getAllUsers()
        .then(response => {
          if (response.success) {
            this.total = response.data ? response.data.length : 0
          } else {
            this.$message.warning(`获取总条数失败: ${response.message || '使用默认值'}`)
            this.total = 0
          }
        })
        .catch(error => {
          console.error('获取总条数失败:', error)
          this.$message.warning('获取总条数失败，使用默认值')
          this.total = 0
        })
    },

    /**
     * 搜索
     */
    handleQuery() {
      this.pageNum = 1
      this.fetchData()
    },

    /**
     * 重置搜索
     */
    resetQuery() {
      this.queryParams = {
        username: ''
      }
      this.pageNum = 1
      this.fetchData()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(size) {
      this.pageSize = size
      this.pageNum = 1
      this.fetchData()
    },

    /**
     * 当前页改变
     */
    handleCurrentChange(page) {
      this.pageNum = page
      this.fetchData()
    },

    /**
     * 选择项改变
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    /**
     * 新增用户
     */
    handleAdd() {
      this.dialogTitle = '新增用户'
      this.form = {
        id: undefined,
        username: '',
        password: '',
        realName: '',
        phone: '',
        email: '',
        role: '',
        status: 1
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.userForm.resetFields()
      })
    },

    /**
     * 查看详情
     */
    handleView(row) {
      this.loading = true
      userApi.getUserById(row.id)
        .then(response => {
          if (response.success) {
            this.detailForm = response.data || {}
            this.detailVisible = true
          } else {
            this.$message.error(`获取详情失败: ${response.message}`)
          }
          this.loading = false
        })
        .catch(error => {
          console.error('获取详情失败:', error)
          this.$message.error('获取详情失败')
          this.loading = false
        })
    },

    /**
     * 编辑用户
     */
    handleEdit(row) {
      this.loading = true
      userApi.getUserById(row.id)
        .then(response => {
          if (response.success) {
            const user = response.data || {}
            this.form = {
              ...user,
              password: '' // 清空密码，不显示原密码
            }
            this.dialogTitle = '编辑用户'
            this.dialogVisible = true
          } else {
            this.$message.error(`获取用户数据失败: ${response.message}`)
          }
          this.loading = false
        })
        .catch(error => {
          console.error('获取用户数据失败:', error)
          this.$message.error('获取用户数据失败')
          this.loading = false
        })
    },

    /**
     * 删除用户
     */
    handleDelete(id) {
      this.$confirm('确定要删除该用户吗?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        userApi.deleteUser(id)
          .then(response => {
            if (response.success) {
              this.$message.success('删除成功')
              this.fetchData() // 重新加载数据
            } else {
              this.$message.error(`删除失败: ${response.message}`)
            }
            this.loading = false
          })
          .catch(error => {
            console.error('删除用户失败:', error)
            this.$message.error('删除失败')
            this.loading = false
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          this.loading = true
          // 处理表单数据：编辑时密码为空则不传递
          const formData = { ...this.form }
          if (formData.id && !formData.password) {
            delete formData.password
          }

          const apiMethod = formData.id ? userApi.updateUser : userApi.addUser

          apiMethod(formData)
            .then(response => {
              if (response.success) {
                this.$message.success(formData.id ? '更新成功' : '新增成功')
                this.dialogVisible = false
                this.fetchData() // 重新加载数据
              } else {
                this.$message.error(`${formData.id ? '更新' : '新增'}失败: ${response.message}`)
              }
              this.loading = false
            })
            .catch(error => {
              console.error(`${formData.id ? '更新' : '新增'}失败:`, error)
              this.$message.error(`${formData.id ? '更新' : '新增'}失败`)
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.toolbar {
  margin-bottom: 15px;
}

.search-form {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 15px;
  text-align: right;
}

.el-form__helper {
  color: #606266;
  font-size: 12px;
  margin-top: 5px;
}
</style>

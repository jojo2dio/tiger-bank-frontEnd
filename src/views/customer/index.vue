<template>
  <div class="app-container">
    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <el-button
        type="primary"
        icon="el-icon-plus"
        class="btn-add"
        @click="handleAdd"
      >
        新增客户
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-form
      :inline="true"
      :model="searchForm"
      class="search-form"
    >
      <el-form-item label="统一社会信用代码">
        <el-input
          v-model="searchForm.creditCode"
          placeholder="请输入信用代码"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="企业名称">
        <el-input
          v-model="searchForm.enterpriseName"
          placeholder="请输入企业名称"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSearch">
          <i class="el-icon-search" /> 搜索
        </el-button>
        <el-button @click="resetSearch">
          <i class="el-icon-refresh" /> 重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 客户列表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="客户ID" width="100" />
      <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
      <el-table-column prop="creditCode" label="统一社会信用代码" min-width="180" />
      <el-table-column prop="legalPerson" label="法定代表人" min-width="120" />
      <el-table-column prop="contactPhone" label="联系电话" min-width="120" />
      <el-table-column
        prop="status"
        label="状态"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 1 ? 'success' : 'danger'"
          >
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="createTime"
        label="创建时间"
        min-width="160"
      />
      <el-table-column label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleView(scope.row)"
          >
            查看
          </el-button>
          <el-button
            size="mini"
            type="text"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
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
      :current-page="pageInfo.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageInfo.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pageInfo.total"
      class="pagination"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 客户表单对话框（新增/编辑） -->
    <el-dialog
      :title="formTitle"
      :visible.sync="dialogFormVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="form"
        :rules="formRules"
        label-width="120px"
        class="form-container"
      >
        <el-form-item label="企业名称" prop="enterpriseName">
          <el-input
            v-model="form.enterpriseName"
            placeholder="请输入企业名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="统一社会信用代码" prop="creditCode">
          <el-input
            v-model="form.creditCode"
            placeholder="请输入统一社会信用代码"
            clearable
            :disabled="isEdit"
          />
        </el-form-item>

        <el-form-item label="注册地址" prop="registerAddress">
          <el-input
            v-model="form.registerAddress"
            placeholder="请输入注册地址"
            clearable
          />
        </el-form-item>

        <el-form-item label="注册资本(万元)" prop="registeredCapital">
          <el-input
            v-model="form.registeredCapital"
            placeholder="请输入注册资本"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="营业范围" prop="businessScope">
          <el-input
            v-model="form.businessScope"
            placeholder="请输入营业范围"
            type="textarea"
            rows="3"
          />
        </el-form-item>

        <el-form-item label="法定代表人" prop="legalPerson">
          <el-input
            v-model="form.legalPerson"
            placeholder="请输入法定代表人"
            clearable
          />
        </el-form-item>

        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="form.contactPhone"
            placeholder="请输入联系电话"
            clearable
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 客户详情对话框 -->
    <el-dialog
      title="客户详情"
      :visible.sync="dialogDetailVisible"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="客户ID">{{ detailData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.enterpriseName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ detailData.creditCode || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册地址">{{ detailData.registerAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本(万元)">{{ detailData.registeredCapital || '-' }}</el-descriptions-item>
        <el-descriptions-item label="营业范围">{{ detailData.businessScope || '-' }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ detailData.legalPerson || '-' }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailData.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="detailData.status !== undefined"
            :type="detailData.status === 1 ? 'success' : 'danger'"
          >
            {{ detailData.statusName || '-' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import customerApi from '@/api/customer'
// import { formatDate } from '@/utils/date'

export default {
  name: 'CustomerList',
  data() {
    return {
      // 表格数据
      tableData: [],
      loading: false,
      // 分页信息
      pageInfo: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },
      // 搜索表单
      searchForm: {
        creditCode: '',
        enterpriseName: ''
      },
      // 选中的行
      multipleSelection: [],
      // 表单对话框状态
      dialogFormVisible: false,
      dialogDetailVisible: false,
      formTitle: '新增客户',
      isEdit: false,
      // 表单数据
      form: {
        id: null,
        enterpriseName: '',
        creditCode: '',
        registerAddress: '',
        registeredCapital: null,
        businessScope: '',
        legalPerson: '',
        contactPhone: '',
        status: 1
      },
      // 详情数据
      detailData: {},
      // 表单验证规则
      formRules: {
        enterpriseName: [
          { required: true, message: '请输入企业名称', trigger: 'blur' },
          { max: 100, message: '企业名称不能超过100个字符', trigger: 'blur' }
        ],
        creditCode: [
          { required: true, message: '请输入统一社会信用代码', trigger: 'blur' },
          { pattern: /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/, message: '请输入正确的统一社会信用代码', trigger: 'blur' }
        ],
        legalPerson: [
          { required: true, message: '请输入法定代表人', trigger: 'blur' },
          { max: 50, message: '法定代表人不能超过50个字符', trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    /**
     * 获取客户列表数据
     */
    fetchData() {
      this.loading = true
      // 转换分页参数，后端是start(从0开始)，前端是pageNum(从1开始)
      const start = (this.pageInfo.pageNum - 1) * this.pageInfo.pageSize

      // 构建查询参数
      const params = {}
      if (this.searchForm.creditCode) params.creditCode = this.searchForm.creditCode
      if (this.searchForm.enterpriseName) params.enterpriseName = this.searchForm.enterpriseName

      customerApi.getCustomerPage(start, this.pageInfo.pageSize, params)
        .then(response => {
          const result = response
          if (result.success) {
            this.tableData = result.data || []
            // 假设后端返回total字段，实际项目中请根据后端接口调整
            this.pageInfo.total = result.total || 0
          } else {
            this.$message.error('获取数据失败: ' + (result.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取客户列表失败', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 搜索处理
     */
    handleSearch() {
      this.pageInfo.pageNum = 1
      this.fetchData()
    },

    /**
     * 重置搜索
     */
    resetSearch() {
      this.searchForm = {
        creditCode: '',
        enterpriseName: ''
      }
      this.pageInfo.pageNum = 1
      this.fetchData()
    },

    /**
     * 分页大小改变
     */
    handleSizeChange(size) {
      this.pageInfo.pageSize = size
      this.pageInfo.pageNum = 1
      this.fetchData()
    },

    /**
     * 当前页改变
     */
    handleCurrentChange(page) {
      this.pageInfo.pageNum = page
      this.fetchData()
    },

    /**
     * 选择项变化
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    /**
     * 新增客户
     */
    handleAdd() {
      this.formTitle = '新增客户'
      this.isEdit = false
      this.resetForm()
      this.dialogFormVisible = true
    },

    /**
     * 查看客户详情
     */
    handleView(row) {
      this.loading = true
      customerApi.getCustomerById(row.id)
        .then(response => {
          const result = response
          if (result.success) {
            this.detailData = result.data
            this.dialogDetailVisible = true
          } else {
            this.$message.error('获取详情失败: ' + (result.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取客户详情失败', error)
          this.$message.error('获取详情失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 编辑客户
     */
    handleEdit(row) {
      this.formTitle = '编辑客户'
      this.isEdit = true
      this.loading = true

      customerApi.getCustomerById(row.id)
        .then(response => {
          const result = response
          if (result.success) {
            this.form = { ...result.data }
            this.dialogFormVisible = true
          } else {
            this.$message.error('获取客户信息失败: ' + (result.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取客户信息失败', error)
          this.$message.error('获取客户信息失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 删除客户
     */
    handleDelete(id) {
      this.$confirm('确定要删除该客户吗？此操作不可撤销！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        customerApi.deleteCustomer(id)
          .then(response => {
            const result = response
            if (result.success) {
              this.$message.success('删除成功')
              this.fetchData()
            } else {
              this.$message.error('删除失败: ' + (result.message || '未知错误'))
            }
          })
          .catch(error => {
            console.error('删除客户失败', error)
            this.$message.error('删除失败，请稍后重试')
          })
          .finally(() => {
            this.loading = false
          })
      }).catch(() => {
        // 取消删除
        this.$message.info('已取消删除')
      })
    },

    /**
     * 重置表单
     */
    resetForm() {
      if (this.$refs.dataForm) {
        this.$refs.dataForm.resetFields()
      }
      this.form = {
        id: null,
        enterpriseName: '',
        creditCode: '',
        registerAddress: '',
        registeredCapital: null,
        businessScope: '',
        legalPerson: '',
        contactPhone: '',
        status: 1
      }
    },

    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.loading = true
          const formData = { ...this.form }

          // 区分新增和编辑
          const promise = this.isEdit
            ? customerApi.updateCustomer(formData)
            : customerApi.addCustomer(formData)

          promise.then(response => {
            const result = response
            if (result.success) {
              this.$message.success(this.isEdit ? '更新成功' : '新增成功')
              this.dialogFormVisible = false
              this.fetchData()
            } else {
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + ': ' + (result.message || '未知错误'))
            }
          })
            .catch(error => {
              console.error(this.isEdit ? '更新客户失败' : '新增客户失败', error)
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + '，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.search-form {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.form-container {
  margin-top: 16px;
}

.btn-add {
  margin-bottom: 8px;
}
</style>

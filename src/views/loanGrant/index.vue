<template>
  <div class="app-container">
    <!-- 页面标题和操作按钮（匹配参考的page-header样式） -->
    <div class="page-header">
      <el-button
        type="primary"
        icon="el-icon-plus"
        class="btn-add"
        @click="handleAdd"
      >
        新增放款记录
      </el-button>
    </div>

    <!-- 搜索表单（内联布局+背景色，匹配参考样式） -->
    <el-form
      :inline="true"
      :model="searchForm"
      class="search-form"
    >
      <el-form-item label="贷款项目ID">
        <el-input
          v-model="searchForm.loanId"
          placeholder="请输入贷款项目ID"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="企业ID">
        <el-input
          v-model="searchForm.customerId"
          placeholder="请输入企业ID"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="放款状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          style="width: 180px;"
        >
          <el-option label="失败" value="0" />
          <el-option label="成功" value="1" />
        </el-select>
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

    <!-- 放款记录列表（带stripe条纹+selection选择列，匹配参考表格样式） -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="放款记录ID" width="120" />
      <el-table-column prop="loanId" label="贷款项目ID" width="120" />
      <el-table-column prop="productName" label="贷款产品名称" min-width="150" />
      <el-table-column prop="customerId" label="企业ID" width="120" />
      <el-table-column prop="customerName" label="企业名称" min-width="180" />
      <el-table-column prop="grantAmount" label="放款金额(元)" min-width="130">
        <template slot-scope="scope">{{ formatCurrency(scope.row.grantAmount) }}</template>
      </el-table-column>
      <el-table-column prop="grantTime" label="放款时间" min-width="160" />
      <el-table-column prop="operatorName" label="操作人" min-width="120" />
      <el-table-column
        prop="status"
        label="状态"
        width="110"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getStatusType(scope.row.status)"
          >
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="220" fixed="right">
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
            :disabled="!canEdit(scope.row.status)"
            @click="handleEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            size="mini"
            type="text"
            style="color: #F56C6C"
            :disabled="!canDelete(scope.row.status)"
            @click="handleDelete(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（右对齐+匹配参考布局） -->
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

    <!-- 新增/编辑对话框（匹配参考表单样式） -->
    <el-dialog
      :title="formTitle"
      :visible.sync="dialogFormVisible"
      width="650px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="dataForm"
        :model="form"
        :rules="formRules"
        label-width="130px"
        class="form-container"
      >
        <el-form-item label="贷款项目ID" prop="loanId">
          <el-input
            v-model="form.loanId"
            placeholder="请输入贷款项目ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="企业ID" prop="customerId">
          <el-input
            v-model="form.customerId"
            placeholder="请输入企业ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="放款金额(元)" prop="grantAmount">
          <el-input
            v-model="form.grantAmount"
            placeholder="请输入放款金额"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="放款时间" prop="grantTime">
          <el-date-picker
            v-model="form.grantTime"
            type="datetime"
            placeholder="选择放款时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="form.remark"
            placeholder="请输入备注信息"
            type="textarea"
            rows="4"
            clearable
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="form.status" disabled>
            <el-option label="失败" value="0" />
            <el-option label="成功" value="1" />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 详情对话框（用el-descriptions，完全匹配参考详情样式） -->
    <el-dialog
      title="放款记录详情"
      :visible.sync="dialogDetailVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="放款记录ID">{{ detailData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款项目ID">{{ detailData.loanId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款产品名称">{{ detailData.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业ID">{{ detailData.customerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="放款金额(元)">{{ formatCurrency(detailData.grantAmount) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="放款时间">{{ detailData.grantTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人ID">{{ detailData.operatorId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人姓名">{{ detailData.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="detailData.status !== undefined"
            :type="getStatusType(detailData.status)"
          >
            {{ detailData.statusName || '-' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 引入放款记录API
import {
  createGrantRecord,
  getGrantRecordById,
  getGrantRecordsByPage,
  deleteGrantRecord, // 假设后端有删除接口，无则移除
  updateGrantRecord // 假设后端有更新接口，无则调整编辑逻辑
} from '@/api/loanGrant'

export default {
  name: 'LoanGrantIndex',
  data() {
    return {
      // 表格数据与加载状态（匹配参考命名）
      tableData: [],
      loading: false,
      // 分页信息（完全匹配参考的pageInfo结构）
      pageInfo: {
        pageNum: 1, // 当前页码（从1开始）
        pageSize: 10, // 每页条数
        total: 0 // 总记录数（后端返回）
      },
      // 搜索表单（新增状态筛选，匹配参考）
      searchForm: {
        loanId: '', // 贷款项目ID
        customerId: '', // 企业ID
        status: '' // 放款状态（0-失败，1-成功）
      },
      // 选中的行（用于批量操作，匹配参考）
      multipleSelection: [],
      // 表单对话框状态（匹配参考命名）
      dialogFormVisible: false,
      dialogDetailVisible: false,
      formTitle: '新增放款记录',
      isEdit: false,
      // 表单数据（对应LoanGrantDTO）
      form: {
        id: null,
        loanId: null,
        customerId: null,
        grantAmount: null,
        grantTime: '',
        remark: '',
        status: 1 // 默认成功
      },
      // 详情数据（对应LoanGrantVO）
      detailData: {},
      // 表单验证规则（匹配参考的验证逻辑）
      formRules: {
        loanId: [
          { required: true, message: '请输入贷款项目ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '贷款项目ID必须为数字', trigger: 'blur' }
        ],
        customerId: [
          { required: true, message: '请输入企业ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '企业ID必须为数字', trigger: 'blur' }
        ],
        grantAmount: [
          { required: true, message: '请输入放款金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '放款金额必须大于0', trigger: 'blur' }
        ],
        grantTime: [
          { required: true, message: '请选择放款时间', trigger: 'change' }
        ],
        remark: [
          { max: 500, message: '备注不能超过500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 页面初始化加载数据（匹配参考）
    this.fetchData()
  },
  methods: {
    /**
     * 获取放款记录列表（适配pageInfo分页，匹配参考逻辑）
     */
    fetchData() {
      this.loading = true
      // 计算后端需要的start（(页码-1)*每页条数）
      const start = (this.pageInfo.pageNum - 1) * this.pageInfo.pageSize

      // 构建查询参数（匹配参考的参数传递方式）
      const params = {
        start,
        limit: this.pageInfo.pageSize
      }
      if (this.searchForm.loanId) params.loanId = this.searchForm.loanId
      if (this.searchForm.customerId) params.customerId = this.searchForm.customerId
      if (this.searchForm.status !== '') params.status = this.searchForm.status

      // 调用分页API
      getGrantRecordsByPage(params)
        .then(response => {
          // 适配后端Result<T>结构（data.data为列表，data.total为总条数）
          if (response.success) {
            this.tableData = response.data || []
            this.pageInfo.total = response.data.total || 0 // 假设后端返回total
          } else {
            this.$message.error('获取数据失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取放款记录失败', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 搜索处理（匹配参考）
     */
    handleSearch() {
      this.pageInfo.pageNum = 1 // 重置为第一页
      this.fetchData()
    },

    /**
     * 重置搜索（匹配参考）
     */
    resetSearch() {
      this.searchForm = {
        loanId: '',
        customerId: '',
        status: ''
      }
      this.pageInfo.pageNum = 1
      this.fetchData()
    },

    /**
     * 分页大小改变（匹配参考）
     */
    handleSizeChange(size) {
      this.pageInfo.pageSize = size
      this.pageInfo.pageNum = 1
      this.fetchData()
    },

    /**
     * 当前页改变（匹配参考）
     */
    handleCurrentChange(page) {
      this.pageInfo.pageNum = page
      this.fetchData()
    },

    /**
     * 选择项变化（用于批量操作，匹配参考）
     */
    handleSelectionChange(val) {
      this.multipleSelection = val
    },

    /**
     * 新增放款记录（匹配参考）
     */
    handleAdd() {
      this.formTitle = '新增放款记录'
      this.isEdit = false
      this.resetForm()
      this.dialogFormVisible = true
    },

    /**
     * 查看详情（用el-descriptions，匹配参考）
     */
    handleView(row) {
      this.loading = true
      getGrantRecordById(row.id)
        .then(response => {
          if (response.success) {
            this.detailData = response.data || {}
            this.dialogDetailVisible = true
          } else {
            this.$message.error('获取详情失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取放款记录详情失败', error)
          this.$message.error('获取详情失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 编辑放款记录（匹配参考）
     */
    handleEdit(row) {
      this.formTitle = '编辑放款记录'
      this.isEdit = true
      this.loading = true

      getGrantRecordById(row.id)
        .then(response => {
          if (response.success) {
            this.form = { ...response.data }
            this.dialogFormVisible = true
          } else {
            this.$message.error('获取放款记录信息失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取放款记录信息失败', error)
          this.$message.error('获取信息失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 删除放款记录（匹配参考的删除逻辑）
     */
    handleDelete(id) {
      this.$confirm('确定要删除该放款记录吗？此操作不可撤销！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        deleteGrantRecord(id) // 假设后端有删除接口
          .then(response => {
            if (response.success) {
              this.$message.success('删除成功')
              this.fetchData() // 重新加载列表
            } else {
              this.$message.error('删除失败: ' + (response.message || '未知错误'))
            }
          })
          .catch(error => {
            console.error('删除放款记录失败', error)
            this.$message.error('删除失败，请稍后重试')
          })
          .finally(() => {
            this.loading = false
          })
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },

    /**
     * 重置表单（匹配参考）
     */
    resetForm() {
      if (this.$refs.dataForm) {
        this.$refs.dataForm.resetFields()
      }
      this.form = {
        id: null,
        loanId: null,
        customerId: null,
        grantAmount: null,
        grantTime: '',
        remark: '',
        status: 1
      }
    },

    /**
     * 提交表单（新增/编辑，匹配参考）
     */
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.loading = true
          const formData = { ...this.form }

          // 区分新增和编辑（适配后端接口）
          const promise = this.isEdit
            ? updateGrantRecord(formData) // 编辑：调用更新接口
            : createGrantRecord(formData) // 新增：调用创建接口

          promise.then(response => {
            if (response.success) {
              this.$message.success(this.isEdit ? '更新成功' : '新增成功')
              this.dialogFormVisible = false
              this.fetchData() // 重新加载列表
            } else {
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + ': ' + (response.message || '未知错误'))
            }
          })
            .catch(error => {
              console.error(this.isEdit ? '更新放款记录失败' : '新增放款记录失败', error)
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + '，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },

    /**
     * 格式化金额（保留2位小数，匹配参考）
     */
    formatCurrency(value) {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    },

    /**
     * 根据状态获取标签类型（匹配参考的状态颜色逻辑）
     */
    getStatusType(status) {
      switch (status) {
        case 0: return 'danger' // 失败→红色
        case 1: return 'success' // 成功→绿色
        default: return ''
      }
    },

    /**
     * 判断是否可以编辑（仅失败状态可编辑，可自定义）
     */
    canEdit(status) {
      return status === 0 // 示例：仅失败状态可编辑
    },

    /**
     * 判断是否可以删除（仅失败状态可删除，可自定义）
     */
    canDelete(status) {
      return status === 0 // 示例：仅失败状态可删除
    }
  }
}
</script>

<style scoped>
/* 完全匹配参考的CSS样式 */
.page-header {
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1d1414;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

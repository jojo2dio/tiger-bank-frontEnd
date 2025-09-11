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
        新增贷款
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-form
      :inline="true"
      :model="searchForm"
      class="search-form"
    >
      <el-form-item label="产品名称">
        <el-input
          v-model="searchForm.productName"
          placeholder="请输入产品名称"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="企业名称">
        <el-input
          v-model="searchForm.customerName"
          placeholder="请输入企业名称"
          clearable
          style="width: 200px;"
        />
      </el-form-item>

      <el-form-item label="贷款状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          style="width: 180px;"
        >
          <el-option label="待审批" value="0" />
          <el-option label="已放款" value="1" />
          <el-option label="已结清" value="2" />
          <el-option label="已逾期" value="3" />
          <el-option label="审批拒绝" value="4" />
          <el-option label="待放款" value="5" />
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

    <!-- 贷款列表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="贷款ID" width="100" />
      <el-table-column prop="productName" label="产品名称" min-width="150" />
      <el-table-column prop="customerName" label="企业名称" min-width="180" />
      <el-table-column prop="amount" label="贷款总金额(元)" min-width="130">
        <template slot-scope="scope">{{ formatCurrency(scope.row.amount) }}</template>
      </el-table-column>
      <el-table-column prop="remainingAmount" label="剩余未还(元)" min-width="130">
        <template slot-scope="scope">{{ formatCurrency(scope.row.remainingAmount) }}</template>
      </el-table-column>
      <el-table-column prop="interestRate" label="年利率(%)" min-width="110" />
      <el-table-column prop="term" label="期限(月)" width="90" />
      <el-table-column
        prop="status"
        label="状态"
        width="110"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getStatusType(scope.row.status)"
          >
            {{ getStatusName(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="160" />
      <el-table-column label="操作" width="240" fixed="right">
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
            style="color: #409EFF"
            :disabled="!canApprove(scope.row.status)"
            @click="handleApprove(scope.row)"
          >
            审批
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

    <!-- 贷款表单对话框（新增/编辑） -->
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
        <el-form-item label="产品名称" prop="productName">
          <el-input
            v-model="form.productName"
            placeholder="请输入产品名称"
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

        <el-form-item label="贷款总金额(元)" prop="amount">
          <el-input
            v-model="form.amount"
            placeholder="请输入贷款总金额"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="年利率(%)" prop="interestRate">
          <el-input
            v-model="form.interestRate"
            placeholder="请输入年利率"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="贷款期限(月)" prop="term">
          <el-input
            v-model="form.term"
            placeholder="请输入贷款期限"
            type="number"
            min="1"
            clearable
          />
        </el-form-item>

        <el-form-item label="放款日期" prop="grantDate">
          <el-date-picker
            v-model="form.grantDate"
            type="date"
            placeholder="选择放款日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="到期日期" prop="dueDate">
          <el-date-picker
            v-model="form.dueDate"
            type="date"
            placeholder="选择到期日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item v-if="isEdit" label="状态" prop="status">
          <el-select v-model="form.status" disabled>
            <el-option label="待审批" value="0" />
            <el-option label="已放款" value="1" />
            <el-option label="已结清" value="2" />
            <el-option label="已逾期" value="3" />
            <el-option label="审批拒绝" value="4" />
            <el-option label="待放款" value="5" />
          </el-select>
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 贷款详情对话框 -->
    <el-dialog
      title="贷款详情"
      :visible.sync="dialogDetailVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="贷款项目ID">{{ detailData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="产品名称">{{ detailData.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业ID">{{ detailData.customerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款总金额(元)">{{ formatCurrency(detailData.amount) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="剩余未还金额(元)">{{ formatCurrency(detailData.remainingAmount) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="年利率(%)">{{ detailData.interestRate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款期限(月)">{{ detailData.term || '-' }}</el-descriptions-item>
        <el-descriptions-item label="放款日期">{{ detailData.grantDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="到期日期">{{ detailData.dueDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="detailData.status !== undefined"
            :type="getStatusType(detailData.status)"
          >
            {{ detailData.statusName || getStatusName(detailData.status) }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="审批人">{{ detailData.approvalUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批时间">{{ detailData.approvalTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审批备注">{{ detailData.approvalRemark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{ detailData.createUserName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 贷款审批对话框 -->
    <el-dialog
      title="贷款审批"
      :visible.sync="dialogApproveVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="approvalFormRef"
        :model="approvalForm"
        :rules="approvalRules"
        label-width="100px"
        class="form-container"
      >
        <el-form-item label="贷款ID" prop="loanId">
          <el-input
            v-model="approvalForm.loanId"
            disabled
          />
        </el-form-item>

        <el-form-item label="审批结果" prop="approvalResult">
          <el-radio-group v-model="approvalForm.approvalResult">
            <el-radio :label="1">通过</el-radio>
            <el-radio :label="0">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="审批备注" prop="remark">
          <el-input
            v-model="approvalForm.remark"
            placeholder="请输入审批备注"
            type="textarea"
            rows="4"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogApproveVisible = false">取消</el-button>
        <el-button type="primary" @click="submitApproval">确定审批</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import loanApi from '@/api/loan'
// import { formatDate } from '@/utils/date'

export default {
  name: 'LoanList',
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
        productName: '',
        customerName: '',
        status: ''
      },
      // 选中的行
      multipleSelection: [],
      // 表单对话框状态
      dialogFormVisible: false,
      dialogDetailVisible: false,
      dialogApproveVisible: false,
      formTitle: '新增贷款',
      isEdit: false,
      // 表单数据
      form: {
        id: null,
        productName: '',
        customerId: '',
        customerName: '',
        amount: null,
        remainingAmount: null,
        interestRate: null,
        term: null,
        grantDate: '',
        dueDate: '',
        status: 0
      },
      // 审批表单
      approvalForm: {
        loanId: null,
        approvalResult: 1, // 1-通过，0-拒绝
        remark: ''
      },
      // 详情数据
      detailData: {},
      // 表单验证规则
      formRules: {
        productName: [
          { required: true, message: '请输入产品名称', trigger: 'blur' },
          { max: 100, message: '产品名称不能超过100个字符', trigger: 'blur' }
        ],
        customerId: [
          { required: true, message: '请输入企业ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '企业ID必须为数字', trigger: 'blur' }
        ],
        amount: [
          { required: true, message: '请输入贷款总金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '贷款金额必须大于0', trigger: 'blur' }
        ],
        interestRate: [
          { required: true, message: '请输入年利率', trigger: 'blur' },
          { type: 'number', min: 0.01, max: 100, message: '年利率必须在0.01-100之间', trigger: 'blur' }
        ],
        term: [
          { required: true, message: '请输入贷款期限', trigger: 'blur' },
          { type: 'number', min: 1, message: '贷款期限必须大于0', trigger: 'blur' }
        ],
        grantDate: [
          { required: true, message: '请选择放款日期', trigger: 'change' }
        ],
        dueDate: [
          { required: true, message: '请选择到期日期', trigger: 'change' }
        ]
      },
      // 审批表单验证规则
      approvalRules: {
        approvalResult: [
          { required: true, message: '请选择审批结果', trigger: 'change' }
        ],
        remark: [
          { required: true, message: '请输入审批备注', trigger: 'blur' },
          { max: 500, message: '审批备注不能超过500个字符', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    /**
     * 获取贷款列表数据
     */
    fetchData() {
      this.loading = true
      // 转换分页参数，后端是start(从0开始)，前端是pageNum(从1开始)
      const start = (this.pageInfo.pageNum - 1) * this.pageInfo.pageSize

      // 构建查询参数
      const params = {}
      if (this.searchForm.productName) params.productName = this.searchForm.productName
      if (this.searchForm.customerName) params.customerName = this.searchForm.customerName
      if (this.searchForm.status !== '') params.status = this.searchForm.status

      loanApi.getLoanPage(start, this.pageInfo.pageSize, params)
        .then(response => {
          // 注意：这里直接使用response，而不是response.data
          if (response.success) {
            this.tableData = response.data || []
            // 假设后端返回total字段，实际项目中请根据后端接口调整
            this.pageInfo.total = response.total || 0
          } else {
            this.$message.error('获取数据失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取贷款列表失败', error)
          this.$message.error('获取数据失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },
    getStatusName(status) {
      const statusMap = {
        0: '待审批',
        1: '已放款',
        2: '已结清',
        3: '已逾期',
        4: '审批拒绝',
        5: '待放款' // 新增待放款
      }
      return statusMap[status] || '未知状态'
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
        productName: '',
        customerName: '',
        status: ''
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
     * 新增贷款
     */
    handleAdd() {
      this.formTitle = '新增贷款'
      this.isEdit = false
      this.resetForm()
      this.dialogFormVisible = true
    },

    /**
     * 查看贷款详情
     */
    handleView(row) {
      this.loading = true
      loanApi.getLoanById(row.id)
        .then(response => {
          // 注意：这里直接使用response，而不是response.data
          if (response.success) {
            this.detailData = response.data
            this.dialogDetailVisible = true
          } else {
            this.$message.error('获取详情失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取贷款详情失败', error)
          this.$message.error('获取详情失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 编辑贷款
     */
    handleEdit(row) {
      this.formTitle = '编辑贷款'
      this.isEdit = true
      this.loading = true

      loanApi.getLoanById(row.id)
        .then(response => {
          // 注意：这里直接使用response，而不是response.data
          if (response.success) {
            this.form = { ...response.data }
            this.dialogFormVisible = true
          } else {
            this.$message.error('获取贷款信息失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取贷款信息失败', error)
          this.$message.error('获取贷款信息失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 删除贷款
     */
    handleDelete(id) {
      this.$confirm('确定要删除该贷款项目吗？此操作不可撤销！', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loading = true
        loanApi.deleteLoan(id)
          .then(response => {
            // 注意：这里直接使用response，而不是response.data
            if (response.success) {
              this.$message.success('删除成功')
              this.fetchData()
            } else {
              this.$message.error('删除失败: ' + (response.message || '未知错误'))
            }
          })
          .catch(error => {
            console.error('删除贷款失败', error)
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
     * 审批贷款
     */
    handleApprove(row) {
      this.approvalForm = {
        loanId: row.id,
        approvalResult: 1,
        remark: ''
      }
      this.dialogApproveVisible = true
    },

    /**
     * 提交审批
     */
    submitApproval() {
      this.$refs.approvalFormRef.validate(valid => {
        if (valid) {
          this.loading = true
          // 构建审批DTO
          const approvalDTO = {
            loanId: this.approvalForm.loanId,
            // 转换审批结果为状态值：1-通过→1(已放款)，0-拒绝→4(审批拒绝)
            status: this.approvalForm.approvalResult === 1 ? 5 : 4,
            remark: this.approvalForm.remark
          }

          loanApi.approveLoan(approvalDTO)
            .then(response => {
              // 注意：这里直接使用response，而不是response.data
              if (response.success) {
                this.$message.success('审批成功')
                this.dialogApproveVisible = false
                this.fetchData()
              } else {
                this.$message.error('审批失败: ' + (response.message || '未知错误'))
              }
            })
            .catch(error => {
              console.error('贷款审批失败', error)
              this.$message.error('审批失败，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
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
        productName: '',
        customerId: '',
        customerName: '',
        amount: null,
        remainingAmount: null,
        interestRate: null,
        term: null,
        grantDate: '',
        dueDate: '',
        status: 0
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
            ? loanApi.updateLoan(formData)
            : loanApi.addLoan(formData)

          promise.then(response => {
            // 注意：这里直接使用response，而不是response.data
            if (response.success) {
              this.$message.success(this.isEdit ? '更新成功' : '新增成功')
              this.dialogFormVisible = false
              this.fetchData()
            } else {
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + ': ' + (response.message || '未知错误'))
            }
          })
            .catch(error => {
              console.error(this.isEdit ? '更新贷款失败' : '新增贷款失败', error)
              this.$message.error((this.isEdit ? '更新失败' : '新增失败') + '，请稍后重试')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },

    /**
     * 格式化金额显示
     */
    formatCurrency(value) {
      if (!value) return '0.00'
      return parseFloat(value).toFixed(2)
    },

    /**
     * 根据状态获取标签类型
     */
    getStatusType(status) {
      switch (status) {
        case 0: return 'warning' // 待审批
        case 1: return 'success' // 已放款
        case 2: return 'primary' // 已结清
        case 3: return 'danger' // 已逾期
        case 4: return 'info' // 审批拒绝
        case 5: return 'warning' // 审批拒绝
        default: return ''
      }
    },

    /**
     * 判断是否可以编辑
     */
    canEdit(status) {
      // 仅待审批状态可编辑
      return status === 0
    },

    /**
     * 判断是否可以删除
     */
    canDelete(status) {
      // 仅待审批状态可删除
      return status === 0
    },

    /**
     * 判断是否可以审批
     */
    canApprove(status) {
      // 仅待审批状态可审批
      return status === 0
    }
  }
}
</script>

<style scoped>
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
</style>

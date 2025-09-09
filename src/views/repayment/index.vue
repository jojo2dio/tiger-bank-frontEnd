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
        新增还款记录
      </el-button>
    </div>

    <!-- 搜索表单 -->
    <el-form
      :inline="true"
      :model="searchForm"
      class="search-form"
    >
      <el-form-item label="企业ID">
        <el-input
          v-model="searchForm.customerId"
          placeholder="请输入企业ID"
          clearable
          style="width: 180px;"
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

      <el-form-item label="贷款ID">
        <el-input
          v-model="searchForm.loanId"
          placeholder="请输入贷款ID"
          clearable
          style="width: 180px;"
        />
      </el-form-item>

      <el-form-item label="还款类型">
        <el-select
          v-model="searchForm.repaymentType"
          placeholder="请选择还款类型"
          clearable
          style="width: 180px;"
        >
          <el-option label="正常还款" value="1" />
          <el-option label="提前还款" value="2" />
          <el-option label="逾期还款" value="3" />
        </el-select>
      </el-form-item>

      <el-form-item label="状态">
        <el-select
          v-model="searchForm.status"
          placeholder="请选择状态"
          clearable
          style="width: 150px;"
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

    <!-- 还款记录列表 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      element-loading-text="加载中..."
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="还款ID" width="100" />
      <!-- <el-table-column prop="customerId" label="企业ID" width="100" /> -->
      <el-table-column prop="customerName" label="企业名称" min-width="180" />
      <!-- <el-table-column prop="loanId" label="贷款ID" width="100" /> -->
      <el-table-column prop="productName" label="产品名称" min-width="150" />
      <el-table-column prop="repaymentAmount" label="还款总金额(元)" min-width="130">
        <template slot-scope="scope">{{ formatCurrency(scope.row.repaymentAmount) }}</template>
      </el-table-column>
      <el-table-column prop="principal" label="本金(元)" min-width="110">
        <template slot-scope="scope">{{ formatCurrency(scope.row.principal) }}</template>
      </el-table-column>
      <el-table-column prop="interest" label="利息(元)" min-width="110">
        <template slot-scope="scope">{{ formatCurrency(scope.row.interest) }}</template>
      </el-table-column>
      <el-table-column
        prop="repaymentType"
        label="还款类型"
        width="120"
      >
        <template slot-scope="scope">
          <el-tag
            :type="getTypeTagType(scope.row.repaymentType)"
          >
            {{ getRepaymentTypeName(scope.row.repaymentType) }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- <el-table-column
        prop="status"
        label="状态"
        width="100"
      >
        <template slot-scope="scope">
          <el-tag
            :type="scope.row.status === 1 ? 'success' : 'danger'"
          >
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column> -->
      <el-table-column prop="repaymentTime" label="还款时间" min-width="160" />
      <el-table-column prop="operatorName" label="操作人" min-width="120" />
      <el-table-column label="操作" width="120" fixed="right">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            @click="handleView(scope.row)"
          >
            查看
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

    <!-- 还款表单对话框 -->
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
        label-width="130px"
        class="form-container"
      >
        <el-form-item label="企业ID" prop="customerId">
          <el-input
            v-model="form.customerId"
            placeholder="请输入企业ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="贷款ID" prop="loanId">
          <el-input
            v-model="form.loanId"
            placeholder="请输入贷款ID"
            clearable
            @blur="fetchLoanTotalInfo"
          />
        </el-form-item>

        <el-form-item label="贷款总还款金额(元)">
          <el-input
            v-model.number="loanTotalAmount"
            disabled
          />
        </el-form-item>

        <el-form-item label="贷款总还本金(元)">
          <el-input
            v-model.number="loanTotalPrincipal"
            disabled
          />
        </el-form-item>

        <el-form-item label="本次还款总金额(元)" prop="repaymentAmount">
          <el-input
            v-model.number="form.repaymentAmount"
            placeholder="请输入还款总金额"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="本次还本金(元)" prop="principal">
          <el-input
            v-model.number="form.principal"
            placeholder="请输入还本金"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="本次还利息(元)" prop="interest">
          <el-input
            v-model.number="form.interest"
            placeholder="请输入还利息"
            type="number"
            step="0.01"
            clearable
          />
        </el-form-item>

        <el-form-item label="还款类型" prop="repaymentType">
          <el-radio-group v-model="form.repaymentType">
            <el-radio :label="1">正常还款</el-radio>
            <el-radio :label="2">提前还款</el-radio>
            <el-radio :label="3">逾期还款</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="还款时间" prop="repaymentTime">
          <el-date-picker
            v-model="form.repaymentTime"
            type="datetime"
            placeholder="选择还款时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="还款备注" prop="remark">
          <el-input
            v-model="form.remark"
            placeholder="请输入还款备注"
            type="textarea"
            rows="3"
          />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 还款详情对话框 -->
    <el-dialog
      title="还款详情"
      :visible.sync="dialogDetailVisible"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-descriptions column="1" border>
        <el-descriptions-item label="还款记录ID">{{ detailData.id || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业ID">{{ detailData.customerId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailData.customerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款项目ID">{{ detailData.loanId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="贷款产品名称">{{ detailData.productName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="还款总金额(元)">{{ formatCurrency(detailData.repaymentAmount) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="本金(元)">{{ formatCurrency(detailData.principal) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="利息(元)">{{ formatCurrency(detailData.interest) || '-' }}</el-descriptions-item>
        <el-descriptions-item label="还款类型">
          <el-tag
            v-if="detailData.repaymentType !== undefined"
            :type="getTypeTagType(detailData.repaymentType)"
          >
            {{ detailData.repaymentTypeName || '-' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="还款时间">{{ detailData.repaymentTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailData.operatorName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag
            v-if="detailData.status !== undefined"
            :type="detailData.status === 1 ? 'success' : 'danger'"
          >
            {{ detailData.statusName || '-' }}
          </el-tag>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="还款备注">{{ detailData.remark || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ detailData.createTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogDetailVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import repaymentApi from '@/api/repayment'

export default {
  name: 'RepaymentList',
  data() {
    return {
      repaymentTypeMap: [
        { value: 1, label: '正常还款', tagType: 'success' },
        { value: 2, label: '提前还款', tagType: 'primary' },
        { value: 3, label: '逾期还款', tagType: 'warning' }
      ],
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
        customerId: '',
        customerName: '',
        loanId: '',
        repaymentType: '',
        status: ''
      },
      // 选中的行
      multipleSelection: [],
      // 表单对话框状态
      dialogFormVisible: false,
      dialogDetailVisible: false,
      formTitle: '新增还款记录',
      // 表单数据
      form: {
        id: null,
        customerId: '',
        loanId: '',
        repaymentAmount: null,
        principal: null,
        interest: null,
        repaymentType: 1,
        repaymentTime: '',
        remark: ''
      },
      // 贷款总额信息
      loanTotalAmount: '',
      loanTotalPrincipal: '',
      // 详情数据
      detailData: {},
      // 表单验证规则
      formRules: {
        customerId: [
          { required: true, message: '请输入企业ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '企业ID必须为数字', trigger: 'blur' }
        ],
        loanId: [
          { required: true, message: '请输入贷款ID', trigger: 'blur' },
          { pattern: /^\d+$/, message: '贷款ID必须为数字', trigger: 'blur' }
        ],
        repaymentAmount: [
          { required: true, message: '请输入还款总金额', trigger: 'blur' },
          { type: 'number', min: 0.01, message: '还款金额必须大于0', trigger: 'blur' }
        ],
        principal: [
          { required: true, message: '请输入还本金', trigger: 'blur' },
          { type: 'number', min: 0, message: '本金不能为负数', trigger: 'blur' }
        ],
        interest: [
          { required: true, message: '请输入还利息', trigger: 'blur' },
          { type: 'number', min: 0, message: '利息不能为负数', trigger: 'blur' }
        ],
        repaymentType: [
          { required: true, message: '请选择还款类型', trigger: 'change' }
        ],
        repaymentTime: [
          { required: true, message: '请选择还款时间', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 新增：将数字转换为对应文字
    getRepaymentTypeName(type) {
      const item = this.repaymentTypeMap.find(item => item.value === type)
      return item ? item.label : '未知类型'
    },

    // 优化：使用统一映射获取标签类型
    getTypeTagType(type) {
      const item = this.repaymentTypeMap.find(item => item.value === type)
      return item ? item.tagType : ''
    },
    /**
     * 获取还款记录列表数据（使用分页查询）
     */
    fetchData() {
      this.loading = true

      // 转换分页参数，后端是start(从0开始)，前端是pageNum(从1开始)
      const start = (this.pageInfo.pageNum - 1) * this.pageInfo.pageSize

      // 构建查询参数
      const params = {
        customerId: this.searchForm.customerId || '',
        loanId: this.searchForm.loanId || '',
        repaymentType: this.searchForm.repaymentType || '',
        status: this.searchForm.status || ''
      }

      repaymentApi.getRepaymentPage(start, this.pageInfo.pageSize, params)
        .then(response => {
          // 直接使用response，不使用response.data
          if (response.success) {
            this.tableData = response.data || []
            // 假设后端返回total字段，实际项目中请根据后端接口调整
            this.pageInfo.total = response.total || 0
          } else {
            this.$message.error('获取数据失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取还款记录列表失败', error)
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
        customerId: '',
        customerName: '',
        loanId: '',
        repaymentType: '',
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
     * 新增还款记录
     */
    handleAdd() {
      this.formTitle = '新增还款记录'
      this.resetForm()
      this.loanTotalAmount = ''
      this.loanTotalPrincipal = ''
      this.dialogFormVisible = true
    },

    /**
     * 查看还款详情
     */
    handleView(row) {
      this.loading = true
      repaymentApi.getRepaymentById(row.id)
        .then(response => {
          // 直接使用response
          if (response.success) {
            this.detailData = response.data
            this.dialogDetailVisible = true
          } else {
            this.$message.error('获取详情失败: ' + (response.message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取还款详情失败', error)
          this.$message.error('获取详情失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
        })
    },

    /**
     * 获取贷款总额信息
     */
    fetchLoanTotalInfo() {
      if (!this.form.loanId) return

      this.loading = true

      // 并行请求总还款金额和总还本金
      Promise.all([
        repaymentApi.getTotalAmountByLoanId(this.form.loanId),
        repaymentApi.getTotalPrincipalByLoanId(this.form.loanId)
      ])
        .then(responses => {
        // 处理总还款金额响应
          if (responses[0].success) {
            this.loanTotalAmount = this.formatCurrency(responses[0].data)
          } else {
            this.$message.warning('获取总还款金额失败: ' + (responses[0].message || '未知错误'))
          }

          // 处理总还本金响应
          if (responses[1].success) {
            this.loanTotalPrincipal = this.formatCurrency(responses[1].data)
          } else {
            this.$message.warning('获取总还本金失败: ' + (responses[1].message || '未知错误'))
          }
        })
        .catch(error => {
          console.error('获取贷款总额信息失败', error)
          this.$message.error('获取贷款总额信息失败，请稍后重试')
        })
        .finally(() => {
          this.loading = false
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
        customerId: '',
        loanId: '',
        repaymentAmount: null,
        principal: null,
        interest: null,
        repaymentType: 1,
        repaymentTime: '',
        remark: ''
      }
    },

    /**
     * 提交表单
     */
    submitForm() {
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          // 验证还款金额是否等于本金加利息
          const total = parseFloat(this.form.principal || 0) + parseFloat(this.form.interest || 0)
          if (Math.abs(parseFloat(this.form.repaymentAmount) - total) > 0.01) {
            this.$message.error('还款总金额必须等于本金加利息')
            return
          }

          this.loading = true
          const formData = { ...this.form }

          repaymentApi.createRepayment(formData)
            .then(response => {
              // 直接使用response
              if (response.success) {
                this.$message.success('还款记录创建成功')
                this.dialogFormVisible = false
                this.fetchData()
              } else {
                this.$message.error('创建失败: ' + (response.message || '未知错误'))
              }
            })
            .catch(error => {
              console.error('创建还款记录失败', error)
              this.$message.error('创建失败，请稍后重试')
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
     * 根据还款类型获取标签类型
     */
    getTypeTagType(type) {
      switch (type) {
        case 1: return 'success' // 正常还款
        case 2: return 'primary' // 提前还款
        case 3: return 'warning' // 逾期还款
        default: return ''
      }
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

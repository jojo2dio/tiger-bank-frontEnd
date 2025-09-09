<template>
  <div class="dashboard-container">
    <!-- 页面标题和欢迎信息 -->
    <div class="page-header">
      <h2>控制台</h2>
      <p class="welcome-text">欢迎回来，{{ name }}！今天是 {{ today }}</p>
    </div>

    <!-- 统计卡片区域 -->
    <div class="stats-card-container">
      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-item">
          <div class="stat-info">
            <p class="stat-label">总客户数</p>
            <h3 class="stat-value">{{ totalCustomers }}</h3>
            <!-- <p class="stat-change positive">
              <i class="el-icon-arrow-up" /> 12.5%
            </p> -->
          </div>
          <div class="stat-icon bg-primary">
            <i class="el-icon-user" />
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-item">
          <div class="stat-info">
            <p class="stat-label">今日新增</p>
            <h3 class="stat-value">{{ todayNew }}</h3>
            <!-- <p class="stat-change positive">
              <i class="el-icon-arrow-up" /> 8.2%
            </p> -->
          </div>
          <div class="stat-icon bg-success">
            <i class="el-icon-plus" />
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-item">
          <div class="stat-info">
            <p class="stat-label">活跃客户</p>
            <h3 class="stat-value">{{ activeCustomers }}</h3>
            <!-- <p class="stat-change negative">
              <i class="el-icon-arrow-down" /> 2.1%
            </p> -->
          </div>
          <div class="stat-icon bg-warning">
            <i class="el-icon-refresh" />
          </div>
        </div>
      </el-card>

      <el-card class="stat-card" :body-style="{ padding: '15px' }">
        <div class="stat-item">
          <div class="stat-info">
            <p class="stat-label">禁用客户</p>
            <h3 class="stat-value">{{ disabledCustomers }}</h3>
            <!-- <p class="stat-change positive">
              <i class="el-icon-arrow-up" /> 3.7%
            </p> -->
          </div>
          <div class="stat-icon bg-danger">
            <i class="el-icon-lock" />
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表和数据区域 -->
    <div class="charts-container">
      <el-card class="chart-card">
        <div slot="header">
          <h3>客户增长趋势</h3>
        </div>
        <div class="chart-wrapper">
          <canvas id="growthChart" width="400" height="200" />
        </div>
      </el-card>

      <el-card class="chart-card">
        <div slot="header">
          <h3>最近新增客户</h3>
        </div>
        <el-table
          :data="recentCustomers"
          border
          style="width: 100%"
          size="small"
        >
          <el-table-column
            prop="enterpriseName"
            label="企业名称"
            width="200"
          />
          <el-table-column
            prop="creditCode"
            label="信用代码"
            width="180"
          />
          <el-table-column
            prop="createTime"
            label="创建时间"
          />
          <el-table-column
            prop="statusName"
            label="状态"
            width="80"
          />
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Chart from 'chart.js'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ]),
    today() {
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
      return new Date().toLocaleDateString('zh-CN', options)
    }
  },
  data() {
    return {
      // 统计数据
      totalCustomers: 6,
      todayNew: 0,
      activeCustomers: 5,
      disabledCustomers: 1,

      // 最近客户数据
      recentCustomers: [
        {
          enterpriseName: '111',
          creditCode: '91310000MA1FL72A0J',
          createTime: '2023-10-15 09:23:45',
          statusName: '正常'
        }
      ],

      // 图表实例
      growthChart: null
    }
  },
  mounted() {
    this.initGrowthChart()
    // 实际项目中这里会调用API获取数据
    this.fetchDashboardData()
  },
  beforeDestroy() {
    // 销毁图表实例，释放资源
    if (this.growthChart) {
      this.growthChart.destroy()
    }
  },
  methods: {
    // 初始化增长趋势图表
    initGrowthChart() {
      const ctx = document.getElementById('growthChart').getContext('2d')
      this.growthChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [{
            label: '客户数量',
            data: [12, 19, 13, 15, 20, 25],
            backgroundColor: 'rgba(64, 158, 255, 0.1)',
            borderColor: 'rgba(64, 158, 255, 1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      })
    },

    // 获取仪表盘数据
    fetchDashboardData() {
      // 实际项目中这里会调用API
      // 示例：
      // this.api.getDashboardData().then(res => {
      //   this.totalCustomers = res.totalCustomers
      //   // ...其他数据赋值
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 20px;

  h2 {
    font-size: 24px;
    color: #1f2d3d;
    margin-bottom: 8px;
  }

  .welcome-text {
    color: #4e5969;
    font-size: 14px;
  }
}

.stats-card-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-info {
  flex: 1;
}

.stat-label {
  color: #86909c;
  font-size: 14px;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1f2d3d;
  margin: 0 0 5px 0;
}

.stat-change {
  font-size: 12px;
  margin: 0;
  display: flex;
  align-items: center;

  &.positive {
    color: #52c41a;
  }

  &.negative {
    color: #f5222d;
  }

  i {
    margin-right: 4px;
    font-size: 14px;
  }
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;

  &.bg-primary {
    background-color: #409eff;
  }

  &.bg-success {
    background-color: #52c41a;
  }

  &.bg-warning {
    background-color: #faad14;
  }

  &.bg-danger {
    background-color: #f5222d;
  }
}

.charts-container {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.chart-card {
  flex: 1;
  min-width: 300px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .el-card__header {
    padding: 15px 20px;
    border-bottom: 1px solid #f0f2f5;

    h3 {
      margin: 0;
      font-size: 16px;
      color: #1f2d3d;
      font-weight: 500;
    }
  }

  .el-card__body {
    padding: 20px;
  }
}

.chart-wrapper {
  width: 100%;
  height: 250px;
}
</style>

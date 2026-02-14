<template>
  <div class="sys-para-container">
    <el-card>

      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="section-title">信息查询</div>
        <el-form :inline="true" :model="searchForm" class="search-form">
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-form-item label="参数名称">
                        <el-input v-model="searchForm.paraName" placeholder="请输入参数名称" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="参数描述">
                        <el-input v-model="searchForm.paraDscr" placeholder="请输入参数描述" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8" style="text-align: right;">
                    <el-form-item>
                        <el-button @click="handleReset">重置</el-button>
                        <el-button type="primary" @click="handleSearch">查询</el-button>
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>
      </div>

      <div class="table-section">
         <div class="section-title">
            <span>参数列表</span>
            <div class="header-btns" style="float: right; margin-top: -5px;">
                <el-button type="primary" class="btn-import">导入</el-button>
                <el-button type="success" class="btn-add">新增</el-button>
                <el-button type="warning" @click="handleAuthenticate">人脸认证</el-button>
            </div>
         </div>
         
         <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="paraName" label="参数名称" show-overflow-tooltip />
            <el-table-column prop="paraval" label="参数值" show-overflow-tooltip />
            <el-table-column prop="paraDscr" label="参数描述" show-overflow-tooltip />
            <el-table-column label="操作" width="120" align="center">
            <template #default="{ row }">
                <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
            </template>
            </el-table-column>
        </el-table>
        
        <!-- 分页组件 (Hidden based on screenshot implying simple list first, but typical for tables) -->
        <!-- Adding it just in case, but hiding or simple implementation -->
        <div class="pagination-container" v-if="total > 0">
            <el-pagination
                v-model:current-page="pageNum"
                v-model:page-size="pageSize"
                :total="total"
                layout="total, prev, pager, next"
                @current-change="fetchData"
            />
        </div>
      </div>

    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getSysParaList, deleteSysPara, authenticate } from '@/api/sysPara'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

const searchForm = reactive({
  paraDscr: '',
  paraName: ''
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      paraDscr: searchForm.paraDscr,
      paraName: searchForm.paraName
    }
    const res = await getSysParaList(params)
    if (res && res.data) {
        // Handle the wrapper structure from User's JSON
        // Structure: { code, data: { data: [], total... } }
        // The request interceptor usually returns response.data, let's verify.
        // If the interceptor returns response.data (the payload), then 'res' here is the full JSON object.
        if (res.code === 0) {
            tableData.value = res.data.data
            total.value = res.data.recordCounts
        } else {
             // Fallback or error
             ElMessage.error(res.message || 'Error fetching data')
        }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
    pageNum.value = 1
    fetchData()
}

const handleReset = () => {
    searchForm.paraDscr = ''
    searchForm.paraName = ''
    handleSearch()
}

const handleDelete = (row) => {
    ElMessageBox.confirm('确认删除该记录吗?', '提示', {
        type: 'warning'
    }).then(async () => {
        try {
            // Mock delete for now as API wasn't explicitly provided, but we assume
            await deleteSysPara({ paraName: row.paraName }) // Adjust param as needed
            ElMessage.success('删除成功')
            fetchData()
        } catch (e) {
            ElMessage.error('删除失败')
        }
    })
}

const handleAuthenticate = async () => {
    try {
        const res = await authenticate({ imageData: "111" })
        if (res && res.code === 0) {
             ElMessage.success('认证成功')
        } else {
             ElMessage.error(res?.message || '认证失败')
        }
    } catch (e) {
        console.error(e)
        ElMessage.error('认证请求失败')
    }
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.sys-para-container {
    padding: 20px;
}
.search-form {
    background-color: #fff;
    padding: 10px 0;
}
.section-title {
    font-size: 16px;
    font-weight: bold;
    color: #409EFF; /* Blue bar color */
    margin-bottom: 15px;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
    line-height: 1;
}
.header-btns {
    float: right;
}
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>

<template>
  <div class="crtf-container">
    <el-card>

      <!-- 搜索区域 -->
      <div class="search-section">
        <div class="section-title">认证记录查询</div>
        <el-form :inline="true" :model="searchForm" class="search-form">
            <el-row :gutter="20">
                <el-col :span="6">
                    <el-form-item label="人员姓名">
                        <el-input v-model="searchForm.psnName" placeholder="请输入人员姓名" clearable />
                    </el-form-item>
                </el-col>
                <el-col :span="8">
                    <el-form-item label="认证时间">
                        <el-date-picker
                            v-model="searchForm.crtfTimeRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            value-format="YYYY-MM-DD HH:mm:ss"
                            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 2, 1, 23, 59, 59)]"
                        />
                    </el-form-item>
                </el-col>
                <el-col :span="10" style="text-align: right;">
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
            <span>列表数据</span>
         </div>
         
         <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
            <el-table-column type="index" label="序号" width="60" align="center" />
            
            <el-table-column prop="psnName" label="人员姓名" show-overflow-tooltip width="100"  align="center" />
            <el-table-column prop="crtfTime" label="认证时间" width="200" show-overflow-tooltip :formatter="formatTime"  align="center" />

            <el-table-column prop="crtfRate" label="相似度" width="120" align="center" />

            <el-table-column prop="medinsCode" label="医疗机构编码" show-overflow-tooltip width="160" align="center"  />
            <el-table-column prop="medinsName" label="医疗机构名称" show-overflow-tooltip  align="center"  />
            
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button type="primary" link @click="handleView(row)">查看</el-button>
              </template>
            </el-table-column>
        </el-table>
        
        <div class="pagination-container" v-if="total > 0" style="margin-top: 20px; text-align: right;">
            <el-pagination
                v-model:current-page="pageNum"
                v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="total"
                layout="total, sizes, prev, pager, next, jumper"
                @current-change="fetchData"
                @size-change="fetchData"
            />
        </div>
      </div>

    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      title="认证详情"
      width="600px"
      append-to-body
    >
      <div class="detail-container">
        <el-row :gutter="20">
          <el-col :span="12" style="text-align: center;">
            <div class="image-title">认证照</div>
            <el-image 
              v-if="currentRow.crtfUrl"
              style="width: 200px; height: 200px"
              :src="currentRow.crtfUrl" 
              :preview-src-list="[currentRow.crtfUrl]"
              fit="contain" />
              <div v-else class="no-image">暂无图片</div>
          </el-col>
          <el-col :span="12" style="text-align: center;">
            <div class="image-title">模板照</div>
            <el-image 
              v-if="currentRow.faceImgUrl"
              style="width: 200px; height: 200px"
              :src="currentRow.faceImgUrl" 
              :preview-src-list="[currentRow.faceImgUrl]"
              fit="contain" />
              <div v-else class="no-image">暂无图片</div>
          </el-col>
        </el-row>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCrtfList } from '@/api/crtf'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentRow = ref({})

const searchForm = reactive({
  psnName: '',
  crtfTimeRange: []
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      psnName: searchForm.psnName,
      startTime: searchForm.crtfTimeRange && searchForm.crtfTimeRange[0],
      endTime: searchForm.crtfTimeRange && searchForm.crtfTimeRange[1]
    }
    const res = await getCrtfList(params)
    if (res && res.data) {
        if (res.code === 0) {
            tableData.value = res.data.data
            total.value = res.data.recordCounts
        } else {
             ElMessage.error(res.message || '获取数据失败')
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
    searchForm.psnName = ''
    searchForm.crtfTimeRange = []
    handleSearch()
}

const formatTime = (row, column, cellValue) => {
  if (!cellValue) return ''
  const date = new Date(cellValue)
  const y = date.getFullYear()
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const d = date.getDate().toString().padStart(2, '0')
  const h = date.getHours().toString().padStart(2, '0')
  const min = date.getMinutes().toString().padStart(2, '0')
  const s = date.getSeconds().toString().padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:${s}`
}

const handleView = (row) => {
  currentRow.value = row
  dialogVisible.value = true
}

onMounted(() => {
    fetchData()
})
</script>

<style scoped>
.crtf-container {
    padding: 20px;
}
.search-form {
    background-color: #fff;
    padding: 10px 0;
}
.section-title {
    font-size: 16px;
    font-weight: bold;
    color: #409EFF;
    margin-bottom: 15px;
    border-left: 4px solid #409EFF;
    padding-left: 10px;
    line-height: 1;
}
.image-title {
  font-weight: bold;
  margin-bottom: 10px;
}
.no-image {
  width: 200px;
  height: 200px;
  line-height: 200px;
  background-color: #f5f7fa;
  color: #c0c4cc;
  margin: 0 auto;
}
</style>

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
                        <el-button type="success" :icon="Camera" @click="openCertifyDialog">认证</el-button>
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
            
            <el-table-column prop="crtfRslt" label="认证结果" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.crtfRslt === '1' ? 'success' : 'danger'" size="small">
                  {{ row.crtfRslt === '1' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>

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
              :src="getImageUrl(currentRow.crtfUrl)" 
              :preview-src-list="[getImageUrl(currentRow.crtfUrl)]"
              fit="contain" />
              <div v-else class="no-image">暂无图片</div>
          </el-col>
          <el-col :span="12" style="text-align: center;">
            <div class="image-title">模板照</div>
            <el-image 
              v-if="currentRow.faceImgUrl"
              style="width: 200px; height: 200px"
              :src="getImageUrl(currentRow.faceImgUrl)" 
              :preview-src-list="[getImageUrl(currentRow.faceImgUrl)]"
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

    <!-- 认证弹窗 -->
    <el-dialog
      v-model="certifyDialogVisible"
      title="认证"
      width="520px"
      append-to-body
      :close-on-click-modal="false"
      @close="resetCertifyForm"
    >
      <el-form :model="certifyForm" :rules="certifyRules" ref="certifyFormRef" label-width="110px">
        <el-form-item label="人员姓名" prop="psnName">
          <el-input v-model="certifyForm.psnName" placeholder="请输入人员姓名" clearable />
        </el-form-item>
        <el-form-item label="人员模板号" prop="psnTmplNo">
          <el-input v-model="certifyForm.psnTmplNo" placeholder="请输入人员模板号" clearable />
        </el-form-item>
        <el-form-item label="证件号" prop="certno">
          <el-input v-model="certifyForm.certno" placeholder="请输入证件号" clearable />
        </el-form-item>
        <el-form-item label="医疗机构编码">
          <el-input v-model="certifyForm.medinsCode" placeholder="请输入医疗机构编码" clearable />
        </el-form-item>
        <el-form-item label="医疗机构名称">
          <el-input v-model="certifyForm.medinsName" placeholder="请输入医疗机构名称" clearable />
        </el-form-item>
        <el-form-item label="认证照片" prop="photoFile">
          <div class="upload-area">
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleFileChange"
            />
            <div
              class="upload-box"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <template v-if="certifyForm.previewUrl">
                <img :src="certifyForm.previewUrl" class="preview-img" />
                <div class="replace-tip">点击更换照片</div>
              </template>
              <template v-else>
                <el-icon class="upload-icon"><Plus /></el-icon>
                <div class="upload-tip">点击或拖拽上传照片</div>
                <div class="upload-hint">支持 JPG、PNG 格式</div>
              </template>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="certifyDialogVisible = false">取消</el-button>
          <el-button type="success" :loading="certifying" @click="handleCertify">
            {{ certifying ? '认证中...' : '确认认证' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCrtfList, uploadCrtfPhoto, certify } from '@/api/crtf'
import { ElMessage } from 'element-plus'
import { Camera, Plus } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const dialogVisible = ref(false)
const currentRow = ref({})

// 认证弹窗相关
const certifyDialogVisible = ref(false)
const certifying = ref(false)
const certifyFormRef = ref(null)
const fileInputRef = ref(null)

const certifyForm = reactive({
  psnName: '张三',
  psnTmplNo: '1001',
  certno: '430124199501011234',
  medinsCode: 'H1000001',
  medinsName: '测试医院-1',
  photoFile: null,
  previewUrl: ''
})

const certifyRules = {
  psnName: [{ required: true, message: '请输入人员姓名', trigger: 'blur' }],
  psnTmplNo: [{ required: true, message: '请输入人员模板号', trigger: 'blur' }],
  photoFile: [{ required: true, message: '请上传认证照片', trigger: 'change' }]
}

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

// 获取图片URL
const getImageUrl = (keyId) => {
  if (!keyId) return ''
  return `/mifss/ipt/file/download/${keyId}`
}

// 打开认证弹窗
const openCertifyDialog = () => {
  certifyDialogVisible.value = true
}

// 重置认证表单
const resetCertifyForm = () => {
  certifyForm.psnName = '张三'
  certifyForm.psnTmplNo = '1001'
  certifyForm.certno = '430124199501011234'
  certifyForm.medinsCode = 'H1000001'
  certifyForm.medinsName = '测试医院-1'
  certifyForm.photoFile = null
  certifyForm.previewUrl = ''
  certifyFormRef.value?.clearValidate()
}

// 触发文件选择
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    setPhotoFile(file)
  }
  // 清空 input，保证同一文件可再次选择
  e.target.value = ''
}

// 处理拖拽上传
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    setPhotoFile(file)
  }
}

const setPhotoFile = (file) => {
  certifyForm.photoFile = file
  certifyForm.previewUrl = URL.createObjectURL(file)
  certifyFormRef.value?.clearValidate('photoFile')
}

// 文件转 Base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      // 去掉 "data:image/xxx;base64," 前缀，只保留纯 base64 数据
      const base64 = e.target.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 执行认证
const handleCertify = async () => {
  if (!certifyFormRef.value) return
  await certifyFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!certifyForm.photoFile) {
      ElMessage.warning('请先上传认证照片')
      return
    }

    certifying.value = true
    try {
      // 1. 上传照片到 OSS，获取 keyId 作为 crtfUrl
      let crtfUrl = ''
      try {
        const uploadRes = await uploadCrtfPhoto(certifyForm.photoFile)
        if (uploadRes && uploadRes.code === 0) {
          crtfUrl = uploadRes.data || ''
        } else {
          ElMessage.warning('照片上传 OSS 失败，将继续进行认证')
        }
      } catch (e) {
        ElMessage.warning('照片上传 OSS 失败，将继续进行认证')
      }

      // 2. 将照片转为 base64
      const imageData = await fileToBase64(certifyForm.photoFile)

      // 3. 调用认证接口
      const certifyData = {
        psnName: certifyForm.psnName,
        psnTmplNo: certifyForm.psnTmplNo,
        certno: certifyForm.certno,
        medinsCode: certifyForm.medinsCode,
        medinsName: certifyForm.medinsName,
        crtfUrl: crtfUrl,
        imageData: imageData
      }
      const res = await certify(certifyData)

      if (res && res.code === 0) {
        const authenticated = res.data
        if (authenticated) {
          ElMessage.success('认证成功！')
        } else {
          ElMessage.warning('认证失败，人脸不匹配')
        }
        certifyDialogVisible.value = false
        // 刷新列表
        fetchData()
      } else {
        ElMessage.error(res?.message || '认证接口调用失败')
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('认证过程发生错误')
    } finally {
      certifying.value = false
    }
  })
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

/* 认证弹窗样式 */
.upload-area {
  width: 100%;
}
.upload-box {
  width: 200px;
  height: 200px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.3s;
  overflow: hidden;
  position: relative;
  background-color: #fafafa;
}
.upload-box:hover {
  border-color: #409EFF;
  background-color: #f0f7ff;
}
.upload-icon {
  font-size: 36px;
  color: #c0c4cc;
  margin-bottom: 8px;
}
.upload-tip {
  font-size: 14px;
  color: #606266;
}
.upload-hint {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 4px;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.replace-tip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  text-align: center;
  padding: 4px 0;
  font-size: 12px;
}
</style>

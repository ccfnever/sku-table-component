import React, { useState } from 'react'
import { Button } from 'antd'
import CreateSku from '../src/component/CreateSku'
import './app.less'

import { addSkuAttribute, uploadImg } from '../src/service'
// 示例数据
const salseAttributeData = [
  {
    id: 1,
    attributeName: '颜色',
    enable: 1
  },
  {
    id: 2,
    attributeName: '尺码',
    enable: 1
  },
  {
    id: 3,
    attributeName: '款式',
    enable: 1
  },
  {
    id: 4,
    attributeName: '重量',
    enable: 1
  },
]

const App = () => {
  const [salseAttribute, setSalseAttribute] = useState(salseAttributeData)

  return (<div className="sku-table-demo">
    <h2>sku-table-component 示例</h2>
    <Button type="primary">提交</Button>
    <CreateSku
      salseAttribute={salseAttribute}
      addSkuAttribute={addSkuAttribute}
      uploadImg={uploadImg}
    />
  </div>)
}

export default App
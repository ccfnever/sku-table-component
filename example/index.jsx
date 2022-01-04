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
    <p>
      电商系统中创建商品并配置对应的sku，是件挺麻烦复杂的事情，通过 sku-table-component 组件，可以快速满足对应的业务场景：<br/>
      - 支持动态配置规格、规格属性<br/>
      - 支持配置规格首图<br/>
      - 自动根据规格配置，生成 SKU 表格表单<br/>
    </p>
    {/* <Button type="primary">提交</Button> */}
    <CreateSku
      salseAttribute={salseAttribute}
      addSkuAttribute={addSkuAttribute}
      uploadImg={uploadImg}
    />
  </div>)
}

export default App
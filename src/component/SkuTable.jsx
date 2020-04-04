import React, { useState, useEffect } from 'react'
import { Table, Input, Form, InputNumber, Switch } from 'antd'

import '../style/index.less'

/**
 * @description 合并单元格算法
 * @param {Array} columns 表头数组
 * @param {Array} tableDataList 表格内容数组
 */
const getRowSpan = (columns, tableDataList) => {
  if (tableDataList.length === 0) return false
  const rowSpanConfig = {}
  columns.forEach(item => {
    let point = 0 // 记录用于扩张的单元格index
    const keyName = item.value
    rowSpanConfig[keyName] = []

    tableDataList.forEach((sc, si) => {
      if (!sc[keyName]) return
      // 第一条内容绝逼是展开的，可以直接推
      // 注：每一行占【1】的单元格，所以计算基数为1
      if (si === 0) {
        rowSpanConfig[keyName].push(1)
        return
      }
      // 对比上一条数据，值相等则触发合并
      if (sc[keyName] === tableDataList[si - 1][keyName]) {
        // eslint-disable-next-line no-plusplus
        rowSpanConfig[keyName][point]++
        rowSpanConfig[keyName].push(0)
      } else {
        rowSpanConfig[keyName].push(1)
        point = si
      }
    })
  })

  return rowSpanConfig
}

/**
 * @description 卡迪儿积算法
 * @param {Array} array 二维数组集合 如[[1, 2, 3], ['a', 'b', 'c']]
 */
function descartes(array) {
  if (array.length < 2) return array[0] || []
  return [].reduce.call(array, (col, set) => {
    const res = []
    col.forEach(c => {
      set.forEach(s => {
        const t = [].concat(Array.isArray(c) ? c : [c])
        t.push(s)
        res.push(t)
      })
    })
    return res
  })
}

/**
 * @description sku组合算法
 * @param {Array} sourceData 商品规格传递下来的元数据
 */
function getSkuList(sourceData) {
  const data = []
  sourceData.forEach(c => {
    if (c.subSpecList && c.subSpecList.length > 0) {
      data.push(c.subSpecList)
    }
  })
  if (!data.length) return false
  const result = descartes(data)
  return result
}

/**
 * @description 获取表格 columns 配置
 * @param {Array} sourceData 商品规格传递下来的元数据
 */
function getColumns(sourceData, tableSkuList, getFieldDecorator) {
  console.log('getColumns', sourceData)
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sourceData.length; i++) {
    if (!sourceData[i].value) return false
  }

  const config = getRowSpan(sourceData, tableSkuList)
  const columns = []
  const concatCol = [
    {
      title: (
        <div>
          <em style={{ color: 'red' }}>*</em>价格（元）
        </div>
      ),
      dataIndex: 'price',
      width: 200,
      render: (value, row) => (
        <Form.Item>
          {getFieldDecorator(`${row.skuId}-price`, {
            initialValue: value,
            validateTrigger: ['onBlur'],
            rules: [
              {
                required: true,
                message: '价格不可为空',
              },
            ],
          })(<InputNumber />)}
        </Form.Item>
      ),
    },
    {
      title: (
        <div>
          <em style={{ color: 'red' }}>*</em>库存
        </div>
      ),
      dataIndex: 'stock',
      width: 200,
      render: (value, row) => (
        <Form.Item>
          {getFieldDecorator(`${row.skuId}-stock`, {
            initialValue: value,
            validateTrigger: ['onBlur'],
            rules: [
              {
                required: true,
                message: '库存不可为空',
              },
            ],
          })(<InputNumber />)}
        </Form.Item>
      ),
    },
    {
      title: <div>SKU编码</div>,
      dataIndex: 'skuCode',
      width: 200,
      render: (value, row) => (
        <Form.Item>
          {getFieldDecorator(`${row.skuId}-skuCode`, {
            initialValue: value,
          })(<Input />)}
        </Form.Item>
      ),
    },
    {
      title: <div>状态</div>,
      dataIndex: 'salesStatus',
      width: 200,
      render: (value, row) => (
        <div>
          {getFieldDecorator(`${row.skuId}-salesStatus`, {
            initialValue: !!value,
            valuePropName: 'checked',
          })(<Switch checkedChildren="已启用" unCheckedChildren="已禁用" />)}
        </div>
      ),
    },
  ]

  sourceData.forEach(c => {
    const col = {
      title: c.value,
      dataIndex: c.value,
      render: (value, row, index) => {
        const obj = {
          children: (
            <div className="sku-td-first">
              {row.img && <img src={row.img} alt="" />}
              <span>{value}</span>
            </div>
          ),
          props: {},
        }

        obj.props.rowSpan = config[c.value] ? config[c.value][index] : 1
        return obj
      },
    }
    columns.push(col)
  })

  return columns.concat(concatCol)
}

/**
 * @description 获取表格 dataSource 配置
 * @param {Array} sourceData 商品规格传递下来的元数据
 */
function getDataSource(sourceData) {
  const skuList = getSkuList(sourceData)
  console.log('getDataSourcegetDataSource', sourceData, skuList)
  if (!skuList) return []
  return skuList.map((c, i) => {
    let tmp = { key: i, skuId: '' }
    const skuIdArray = []
    if (Array.isArray(c)) {
      c.forEach(sc => {
        tmp[sc.pValue] = sc.value
        skuIdArray.push(`${sc.specId}-${sc.pValue}:${sc.subSpecId}-${sc.value}`)
        tmp = { ...tmp, ...sc }
      })
    } else {
      tmp[c.pValue] = c.value
      skuIdArray.push(`${c.specId}-${c.pValue}:${c.subSpecId}-${c.value}`)
      tmp = { ...tmp, ...c }
    }
    tmp.skuId = skuIdArray.join()
    return tmp
  })
}

const SkuTable = props => {
  const { tableData, form, dispatch } = props
  const [columns, setColumns] = useState([])
  const [dataSource, setDataSource] = useState([])
  const { getFieldDecorator } = form

  useEffect(() => {
    if (tableData.length > 0) {
      console.log('tableData', tableData)
      const tableSkuList = getDataSource(tableData)
      const taleColumns = getColumns(tableData, tableSkuList, getFieldDecorator)
      setColumns(taleColumns)
      setDataSource(tableSkuList)
      // 存储 sku
      // dispatch({ type: 'addGoods/saveSkuList', data: tableSkuList })

      console.table('tableSkuList', tableSkuList)
      console.log('taleColumns', taleColumns)
    } else {
      // 单规格全部删除，则需清空表格数据
      setDataSource([])
      // dispatch({ type: 'addGoods/saveSkuList', data: [] })
    }
  }, [tableData])

  useEffect(() => {
    // 创建时存储表格对象
    // dispatch({ type: 'addGoods/saveSkuForm', data: form })
  }, [])

  return (
    <div className="sku-table">
      {columns && dataSource.length > 0 && (
        <Table columns={columns} dataSource={dataSource} bordered pagination={false} />
      )}
    </div>
  )
}

export default Form.create()(SkuTable)

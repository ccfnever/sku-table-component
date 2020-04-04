import React, { useState, useEffect } from 'react'
// import { connect } from 'dva'
import { Form, Icon, Input, Select, Button, Row, Col, Checkbox } from 'antd'
// import { addSkuAttribute } from '../services/addGoodsApi'

import goodsStyle from '../style/index.less'
import SkuTable from './SkuTable'
import PicturesWall from './PicturesWall'

let specIndex = 0 // 用于缓存动态商品规格 ID

// const skuOptions = ['颜色', '尺寸', '容量', '户型']



const selectedSkuOptions = [] // 缓存已被选的规格，防止重复
const { Option } = Select

const CreateSku = props => {

  // 接口方法
  const { uploadImg, addSkuAttribute } = props

  const { salseAttribute, form, dispatch, goodsEditForm } = props
  const { getFieldDecorator, getFieldValue, setFieldsValue } = form

  // -----------------------
  const [specList, setSpecList] = useState([])
  const [hasMainImg, setHasMainImg] = useState(true)

  // 同步规格数据到 dva
  useEffect(() => {
    // dispatch({ type: 'addGoods/saveGoodsSpecs', data: specList })
    console.log('specList', specList)

  }, [specList])

  useEffect(() => {
    // 编辑商品时，需要模拟发布步骤
    if (goodsEditForm) {
      const { selectedAttributes } = goodsEditForm.salesAttribute
      const { skus } = goodsEditForm
      const specListEdit = []

      selectedAttributes.forEach((c, i) => {
        // eslint-disable-next-line no-plusplus
        const specListItem = { id: specIndex++, subSpecList: [] }
        const value = salseAttribute.filter(item => c.attributeItemId === item.id)
        specListItem.value = value[i].attributeName // 规格值的 ID
        specListItem.name = value[i].attributeName // 规格值的 名称
        specListItem.specId = value[i].id
        selectedSkuOptions[i] = Number(specListItem.specId)

        // 新增
        specListItem.subSpecList = c.specsValue.map(subItem => {
          const skuId = `${specListItem.specId}-${specListItem.name}:${subItem.attributeValueId}-${subItem.attributeValue}`
          const skuItem = skus.filter(sku => sku.skuAttribute === skuId)[0]
          const subSpec = {
            pValue: specListItem.name,
            value: subItem.attributeValue,
            img: subItem.picture || '',
            price: skuItem.price,
            stock: skuItem.inventory,
            skuCode: skuItem.skuCode,
            specId: specListItem.specId,
            subSpecId: subItem.attributeValueId,
            salesStatus: skuItem.salesStatus,
          }
          return subSpec
        })

        specListEdit.push(specListItem)
      })
      setSpecList(specListEdit)
    }
  }, [salseAttribute])
  // const specList = [
  //   {
  //     id: 0,
  //     name: '颜色',
  //     subSpecList: [
  //       { value: '红色', id: 0 },
  //       { value: '白色', id: 1 },
  //       { value: '黑色', id: 2 },
  //     ],
  //   },
  // ]

  // 初始化时，创建首个空规格
  useEffect(() => {
    addSpec()
  }, [])

  // 添加规格
  function addSpec() {
    // eslint-disable-next-line no-plusplus
    const id = specIndex++
    setSpecList(specList.concat([{ id }]))
  }

  // 删除规格
  function removeSpec(id) {
    const { specId } = specList[getSpecIndex(id)]
    // 释放规格选项
    selectedSkuOptions[selectedSkuOptions.indexOf(Number(specId))] = undefined
    setSpecList(specList.filter(item => item.id !== id))
  }

  // 选择规格属性
  function handleSelectChange(value, index) {
    const attributeName = value.split('||')[0]
    const id = value.split('||')[1]
    specList[index].value = attributeName
    specList[index].specId = id

    // 这里需要清空原来的 subSpecList
    delete specList[index].subSpecList
    selectedSkuOptions[index] = Number(id)
    setSpecList([...specList])
  }

  // 添加规格属性
  async function handleAddSubSpecName(e, subSpecName, id) {
    e.preventDefault()
    const value = getFieldValue(subSpecName)
    const index = getSpecIndex(id)
    const pValue = specList[index].value
    const { specId } = specList[index]

    if (!value) return
    const CurrntSubSpecList = specList[index].subSpecList || []
    const isRepetition = CurrntSubSpecList.filter(c => c.value === value).length > 0
    if (isRepetition) return
    const result = await addSkuAttribute({
      attributeId: specId,
      attributeValue: value,
    })

    if (result.code !== 200) return

    CurrntSubSpecList.push({
      pValue,
      value,
      img: '',
      price: '',
      stock: '',
      skuCode: '',
      specId,
      subSpecId: result.data,
      salesStatus: 1,
    })
    specList[index].subSpecList = CurrntSubSpecList

    console.log('result', result)
    console.log('specList', specList)
    console.log('CurrntSubSpecList', CurrntSubSpecList)

    setSpecList([...specList])

    // 清空规格名称 input 值
    const resetObj = {}
    resetObj[subSpecName] = ''
    setFieldsValue(resetObj)
  }

  // 删除规格名称
  function removeSubSpec(id, subIndex) {
    const index = getSpecIndex(id)
    specList[index].subSpecList.splice(subIndex, 1)
    setSpecList([...specList])
  }

  function getSpecIndex(id) {
    return specList.findIndex(item => item.id === id)
  }

  function handleChecked(e) {
    setHasMainImg(e.target.checked)
    if (!specList[0].subSpecList) return
    // eslint-disable-next-line no-plusplus
    for (let i; i < specList[0].subSpecList.length; i++) {
      specList[0].subSpecList[i] = ''
    }
  }

  function handleChange(url, index) {
    specList[0].subSpecList[index].img = url
    setSpecList([...specList])
  }

  return (
    <div>
      <div className="sku-table-container">
        {specList &&
          specList.map((item, index) => (
            <div key={item.id}>
              <Row gutter={10} className="sku-table-header">
                <Col span={8}>
                  <Select
                    showSearch
                    placeholder="选择规格"
                    defaultValue={item.name}
                    onChange={value => handleSelectChange(value, index)}
                    style={{ width: "100%" }}
                    className="sku-table-select"
                  >
                    {salseAttribute &&
                      salseAttribute
                        .filter(c => selectedSkuOptions.indexOf(c.id) === -1)
                        .map(subItem => (
                          <Option
                            key={subItem.id}
                            value={`${subItem.attributeName}||${subItem.id}`}
                          >
                            {subItem.attributeName}
                          </Option>
                        ))}
                  </Select>
                </Col>
                <Col span={16}>
                  {index === 0 && (
                    <div>
                      <Checkbox
                        style={{ marginTop: '5px', float: 'left' }}
                        onChange={handleChecked}
                        checked={hasMainImg}
                      >
                        添加规格图片
                      </Checkbox>
                    </div>
                  )}
                  <Button style={{ float: 'right' }} onClick={() => removeSpec(item.id)}>
                    删除规格
                  </Button>
                </Col>
              </Row>
              <Row gutter={10} className="sku-body">
                {item.subSpecList &&
                  item.subSpecList.map((subListItem, subIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Col key={subIndex} span={3} className="sku-sub-spec" style={index === 0 && hasMainImg && { marginBottom: '150px' }}>
                      <span>{subListItem.value}</span>
                      <Icon
                        type="close-circle"
                        theme="filled"
                        className="sku-sub-remove-icon"
                        onClick={() => removeSubSpec(item.id, subIndex)}
                      />
                      <div className="main-img-upload">
                        {index === 0 && hasMainImg &&
                          <PicturesWall
                            single
                            defaultImg={subListItem.img || ''}
                            callBack={e => handleChange(e, subIndex)}
                            uploadImg={uploadImg}
                          />}
                      </div>
                    </Col>
                  ))}
                <Col span={24}>
                  {item.value && (
                    <Row>
                      <Col span={6}>
                        {getFieldDecorator(`subSpecNames_${item.id}`)(
                          <Input
                            placeholder="请输入规格名称"
                            onPressEnter={e =>
                              handleAddSubSpecName(e, `subSpecNames_${item.id}`, item.id)
                            }
                          />,
                        )}
                      </Col>
                      <Col span={4}>
                        <Button
                          type="link"
                          onClick={e => handleAddSubSpecName(e, `subSpecNames_${item.id}`, item.id)}
                        >
                          添加
                        </Button>
                      </Col>
                    </Row>
                  )}
                </Col>
              </Row>
            </div>
          ))}
        <Button icon="plus" onClick={addSpec}>
          添加规格
        </Button>
      </div>
      <SkuTable tableData={specList}></SkuTable>
    </div>
  )
}

// export default connect(({ loading, category, addGoods }) => ({
//   loading: loading.models.category,
//   salseAttribute: category.salseAttribute,
//   goodsEditForm: addGoods.goodsEditForm,
// }))(Form.create()(CreateSku))

export default Form.create()(CreateSku)

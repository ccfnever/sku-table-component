/* 模拟http请求前后交互 */

/*
* 创建 sku 规格属性的 id 需要从后台生成，所以这步操作需要接口操作
*/
export const addSkuAttribute = () => new Promise(resolve => {
  const random = Math.random() * 1000
  console.log('random', random)
  const result = {
    code: 200,
    msg: "成功",
    data: Math.floor(random)
  }

  resolve(result)
})

// 这里设置自定义图片上传
export const uploadImg = () => new Promise(resolve => {
  const imgData = {
    uid: Math.random() * 1000,
    name: 'test img',
    status: 'done',
    url: "http://qiniu-img.ccfnever.com/15854678793741.jpg",
  }
  const result = {
    code: 200,
    msg: "图片上传成功",
    data: imgData
  }

  resolve(result)
})
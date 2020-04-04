import React, { useState, useEffect } from 'react';
// import { connect } from 'dva';
import { Upload, Icon, Modal, message } from 'antd';


const PicturesWall = props => {
  const { uploadImg, viewModal, showUploadList, listType, form, fieldName, single, onChange, callBack, defaultImg } = props
  const [fileList, setFileList] = useState([])
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // 设置默认图像
  useEffect(() => {
    if (defaultImg) {
      addPicture()
    }
  }, [defaultImg])

  // 添加图片
  function addPicture(data) {
    const uid = Math.random() * 10000
    const fieldValue = {}
    if (single) {
      setImageUrl(data ? data.url : defaultImg)
      setUploading(false)
      if (form && fieldName) fieldValue[fieldName] = data ? data.url : defaultImg
    } else {
      if (data) {
        fileList.push({
          uid,
          name: data.name,
          status: 'done',
          url: data.url,
        })
      } else {
        defaultImg.split().forEach(c => {
          fileList.push({
            uid,
            name: c,
            status: 'done',
            url: c,
          })
        })
      }
      setFileList([...fileList])
      if (form && fieldName) fieldValue[fieldName] = fileList.map(c => c.url).join()
    }
    if (form && fieldName) form.setFieldsValue(fieldValue)
  }

  // 自定义上传图片到 OSS
  async function handleUpload({ file }) {
    if (single) setUploading(true)

    try {
      const imgData = await uploadImg()
      addPicture(imgData)
      if (callBack) callBack(single ? imgData.data.url : fileList)
    } catch (err) {
      setUploading(false)
    }
    // await dispatch({
    //   type: 'upload/uploadImg',
    //   file,
    //   success(data) {
    //     addPicture(data)
    //     if (callBack) callBack(single ? data.url : fileList)
    //   },
    //   fail(msg) {
    //     message.error(msg);
    //     setUploading(false)
    //   },
    // });

    if (!single) setFileList([...fileList])
  }

  // 图片预览
  function handleImgPreview(file) {
    if (!file.url) return
    setPreviewVisible(true)
    setPreviewImage(file.url)
  }

  // 图片上传限制
  function beforeUpload(file) {
    const isJpgOrPngOrGif = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
    if (!isJpgOrPngOrGif) {
      message.error('只可以上传 jpg、gif、png 格式');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片大小不得超过2MB!');
    }
    return isJpgOrPngOrGif && isLt5M;
  }

  function handleChange(e) {
    if (onChange) onChange(e)
  }

  function onRemove(e) {
    const removedFileList = fileList.filter(c => c.name !== e.name)
    if (form && fieldName && !single) {
      const fieldValue = {}
      fieldValue[fieldName] = removedFileList.map(c => c.url).join()
      form.setFieldsValue(fieldValue)
      if (callBack) callBack(removedFileList)
      setFileList(removedFileList)
    }
  }

  return (
    <div>
      <Upload
        listType={listType || 'picture-card'}
        fileList={fileList}
        customRequest={handleUpload}
        onPreview={file => handleImgPreview(file)}
        beforeUpload={beforeUpload}
        showUploadList={showUploadList || true}
        onChange={e => handleChange(e)}
        onRemove={onRemove}
      >
        {!single &&
          <div>
            <Icon type="plus" />
            <div className="ant-upload-text">上传图片</div>
          </div>}

        {single &&
          (imageUrl !== '' ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : (
            <div>
              <Icon type={uploading ? 'loading' : 'plus'} />
              <div className="ant-upload-text">上传图片</div>
            </div>
          ))}
      </Upload>
      {viewModal &&
        <Modal visible={previewVisible}
          footer={null}
          onCancel={() => setPreviewVisible(false)}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      }
    </div>
  )
}

// export default connect()(PicturesWall);
export default PicturesWall;

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import FirebaseStorageService from "../FirebaseStorageService";

function ImageUploadPreview({
  basePath,
  existingImageUrl,
  handleUploadFinish,
  handleUploadCancel,
}) {
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [imageUrl, setImageUrl] = useState("");

  const fileInputRef = useRef();

  useEffect(() => {
    if (existingImageUrl) {
      setImageUrl(existingImageUrl);
    } else {
      setImageUrl("");
      fileInputRef.current.value = null;
    }
  }, [existingImageUrl]);

  async function handleFileChanged(event) {
    const files = event.target.files;
    const file = files[0];

    if (!file) {
      alert("File select failed, Please try agian.");
      return;
    }

    const generatedFileId = uuidv4();

    try {
      const downloadUrl = await FirebaseStorageService.uploadFile(
        file,
        `${basePath}/${generatedFileId}`,
        setUploadProgress
      );

      setImageUrl(downloadUrl);
      handleUploadFinish(downloadUrl);
    } catch (error) {
      setUploadProgress(-1);
      fileInputRef.current.value = null;
      alert(error.message);
      throw error;
    }
  }

  function handleCancelImageClick() {
    FirebaseStorageService.deleteFile(imageUrl);
    fileInputRef.current.value = null;
    setImageUrl("");
    setUploadProgress(-1);
    handleUploadCancel();
  }

  return (
    <div className="image-upload-preview-container">
      hello from image upload preview
    </div>
  );
}

export default ImageUploadPreview;

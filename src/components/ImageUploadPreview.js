import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import FirebaseStorageService from "../FirebaseStorageService";

function ImageUploadPreview({
  basePath,
  existingImageUrl,
  handleUploadFinish,
  handliUploadCancel,
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

  return (
    <div className="image-upload-preview-container">
      hello from image upload preview
    </div>
  );
}

export default ImageUploadPreview;

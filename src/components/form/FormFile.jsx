import React, { useState } from 'react';

const FormFile = ({ multiple, accept, maxSize, onFilesChange }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    if (maxSize && files.some((file) => file.size > maxSize)) {
      setError(`Um ou mais arquivos excedem o tamanho máximo permitido.`);
      return;
    }

    setSelectedFiles(files);
    setError(null);
    if (onFilesChange) {
      onFilesChange(files);
    }
  };

  const getFileInputClassName = () => {
    let className = "file-input";

    if (error) {
      className += " border-danger";
    } else if (selectedFiles.length > 0) {
      className += " border-success";
    }

    return className;
  };

  return (
    <div>
      <input
        className={getFileInputClassName()}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
      />
    </div>
  );
};

export { FormFile };

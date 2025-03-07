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

  return (
    <div>
      <input
        className="file-input"
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
      />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <p>Arquivos selecionados:</p>
          <ul>
            {selectedFiles.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FormFile;

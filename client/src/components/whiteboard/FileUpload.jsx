import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

const FileUpload = ({ onUpload, onClose }) => {
  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        onUpload({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          name: file.name,
          data: e.target.result,
          file
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'application/pdf': [],
      'text/*': []
    }
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upload File
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FiX size={20} />
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
          }`}
        >
          <input {...getInputProps()} />
          <FiUpload className="mx-auto text-4xl text-gray-400 mb-4" />
          
          {isDragActive ? (
            <p className="text-blue-600 dark:text-blue-400">Drop files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports: Images, PDFs, Text files (Max 10MB)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
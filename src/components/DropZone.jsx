import { useState, useRef } from "react";

export default function DropZone({ onFileSelect, fileName }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
        transition-all duration-200
        ${
          isDragOver
            ? "border-blue-500 bg-blue-500/10"
            : "border-white/20 hover:border-blue-500 hover:bg-blue-500/10"
        }
        ${fileName ? "border-green-500/50" : ""}
      `}
    >
      <input
        ref={fileInputRef}
        type='file'
        accept='.json,application/json'
        onChange={handleFileChange}
        className='hidden'
      />
      <p className={`text-sm ${fileName ? "text-green-400" : "text-gray-400"}`}>
        {fileName || "Drag & drop a JSON file here, or click to select"}
      </p>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { 
  FiPenTool, 
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiUsers,
  FiMessageSquare,
  FiDownload,
  FiUpload,
  FiSave,
  FiSliders,
  FiXCircle,
  FiMinusCircle,
  FiPrinter,
  FiEyeOff // Using EyeOff as eraser alternative
} from 'react-icons/fi';
import { ChromePicker } from 'react-color';

const Toolbar = ({ 
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onDownload,
  onUpload,
  onPrint,
  onToggleChat,
  onToggleParticipants,
  isHost
}) => {
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [showBrushMenu, setShowBrushMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);

  // Tools with available icons
  const tools = [
    { id: 'pencil', icon: FiPenTool, label: 'Pencil' },
    { id: 'eraser', icon: FiEyeOff, label: 'Eraser' }, // Using EyeOff for eraser
  ];

  const handleToolClick = (tool) => {
    setActiveTool(tool);
    
    // Update canvas tool
    if (window.__canvasActions) {
      window.__canvasActions.setTool(tool);
      if (tool === 'eraser') {
        window.__canvasActions.setColor('#FFFFFF');
      } else {
        window.__canvasActions.setColor(color);
      }
    }
    
    if (onToolChange) onToolChange(tool);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    
    // Update canvas color
    if (window.__canvasActions && activeTool !== 'eraser') {
      window.__canvasActions.setColor(newColor.hex);
    }
    
    if (onColorChange) onColorChange(newColor.hex);
  };

  const handleBrushSizeChange = (e) => {
    const size = parseInt(e.target.value);
    setBrushSize(size);
    
    // Update canvas brush size
    if (window.__canvasActions) {
      window.__canvasActions.setBrushSize(size);
    }
    
    if (onBrushSizeChange) onBrushSizeChange(size);
  };

  const handleUndoClick = () => {
    if (window.__canvasActions) {
      window.__canvasActions.undo();
    }
    if (onUndo) onUndo();
  };

  const handleRedoClick = () => {
    if (window.__canvasActions) {
      window.__canvasActions.redo();
    }
    if (onRedo) onRedo();
  };

  const handleClearClick = () => {
    if (window.confirm('Clear the entire board?')) {
      if (window.__canvasActions) {
        window.__canvasActions.clearCanvas();
      }
      if (onClear) onClear();
    }
  };

  const handleSaveClick = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
    if (onSave) onSave();
  };

  const handleDownloadClick = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `whiteboard-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
    if (onDownload) onDownload();
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
    
    if (onUpload) onUpload(file);
  };

  const handlePrintClick = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Print Whiteboard</title>
            <style>
              body { margin: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();window.close()" />
          </body>
        </html>
      `);
    }
    if (onPrint) onPrint();
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center space-x-1 flex-wrap">
        {/* Drawing Tools */}
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              className={`p-2 rounded-lg transition ${
                activeTool === tool.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              title={tool.label}
            >
              <Icon size={20} />
            </button>
          );
        })}

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: color }}
            title="Color"
          />
          
          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50">
              <div 
                className="fixed inset-0" 
                onClick={() => setShowColorPicker(false)}
              />
              <ChromePicker
                color={color}
                onChange={handleColorChange}
              />
            </div>
          )}
        </div>

        {/* Brush Size */}
        <div className="relative">
          <button
            onClick={() => setShowBrushMenu(!showBrushMenu)}
            className={`p-2 rounded-lg transition ${
              showBrushMenu ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            } text-gray-700 dark:text-gray-300`}
            title="Brush Size"
          >
            <FiSliders size={20} />
          </button>

          {showBrushMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowBrushMenu(false)}
              />
              <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border dark:border-gray-700 min-w-[200px]">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Size: {brushSize}px</span>
                  <div 
                    className="bg-black dark:bg-white rounded-full"
                    style={{ width: brushSize, height: brushSize }}
                  />
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={handleBrushSizeChange}
                  className="w-full"
                />
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        {/* Edit Tools */}
        <button
          onClick={handleUndoClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Undo"
        >
          <FiRotateCcw size={20} />
        </button>

        <button
          onClick={handleRedoClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Redo"
        >
          <FiRotateCw size={20} />
        </button>

        <button
          onClick={handleClearClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600"
          title="Clear Board"
        >
          <FiTrash2 size={20} />
        </button>
      </div>

      {/* Right Tools */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDownloadClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Download"
        >
          <FiDownload size={20} />
        </button>

        <button
          onClick={handleUploadClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Upload"
        >
          <FiUpload size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={handleSaveClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Save"
        >
          <FiSave size={20} />
        </button>

        <button
          onClick={handlePrintClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Print"
        >
          <FiPrinter size={20} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2" />

        <button
          onClick={onToggleParticipants}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Participants"
        >
          <FiUsers size={20} />
        </button>

        <button
          onClick={onToggleChat}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          title="Chat"
        >
          <FiMessageSquare size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
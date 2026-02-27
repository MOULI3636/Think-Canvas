import React, { useState, useRef } from 'react';
import {
  FiPenTool,
  FiSquare,
  FiCircle,
  FiMinus,
  FiType,
  FiPlay,
  FiHexagon,
  FiNavigation,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMonitor,
  FiXCircle,
  FiRotateCcw,
  FiRotateCw,
  FiTrash2,
  FiUsers,
  FiMessageSquare,
  FiDownload,
  FiUpload,
  FiSave,
  FiSliders,
  FiPrinter,
  FiEyeOff,
  FiDroplet
} from 'react-icons/fi';
import { ChromePicker } from 'react-color';

const Toolbar = ({
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onFillChange,
  onFillColorChange,
  onUndo,
  onRedo,
  onClear,
  onSave,
  onDownload,
  onUpload,
  onAddNote,
  onPrint,
  onToggleChat,
  onToggleParticipants,
  isMicEnabled,
  isVideoEnabled,
  onToggleMic,
  onToggleVideo,
  isScreenSharing,
  onToggleScreenShare,
  onSendReaction,
  isHost
}) => {
  const [activeTool, setActiveTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#fde68a');
  const [fillEnabled, setFillEnabled] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [showBrushMenu, setShowBrushMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const fileInputRef = useRef(null);

  const tools = [
    { id: 'pencil', icon: FiPenTool, label: 'Pencil' },
    { id: 'text', icon: FiType, label: 'Text' },
    { id: 'line', icon: FiMinus, label: 'Line' },
    { id: 'arrow', icon: FiNavigation, label: 'Arrow' },
    { id: 'rectangle', icon: FiSquare, label: 'Rectangle' },
    { id: 'circle', icon: FiCircle, label: 'Circle' },
    { id: 'ellipse', icon: FiPlay, label: 'Ellipse' },
    { id: 'triangle', icon: FiPlay, label: 'Triangle' },
    { id: 'diamond', icon: FiHexagon, label: 'Diamond' },
    { id: 'eraser', icon: FiEyeOff, label: 'Eraser' },
  ];

  const handleToolClick = (selectedTool) => {
    setActiveTool(selectedTool);
    onToolChange?.(selectedTool);
  };

  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    onColorChange?.(newColor.hex);
  };

  const handleBrushSizeChange = (e) => {
    const size = parseInt(e.target.value, 10);
    setBrushSize(size);
    onBrushSizeChange?.(size);
  };

  const handleFillToggle = () => {
    const next = !fillEnabled;
    setFillEnabled(next);
    onFillChange?.(next);
  };

  const handleFillColorChange = (e) => {
    const next = e.target.value;
    setFillColor(next);
    onFillColorChange?.(next);
  };

  const handleUploadClick = () => {
    if (!isHost) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    e.target.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center space-x-1 flex-wrap">
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

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600"
            style={{ backgroundColor: color }}
            title="Stroke color"
          />

          {showColorPicker && (
            <div className="absolute top-10 left-0 z-50">
              <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
              <ChromePicker color={color} onChange={handleColorChange} />
            </div>
          )}
        </div>

        <button
          onClick={handleFillToggle}
          className={`p-2 rounded-lg transition ${
            fillEnabled
              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          title="Toggle shape fill"
        >
          <FiDroplet size={20} />
        </button>

        <label
          className="w-8 h-8 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          style={{ backgroundColor: fillColor }}
          title="Fill color"
        >
          <input type="color" value={fillColor} onChange={handleFillColorChange} className="hidden" />
        </label>

        <div className="relative">
          <button
            onClick={() => setShowBrushMenu(!showBrushMenu)}
            className={`p-2 rounded-lg transition ${
              showBrushMenu ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            } text-gray-700 dark:text-gray-300`}
            title="Brush size"
          >
            <FiSliders size={20} />
          </button>

          {showBrushMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowBrushMenu(false)} />
              <div className="absolute top-10 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50 border dark:border-gray-700 min-w-[200px]">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Size: {brushSize}px</span>
                  <div className="bg-black dark:bg-white rounded-full" style={{ width: brushSize, height: brushSize }} />
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

        <button onClick={onUndo} disabled={!isHost} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Undo">
          <FiRotateCcw size={20} />
        </button>

        <button onClick={onRedo} disabled={!isHost} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Redo">
          <FiRotateCw size={20} />
        </button>

        <button onClick={onClear} disabled={!isHost} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600" title="Clear board">
          <FiTrash2 size={20} />
        </button>
      </div>

      <div className="flex items-center space-x-2 flex-wrap">
        <button onClick={onDownload} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Download">
          <FiDownload size={20} />
        </button>

        <button
          onClick={handleUploadClick}
          disabled={!isHost}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isHost ? 'Upload file/image/note' : 'Only host can upload'}
        >
          <FiUpload size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.md,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />

        <button
          onClick={onAddNote}
          disabled={!isHost}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isHost ? 'Add text note' : 'Only host can add notes'}
        >
          <FiType size={20} />
        </button>

        <button onClick={onSave} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Save">
          <FiSave size={20} />
        </button>

        <button onClick={onPrint} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Print">
          <FiPrinter size={20} />
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

        <button onClick={onToggleParticipants} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Participants">
          <FiUsers size={20} />
        </button>

        <button onClick={onToggleChat} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300" title="Chat">
          <FiMessageSquare size={20} />
        </button>

        <button
          onClick={onToggleMic}
          className={`p-2 rounded-lg transition ${
            isMicEnabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          title={isMicEnabled ? 'Turn off mic' : 'Turn on mic'}
        >
          {isMicEnabled ? <FiMic size={20} /> : <FiMicOff size={20} />}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-2 rounded-lg transition ${
            isVideoEnabled
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <FiVideo size={20} /> : <FiVideoOff size={20} />}
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`p-2 rounded-lg transition ${
            isScreenSharing
              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
          title={isScreenSharing ? 'Stop screen share' : 'Share screen'}
        >
          {isScreenSharing ? <FiXCircle size={20} /> : <FiMonitor size={20} />}
        </button>

        <div className="flex items-center gap-1">
          {[
            '\u{1F44D}', // thumbs up
            '\u{1F44F}', // clapping
            '\u{1F4A1}', // idea
            '\u{1F525}' // fire
          ].map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => onSendReaction?.(emoji)}
              className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
              title={`Send ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toolbar;


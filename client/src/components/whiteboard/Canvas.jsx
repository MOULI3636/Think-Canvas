import React, { useRef, useEffect, useState, useCallback } from 'react';

const MAX_HISTORY_STEPS = 50;

const Canvas = ({ roomId, socket, isHost }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#fde68a');
  const [fillEnabled, setFillEnabled] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState('pencil');
  const isDrawingRef = useRef(false);
  const historyRef = useRef([]);
  const historyIndexRef = useRef(-1);
  const remotePointsRef = useRef(new Map());
  const startPointRef = useRef(null);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  }, []);

  const getPointerPosition = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const applyImageData = useCallback((imageData) => {
    if (!imageData) return;
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageData;
  }, [getContext]);

  const pushHistorySnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const currentHistory = historyRef.current;
    const currentIndex = historyIndexRef.current;
    const nextHistory = currentHistory.slice(0, currentIndex + 1);

    if (nextHistory[nextHistory.length - 1] === dataUrl) return;

    nextHistory.push(dataUrl);
    if (nextHistory.length > MAX_HISTORY_STEPS) {
      nextHistory.shift();
    }

    historyRef.current = nextHistory;
    historyIndexRef.current = nextHistory.length - 1;
  }, []);

  const clearCanvasInternal = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pushHistorySnapshot();
  }, [getContext, pushHistorySnapshot]);

  const drawArrowHead = (ctx, fromX, fromY, toX, toY, strokeSize) => {
    const headLength = Math.max(8, strokeSize * 3);
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
  };

  const drawShape = useCallback((shapeTool, startPoint, endPoint, strokeColor, strokeSize, shouldFill, selectedFillColor) => {
    const ctx = getContext();
    if (!ctx || !startPoint || !endPoint) return;

    const startX = startPoint.x;
    const startY = startPoint.y;
    const endX = endPoint.x;
    const endY = endPoint.y;
    const width = endX - startX;
    const height = endY - startY;

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = selectedFillColor;
    ctx.lineWidth = strokeSize;
    ctx.beginPath();

    if (shapeTool === 'line') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
    }

    if (shapeTool === 'arrow') {
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      drawArrowHead(ctx, startX, startY, endX, endY, strokeSize);
    }

    if (shapeTool === 'rectangle') {
      ctx.rect(startX, startY, width, height);
    }

    if (shapeTool === 'circle') {
      const radius = Math.sqrt((width ** 2) + (height ** 2)) / 2;
      const centerX = (startX + endX) / 2;
      const centerY = (startY + endY) / 2;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    }

    if (shapeTool === 'ellipse') {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      ctx.ellipse(centerX, centerY, Math.abs(width / 2), Math.abs(height / 2), 0, 0, Math.PI * 2);
    }

    if (shapeTool === 'triangle') {
      ctx.moveTo(startX + width / 2, startY);
      ctx.lineTo(startX, endY);
      ctx.lineTo(endX, endY);
      ctx.closePath();
    }

    if (shapeTool === 'diamond') {
      const centerX = startX + width / 2;
      const centerY = startY + height / 2;
      ctx.moveTo(centerX, startY);
      ctx.lineTo(endX, centerY);
      ctx.lineTo(centerX, endY);
      ctx.lineTo(startX, centerY);
      ctx.closePath();
    }

    if (shouldFill && !['line', 'arrow'].includes(shapeTool)) {
      ctx.fill();
    }
    ctx.stroke();
    ctx.beginPath();
  }, [getContext]);

  const insertText = useCallback((x, y, text, textColor = color) => {
    const ctx = getContext();
    if (!ctx || !text) return;
    ctx.fillStyle = textColor;
    ctx.font = `${Math.max(14, brushSize * 3)}px Arial`;
    ctx.fillText(text, x, y);
    pushHistorySnapshot();
  }, [brushSize, color, getContext, pushHistorySnapshot]);

  const insertImage = useCallback((imageDataUrl) => {
    if (!imageDataUrl) return Promise.resolve(false);
    const canvas = canvasRef.current;
    const ctx = getContext();
    if (!canvas || !ctx) return Promise.resolve(false);

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height, 1);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const x = (canvas.width - drawWidth) / 2;
        const y = (canvas.height - drawHeight) / 2;
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        pushHistorySnapshot();
        resolve(true);
      };
      img.onerror = () => resolve(false);
      img.src = imageDataUrl;
    });
  }, [getContext, pushHistorySnapshot]);

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return;
    historyIndexRef.current -= 1;
    applyImageData(historyRef.current[historyIndexRef.current]);
  }, [applyImageData]);

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return;
    historyIndexRef.current += 1;
    applyImageData(historyRef.current[historyIndexRef.current]);
  }, [applyImageData]);

  useEffect(() => {
    window.__canvasActions = {
      setTool,
      setColor,
      setBrushSize,
      setFillEnabled,
      setFillColor,
      clearCanvas: clearCanvasInternal,
      insertImage,
      insertText,
      undo,
      redo,
      getImageData: () => canvasRef.current?.toDataURL('image/png') || ''
    };

    return () => {
      if (window.__canvasActions) {
        delete window.__canvasActions;
      }
    };
  }, [clearCanvasInternal, insertImage, insertText, undo, redo]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const ctx = getContext();
    if (!canvas || !container || !ctx) return;

    const resizeCanvas = () => {
      const previous = canvas.toDataURL('image/png');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (previous && previous !== 'data:,') {
        applyImageData(previous);
      }
    };

    resizeCanvas();
    historyRef.current = [canvas.toDataURL('image/png')];
    historyIndexRef.current = 0;

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [applyImageData, getContext]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleBeginPath = (data) => {
      if (data.userId === socket.id) return;
      remotePointsRef.current.set(data.userId, { x: data.x, y: data.y });
    };

    const handleDraw = (data) => {
      if (data.userId === socket.id) return;
      const ctx = getContext();
      if (!ctx) return;

      const prevPoint = remotePointsRef.current.get(data.userId);
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.size;
      ctx.beginPath();
      if (prevPoint) {
        ctx.moveTo(prevPoint.x, prevPoint.y);
      } else {
        ctx.moveTo(data.x, data.y);
      }
      ctx.lineTo(data.x, data.y);
      ctx.stroke();

      remotePointsRef.current.set(data.userId, { x: data.x, y: data.y });
    };

    const handleClearBoard = () => {
      const canvas = canvasRef.current;
      const ctx = getContext();
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      historyRef.current = [canvas.toDataURL('image/png')];
      historyIndexRef.current = 0;
    };

    const handleSyncCanvasState = ({ imageData }) => {
      if (!imageData) {
        const canvas = canvasRef.current;
        const ctx = getContext();
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      applyImageData(imageData);
      historyRef.current = [imageData];
      historyIndexRef.current = 0;
    };

    socket.on('begin-path', handleBeginPath);
    socket.on('draw', handleDraw);
    socket.on('clear-board', handleClearBoard);
    socket.on('sync-canvas-state', handleSyncCanvasState);
    socket.emit('request-canvas-state', { roomId });

    return () => {
      socket.off('begin-path', handleBeginPath);
      socket.off('draw', handleDraw);
      socket.off('clear-board', handleClearBoard);
      socket.off('sync-canvas-state', handleSyncCanvasState);
    };
  }, [socket, roomId, applyImageData, getContext]);

  const startDrawing = (e) => {
    if (!isHost) return;
    const { x, y } = getPointerPosition(e);
    const ctx = getContext();
    if (!ctx) return;

    if (tool === 'text') {
      const typedText = window.prompt('Type your text');
      if (typedText && typedText.trim()) {
        insertText(x, y, typedText.trim(), color);
        socket?.emit('sync-canvas-state', {
          roomId,
          imageData: canvasRef.current?.toDataURL('image/png') || ''
        });
      }
      return;
    }

    if (tool === 'pencil' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
      socket?.emit('begin-path', { roomId, x, y, userId: socket.id });
    }

    startPointRef.current = { x, y };
    isDrawingRef.current = true;
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !isHost) return;
    const { x, y } = getPointerPosition(e);
    const ctx = getContext();
    if (!ctx) return;

    if (tool !== 'pencil' && tool !== 'eraser') return;

    const strokeColor = tool === 'eraser' ? '#FFFFFF' : color;
    const strokeSize = tool === 'eraser' ? brushSize * 2 : brushSize;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.lineTo(x, y);
    ctx.stroke();

    socket?.emit('draw', {
      roomId,
      x,
      y,
      color: strokeColor,
      size: strokeSize,
      userId: socket.id
    });
  };

  const stopDrawing = (e) => {
    if (!isDrawingRef.current) return;
    const startPoint = startPointRef.current;
    const endPoint = e ? getPointerPosition(e) : startPoint;

    if (
      isHost &&
      startPoint &&
      endPoint &&
      !['pencil', 'eraser', 'text'].includes(tool)
    ) {
      drawShape(tool, startPoint, endPoint, color, brushSize, fillEnabled, fillColor);
    }

    isDrawingRef.current = false;
    setIsDrawing(false);
    startPointRef.current = null;

    const ctx = getContext();
    ctx?.beginPath();
    pushHistorySnapshot();

    socket?.emit('sync-canvas-state', {
      roomId,
      imageData: canvasRef.current?.toDataURL('image/png') || ''
    });
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full bg-white dark:bg-gray-800"
      style={{ cursor: isHost ? (isDrawing ? 'grabbing' : 'crosshair') : 'default' }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

export default Canvas;

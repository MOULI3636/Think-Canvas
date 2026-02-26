const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const sanitizeFileName = (fileName) => {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};

const getFileType = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('text/')) return 'text';
  return 'other';
};

module.exports = {
  generateRoomId,
  formatDate,
  sanitizeFileName,
  getFileType
};
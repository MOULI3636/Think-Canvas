export const DRAWING_TOOLS = {
  PENCIL: 'pencil',
  ERASER: 'eraser',
  LINE: 'line',
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TEXT: 'text'
};

export const COLORS = {
  BLACK: '#000000',
  WHITE: '#ffffff',
  RED: '#f44336',
  BLUE: '#2196f3',
  GREEN: '#4caf50',
  YELLOW: '#ffeb3b',
  PURPLE: '#9c27b0',
  ORANGE: '#ff9800'
};

export const BRUSH_SIZES = [1, 2, 3, 5, 8, 13, 21];

export const SOCKET_EVENTS = {
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  DRAW: 'draw',
  CLEAR_BOARD: 'clear-board',
  SEND_MESSAGE: 'send-message',
  NEW_MESSAGE: 'new-message',
  USER_JOINED: 'user-joined',
  USER_LEFT: 'user-left',
  TYPING: 'typing',
  TOGGLE_LOCK: 'toggle-room-lock',
  ROOM_LOCKED: 'room-locked',
  REMOVE_PARTICIPANT: 'remove-participant',
  PARTICIPANTS_UPDATE: 'participants-update',
  SAVE_WHITEBOARD: 'save-whiteboard',
  LOAD_WHITEBOARD: 'load-whiteboard',
  ERROR: 'error'
};

export const API_ENDPOINTS = {
  AUTH: {
    GOOGLE: '/auth/google',
    LOGOUT: '/auth/logout',
    USER: '/auth/user',
    STATUS: '/auth/status'
  },
  ROOMS: {
    CREATE: '/rooms/create',
    JOIN: '/rooms/join',
    GET: (roomId) => `/rooms/${roomId}`,
    MESSAGES: (roomId) => `/rooms/${roomId}/messages`,
    SETTINGS: (roomId) => `/rooms/${roomId}/settings`,
    LOCK: (roomId) => `/rooms/${roomId}/lock`,
    PARTICIPANT: (roomId, userId) => `/rooms/${roomId}/participants/${userId}`,
    LEAVE: (roomId) => `/rooms/${roomId}/leave`
  },
  USER: {
    PROFILE: '/users/profile',
    GET: (userId) => `/users/${userId}`
  },
  WHITEBOARD: {
    SAVE: '/whiteboard/save',
    ROOM: (roomId) => `/whiteboard/room/${roomId}`,
    GET: (sessionId) => `/whiteboard/${sessionId}`
  },
  UPLOAD: {
    CHAT: '/upload/chat-file',
    SNAPSHOT: '/upload/whiteboard-snapshot'
  }
};
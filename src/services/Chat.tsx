import {io, Socket} from 'socket.io-client';
import {MY_SERVER_URL} from '../util/constrain';

let socket: Socket | null = null;
let localToken: string | null = null;

export const getSocket = (token?: string): Socket => {
  // Nếu token đổi hoặc socket chưa khởi tạo
  if ((localToken !== token && token) || !socket) {
    // Ngắt socket cũ (nếu có)
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    // Cập nhật token
    localToken = token ?? null;

    // Tạo socket mới
    socket = io(MY_SERVER_URL, {
      transports: ['websocket'],
      secure: true,
      auth: {
        access_token: token,
      },
      reconnection: true,
    });
  }

  return socket;
};

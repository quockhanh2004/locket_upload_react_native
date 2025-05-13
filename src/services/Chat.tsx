import {io, Socket} from 'socket.io-client';
import {MY_SERVER_URL} from '../util/constrain';

let socket: Socket | null = null;
let localToken: string | null = null;

export const getSocket = (token?: string): Socket => {
  if ((localToken !== token && token) || !socket) {
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

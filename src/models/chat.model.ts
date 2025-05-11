export enum SocketEvents {
  GET_MESSAGE = 'get_message',
  NEW_MESSAGE = 'new_message',
  SEND_MESSAGE = 'send_message',
  LIST_MESSAGE = 'list_message',
  ERROR = 'server_error',
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
}

export interface ListChatType {
  update_time: string;
  is_read: boolean;
  last_read_at: string;
  latest_message: string;
  with_user: string;
  sender: string;
  uid: string;
}

export interface ChatMessageType {
  create_time: string;
  id: string;
  reply_moment?: string;
  sender: string;
  text: string;
  thumbnail_url?: string;
}

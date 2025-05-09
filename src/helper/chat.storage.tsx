import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChatMessageType} from '../models/chat.model';

export async function saveChatToStorage(key: string, chat: ChatMessageType[]) {
  chat.sort((a, b) => {
    return (
      new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
    );
  });
  const jsonValue = JSON.stringify(chat);

  await AsyncStorage.setItem(key, jsonValue);
}

export async function loadChatFromStorage(
  key: string,
): Promise<ChatMessageType[]> {
  const jsonValue = await AsyncStorage.getItem(key);
  const data: ChatMessageType[] =
    jsonValue != null ? JSON.parse(jsonValue) : [];

  const sorted = [...data].sort((a, b) => {
    const timeA =
      typeof a.create_time === 'number'
        ? a.create_time
        : new Date(a.create_time).getTime();
    const timeB =
      typeof b.create_time === 'number'
        ? b.create_time
        : new Date(b.create_time).getTime();
    return timeA - timeB;
  });

  return sorted;
}

export async function removeChatFromStorage(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function removeOneItemInChatStorage(
  key: string,
  id: string,
): Promise<ChatMessageType[]> {
  const chat = await loadChatFromStorage(key);
  const newChat = chat.filter(item => item.id !== id);
  await saveChatToStorage(key, newChat);
  return newChat;
}

export async function addOneChatToStorage(
  key: string,
  newChat: ChatMessageType,
  isNewMessage: boolean = false,
): Promise<ChatMessageType[]> {
  const chat = await loadChatFromStorage(key);
  let updatedChat = chat;
  if (isNewMessage) {
    updatedChat = [...chat, newChat];
  } else {
    const index = chat.findIndex(item => item.id === newChat.id);
    if (index !== -1) {
      updatedChat[index] = newChat;
    } else {
      updatedChat = [newChat, ...chat];
    }
  }

  updatedChat.sort((a, b) => {
    return (
      new Date(b.create_time).getTime() - new Date(a.create_time).getTime()
    );
  });
  await saveChatToStorage(key, updatedChat);
  return updatedChat;
}

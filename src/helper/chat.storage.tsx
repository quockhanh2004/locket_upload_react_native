import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChatMessageType} from '../models/chat.model';

export async function saveChatToStorage(key: string, chat: ChatMessageType[]) {
  chat.sort((a, b) => {
    return parseInt(b.create_time, 10) - parseInt(a.create_time, 10);
  });
  const jsonValue = JSON.stringify(chat);

  await AsyncStorage.setItem(key, jsonValue);
}

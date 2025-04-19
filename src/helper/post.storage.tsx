import AsyncStorage from '@react-native-async-storage/async-storage';
import {Post} from '../models/post.model';

export async function savePostsToStorage(key: string, posts: Post[]) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(posts));
  } catch (err) {
    console.error('Lỗi lưu posts vào storage:', err);
  }
}

export async function loadPostsFromStorage(key: string): Promise<Post[]> {
  try {
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.error('Lỗi load posts từ storage:', err);
    return [];
  }
}

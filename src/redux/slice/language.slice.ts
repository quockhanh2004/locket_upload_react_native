import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import i18n from 'i18next';
import {Language} from '../../models/language.model';

export const setLanguage = createAsyncThunk(
  'language/setLanguage',
  async (language: Language) => {
    await i18n.changeLanguage(language);
    return language;
  },
);

interface LanguageState {
  language: Language;
}

const languageSlice = createSlice({
  name: 'language',
  initialState: {
    language: Language.VI,
  } as LanguageState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(setLanguage.fulfilled, (state, action: any) => {
      state.language = action.payload;
    });
  },
});

export default languageSlice.reducer;

import {createSlice} from '@reduxjs/toolkit';

interface GuideState {
  showSelectColor: boolean;
}

const initialState: GuideState = {
  showSelectColor: true,
};

const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setShowSelectColor(state, action) {
      state.showSelectColor = action.payload;
    },
  },
});

export const {setShowSelectColor} = guideSlice.actions;

export const guideReducer = guideSlice.reducer;

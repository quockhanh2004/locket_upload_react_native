import {createSlice} from '@reduxjs/toolkit';

interface GuideState {
  showSelectColor: boolean;
  guideSpotify: boolean;
}

const initialState: GuideState = {
  showSelectColor: true,
  guideSpotify: true,
};

const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setShowSelectColor(state, action) {
      state.showSelectColor = action.payload;
    },
    setGuideSpotify(state, action) {
      state.guideSpotify = action.payload;
    },
  },
});

export const {setShowSelectColor, setGuideSpotify} = guideSlice.actions;

export const guideReducer = guideSlice.reducer;

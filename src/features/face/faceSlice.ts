import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FaceBox {
  top: number;
  left: number;
  width: number;
  height: number;
  age?: number;
  gender?: string;
}

interface FaceState {
  boxes: FaceBox[];
}

const initialState: FaceState = {
  boxes: [],
};

const faceSlice = createSlice({
  name: 'face',
  initialState,
  reducers: {
    setFaceBoxes(state, action: PayloadAction<FaceBox[]>) {
      state.boxes = action.payload;
    },
  },
});

export const { setFaceBoxes } = faceSlice.actions;
export default faceSlice.reducer;

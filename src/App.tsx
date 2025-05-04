import React from 'react';
import WebcamCapture from './src/components/WebcamCapture.tsx';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';

const App: React.FC = () => {
  const faces = useSelector((state: RootState) => state.face.boxes);

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold">👁️ Facial Recognition App</h1>
      <div className="relative inline-block">
        <WebcamCapture />
        {faces.map((face, idx) => (
          <div
            key={idx}
            className="absolute border-2 border-red-500"
            style={{
              top: face.top,
              left: face.left,
              width: face.width,
              height: face.height,
            }}
          >
            <div className="bg-black text-white text-xs p-1 absolute bottom-0">
              {face.gender}, {face.age}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

import React from 'react';
import WebcamCapture from './components/WebcamCapture';
import { useSelector } from 'react-redux';
import { RootState } from './app/store';

const App: React.FC = () => {
  const faces = useSelector((state: RootState) => state.face.boxes);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-start py-8">
      <h1 className="text-4xl font-bold text-yellow-300 mb-6">Facial Recognition</h1>

      <div className="relative border-4 border-yellow-400 rounded-lg overflow-hidden w-fit">
        <WebcamCapture />
        {faces.map((face, idx) => (
          <div
            key={idx}
            className="absolute border-2 border-red-500 text-xs text-white bg-black bg-opacity-70 px-1"
            style={{
              top: face.top,
              left: face.left,
              width: face.width,
              height: face.height,
            }}
          >
            {face.gender}, {face.age}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

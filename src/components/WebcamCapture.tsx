import React, { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setFaceBoxes } from '../features/face/faceSlice';

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useDispatch();

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);
  const [registeredFaces, setRegisteredFaces] = useState<faceapi.LabeledFaceDescriptors[]>([]);
  const [nameInput, setNameInput] = useState('');

  const MODEL_URL = '/models';

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);
  };

  const registerFace = async () => {
    const video = webcamRef.current?.video;
    if (!video || !nameInput.trim()) return alert('Please enter a name');

    const detection = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) return alert('No face detected. Try again!');

    const newDescriptor = new faceapi.LabeledFaceDescriptors(nameInput.trim(), [
      detection.descriptor,
    ]);

    const updatedFaces = [...registeredFaces, newDescriptor];
    setRegisteredFaces(updatedFaces);
    setFaceMatcher(new faceapi.FaceMatcher(updatedFaces, 0.6));
    alert(`Face registered for ${nameInput.trim()}`);
    setNameInput('');
  };

  const detectFaces = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4 &&
      faceMatcher
    ) {
      const video = webcamRef.current.video!;
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withAgeAndGender();

      const canvas = canvasRef.current!;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const dims = faceapi.matchDimensions(canvas, {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      const resized = faceapi.resizeResults(detections, dims);
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);

      const boxes = resized.map((det) => {
        const bestMatch = faceMatcher.findBestMatch(det.descriptor);
        const box = det.detection.box;
        const label = `${bestMatch.label} (${bestMatch.distance.toFixed(2)}) - ${Math.round(
          det.age
        )} yrs, ${det.gender}`;
        new faceapi.draw.DrawBox(box, { label }).draw(canvas);
        return {
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
          name: bestMatch.label,
          distance: bestMatch.distance.toFixed(2),
          age: Math.round(det.age),
          gender: det.gender,
        };
      });

      dispatch(setFaceBoxes(boxes));
    }
  }, [dispatch, faceMatcher]);

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCameraOn && faceMatcher) {
      interval = setInterval(() => detectFaces(), 1000);
    }
    return () => clearInterval(interval);
  }, [isCameraOn, detectFaces, faceMatcher]);

  return (
    <div className="relative flex flex-col items-center space-y-4">

      <div className="relative w-full max-w-[600px]">
        {isCameraOn && (
          <>
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user' }}
              className="rounded-lg w-full h-auto border-4 border-yellow-400"
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
            />
          </>
        )}
      </div>

      {/* Register form */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          className="p-2 rounded text-black"
        />
        <button
          onClick={registerFace}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Register My Face
        </button>
      </div>

      {/* Toggle camera */}
      <button
        onClick={() => setIsCameraOn((prev) => !prev)}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded transition"
      >
        {isCameraOn ? 'Stop Camera' : 'Start Camera'}
      </button>
    </div>
  );
};

export default WebcamCapture;

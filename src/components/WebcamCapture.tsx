import React, { useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setFaceBoxes } from '../features/face/faceSlice';

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const dispatch = useDispatch();

  const loadModels = async () => {
    const MODEL_URL = '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);
  };

  const detectFaces = useCallback(async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video!;
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withAgeAndGender();

      const boxes = detections.map(det => ({
        top: det.detection.box.top,
        left: det.detection.box.left,
        width: det.detection.box.width,
        height: det.detection.box.height,
        age: Math.round(det.age),
        gender: det.gender,
      }));

      dispatch(setFaceBoxes(boxes));
    }
  }, [dispatch]);

  useEffect(() => {
    loadModels();
    const interval = setInterval(detectFaces, 1000);
    return () => clearInterval(interval);
  }, [detectFaces]);

  return (
    <div className="relative">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={{ facingMode: 'user' }}
        className="rounded"
      />
    </div>
  );
};

export default WebcamCapture;

import React, { useRef, useEffect, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useDispatch } from 'react-redux';
import { setFaceBoxes } from '../features/face/faceSlice';

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const dispatch = useDispatch();
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [faceMatcher, setFaceMatcher] = useState<faceapi.FaceMatcher | null>(null);

  const MODEL_URL = '/models';

  const loadLabeledImages = async () => {
    const labels = ['Krystal', 'AlanTuring', 'AdaLovelace']; // folder names in /public/known_faces/
    return Promise.all(
      labels.map(async (label) => {
        const descriptions: Float32Array[] = [];
        for (let i = 1; i <= 2; i++) {
          try {
            const img = await faceapi.fetchImage(`/known_faces/${label}/${i}.jpg`);
            const detection = await faceapi
              .detectSingleFace(img)
              .withFaceLandmarks()
              .withFaceDescriptor();

            if (detection) {
              descriptions.push(detection.descriptor);
            }
          } catch (err) {
            console.warn(`Could not load face for ${label}/${i}.jpg`, err);
          }
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
      })
    );
  };

  const loadModels = async () => {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
    ]);

    const labeledDescriptors = await loadLabeledImages();
    setFaceMatcher(new faceapi.FaceMatcher(labeledDescriptors, 0.6));
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

      const boxes = detections.map((det) => {
        const bestMatch = faceMatcher.findBestMatch(det.descriptor);
        return {
          top: det.detection.box.top,
          left: det.detection.box.left,
          width: det.detection.box.width,
          height: det.detection.box.height,
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
    let interval: NodeJS.Timeout;
    if (isCameraOn) {
      interval = setInterval(detectFaces, 1000);
    }
    return () => clearInterval(interval);
  }, [isCameraOn, detectFaces]);

  return (
    <div className="flex flex-col items-center space-y-4">
      {isCameraOn && (
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{ facingMode: 'user' }}
          className="rounded-lg"
        />
      )}
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

import * as faceapi from 'face-api.js';

export async function loadLabeledImages(): Promise<faceapi.LabeledFaceDescriptors[]> {
  const labels = ['Krystal', 'Elon Musk']; // folder names in public/models/known_faces

  return Promise.all(
    labels.map(async (label) => {
      const descriptions: Float32Array[] = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`/known_faces/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detections && detections.descriptor) {
          descriptions.push(detections.descriptor);
        }
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    })
  );
}

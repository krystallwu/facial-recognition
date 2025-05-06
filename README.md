
# Facial Recognition Web App

## Overview

This web application enables real-time facial recognition directly in the browser using the user's webcam. It allows users to:

- Register faces dynamically by name through live webcam input
- Recognize registered faces on subsequent appearances
- Display estimated age and gender for each detected face
- Show bounding boxes with labels overlaid on the video feed
- Toggle webcam access

## Technologies Used

- React (with TypeScript)
- face-api.js for face detection, recognition, age and gender estimation
- react-webcam for webcam access
- Redux for managing face metadata state
- Tailwind CSS for styling

## Project Approach

### Initial Setup

- Initialized a React app with TypeScript and set up `react-webcam` for real-time video input.
- Downloaded and served pre-trained face-api.js models from the public directory (TensorFlow).
- Configured detection pipeline using Tiny Face Detector, face landmarks, descriptors, and age/gender models.

### Real-Time Face Detection and Recognition

- Allowed face detection and registered user who was detected. The features of the user would then be recognized using the pre-trained models and facial detection would be complete.


## Other questions

### Ranking my abilities for each skill on a scale of 1-10:

JS: 6

TS: 6

React.js: 8

Angular 2+: 5

Vue.js: 5

Bootstrap: 5

Wordpress: 5

CSS: 7

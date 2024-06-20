import React, { useRef, useState } from 'react';

export default function CameraComponent() {
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef();

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  }

  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  }

  return (
    <div>
      <h2>Camera Component</h2>
      <div>
        {cameraStream ? (
          <div>
            <video ref={videoRef} autoPlay />
            <button onClick={stopCamera}>Stop Camera</button>
          </div>
        ) : (
          <button onClick={startCamera}>Start Camera</button>
        )}
      </div>
    </div>
  );
}

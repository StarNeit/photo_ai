import React, { useState, useRef } from 'react';
import { Box, Button, Container, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import { PhotoCamera, Upload, FilterAlt } from '@mui/icons-material';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';

const filters = [
  { name: 'Younger', effect: 'younger' },
  { name: 'Older', effect: 'older' },
  { name: 'Healthier', effect: 'healthier' },
  { name: 'Thinner', effect: 'thinner' },
];

const API_URL = 'http://localhost:3000';

const PhotoEditor = () => {
  const [image, setImage] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);
  const [transformedImage, setTransformedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [loading, setLoading] = useState(false);
  const webcamRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    setOriginalFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result);
      setShowCamera(false);
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    
    // Convert base64 to File for webcam captures
    const base64Data = imageSrc.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: 'image/jpeg' });
    const file = new File([blob], 'webcam-capture.jpg', { type: 'image/jpeg' });
    setOriginalFile(file);
    setShowCamera(false);
  };

  const applyFilter = async (filter) => {
    try {
      setLoading(true);
      setSelectedFilter(filter);

      if (!originalFile) {
        throw new Error('No image file available');
      }

      // Create form data
      const formData = new FormData();
      formData.append('image', originalFile);
      formData.append('transformation', filter.effect);

      // Log the file details before sending
      console.log('Sending file:', {
        name: originalFile.name,
        type: originalFile.type,
        size: originalFile.size
      });

      // Send to backend
      const response = await fetch(`${API_URL}/image/transform`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to transform image');
      }

      const data = await response.json();
      setTransformedImage(data.url);
    } catch (error) {
      console.error('Error applying filter:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 3, mt: 4, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Photo AI Editor
        </Typography>

        {!image && !showCamera && (
          <Box sx={{ mt: 3 }}>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<PhotoCamera />}
                onClick={() => setShowCamera(true)}
              >
                Take Photo
              </Button>
              <Box {...getRootProps()}>
                <input {...getInputProps()} />
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                >
                  Upload Photo
                </Button>
              </Box>
            </Stack>
          </Box>
        )}

        {showCamera && (
          <Box sx={{ mt: 3 }}>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              style={{ width: '100%', borderRadius: '8px' }}
            />
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={capturePhoto}
                startIcon={<PhotoCamera />}
              >
                Capture
              </Button>
            </Box>
          </Box>
        )}

        {image && (
          <Box sx={{ mt: 3 }}>
            <img
              src={transformedImage || image}
              alt="Uploaded"
              style={{
                width: '100%',
                borderRadius: '8px',
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Apply Filters
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {filters.map((filter) => (
                  <Button
                    key={filter.name}
                    variant={selectedFilter?.name === filter.name ? "contained" : "outlined"}
                    onClick={() => applyFilter(filter)}
                    startIcon={<FilterAlt />}
                    disabled={loading}
                  >
                    {filter.name}
                  </Button>
                ))}
              </Stack>
            </Box>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setImage(null);
                  setOriginalFile(null);
                  setTransformedImage(null);
                  setSelectedFilter(null);
                }}
                disabled={loading}
              >
                Start Over
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PhotoEditor; 
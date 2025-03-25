'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [borderColor, setBorderColor] = useState<string>('#FFFFFF'); // Default white
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      
      // Create preview
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      
      // Reset result
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    maxFiles: 1
  });

  const convertToSquare = useCallback(() => {
    if (!file || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new window.Image();
    img.onload = () => {
      // Determine the final size (take the larger dimension)
      const size = Math.max(img.width, img.height);
      
      // Set canvas size to the square dimensions
      canvas.width = size;
      canvas.height = size;
      
      // Fill with selected border color
      ctx.fillStyle = borderColor;
      ctx.fillRect(0, 0, size, size);
      
      // Calculate position to center the image
      const x = (size - img.width) / 2;
      const y = (size - img.height) / 2;
      
      // Draw the image centered
      ctx.drawImage(img, x, y, img.width, img.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png');
      setResult(dataUrl);
    };
    
    img.src = URL.createObjectURL(file);
  }, [file, borderColor]);

  const downloadImage = () => {
    if (!result) return;
    
    const link = document.createElement('a');
    link.href = result;
    link.download = `square-${file?.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">Square Image Converter</h1>
          <p className="text-gray-600 dark:text-gray-300">Convert any image to a perfect 1:1 square format with customizable borders</p>
        </header>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upload Image</h2>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {isDragActive ? (
                    <p className="text-blue-500 font-medium">Drop your image here</p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Drag & drop an image here, or click to select
                    </p>
                  )}
                </div>
              </div>

              {preview && (
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Original Image</h3>
                  <div className="relative h-48 sm:h-64 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="object-contain w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="text-md font-medium mb-2 text-gray-700 dark:text-gray-300">Border Color</h3>
                <div className="flex items-center space-x-3">
                  <input 
                    type="color" 
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{borderColor}</span>
                </div>
              </div>

              <button
                onClick={convertToSquare}
                disabled={!file}
                className="mt-6 w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Convert to Square
              </button>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Result</h2>
              
              {result ? (
                <>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img 
                      src={result} 
                      alt="Result" 
                      className="w-full h-auto"
                    />
                  </div>
                  <button
                    onClick={downloadImage}
                    className="mt-4 w-full py-2.5 px-4 bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Download
                  </button>
                </>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 h-64 flex items-center justify-center">
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    {file ? 'Click "Convert to Square" to see the result' : 'Upload an image to get started'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Square Image Converter - Create perfect square images with custom borders</p>
        </footer>
      </div>
      
      {/* Hidden canvas used for image processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}

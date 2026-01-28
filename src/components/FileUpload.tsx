import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadResponse } from '../types';

interface Props {
  onDataLoaded: (data: UploadResponse) => void;
}

export default function FileUpload({ onDataLoaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      onDataLoaded(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }, [onDataLoaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="mb-8">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-green-400 bg-green-400/10' : 'border-gray-600 hover:border-gray-500'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">📊</div>
        {loading ? (
          <p className="text-gray-400">Processing CSV...</p>
        ) : isDragActive ? (
          <p className="text-green-400">Drop the CSV file here...</p>
        ) : (
          <>
            <p className="text-gray-300 mb-2">Drag and drop a CSV file here, or click to select</p>
            <p className="text-gray-500 text-sm">Supports SMT shot data exports</p>
          </>
        )}
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

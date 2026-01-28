import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadResponse } from '../types';

interface Props {
  onDataLoaded: (data: UploadResponse) => void;
  onMatchSaved: () => void;
}

export default function FileUpload({ onDataLoaded, onMatchSaved }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matchNumber, setMatchNumber] = useState('');
  const [description, setDescription] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setPendingFile(acceptedFiles[0]);
    setError(null);
  }, []);

  const handleUpload = async () => {
    if (!pendingFile) {
      setError('Please select a CSV file first');
      return;
    }

    if (!matchNumber.trim()) {
      setError('Please enter a match number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', pendingFile);
      formData.append('matchNumber', matchNumber.trim());
      formData.append('description', description.trim());

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to upload file');
      }

      const data = await response.json();
      onDataLoaded(data);
      onMatchSaved();
      setPendingFile(null);
      setMatchNumber('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="mb-8 bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-200">Upload Shot Data</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Match Number *
          </label>
          <input
            type="text"
            value={matchNumber}
            onChange={(e) => setMatchNumber(e.target.value)}
            placeholder="e.g., Match 1, Week 5 Match 2"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Jupiter vs Neptune"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
        </div>
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4
          ${isDragActive ? 'border-green-400 bg-green-400/10' : 'border-gray-600 hover:border-gray-500'}
          ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input {...getInputProps()} />
        {pendingFile ? (
          <div className="text-green-400">
            <span className="text-2xl">✓</span>
            <p className="mt-2">{pendingFile.name}</p>
            <p className="text-sm text-gray-500">Click or drag to change file</p>
          </div>
        ) : isDragActive ? (
          <p className="text-green-400">Drop the CSV file here...</p>
        ) : (
          <>
            <p className="text-gray-300 mb-1">Drag and drop a CSV file here, or click to select</p>
            <p className="text-gray-500 text-sm">Supports SMT shot data exports</p>
          </>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={loading || !pendingFile || !matchNumber.trim()}
        className={`w-full py-3 rounded-lg font-semibold transition-colors
          ${loading || !pendingFile || !matchNumber.trim()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-500'}`}
      >
        {loading ? 'Processing...' : 'Upload & Save to Match'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}

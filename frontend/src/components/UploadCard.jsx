import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, Play, Loader2, RefreshCw } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:8000');

export default function UploadCard({ onUploadSuccess, onAnalysisComplete }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadState, setUploadState] = useState('idle'); // idle, selected, uploading, success, error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisFinished, setAnalysisFinished] = useState(false);
  const fileInputRef = useRef(null);

  // Constants
  const MAX_SIZE_MB = 50;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const ALLOWED_EXTENSIONS = ['.log', '.txt'];

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    const extension = '.' + selectedFile.name.split('.').pop().toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setErrorMessage('Unsupported file format. Only .log and .txt files are allowed.');
      setUploadState('error');
      return false;
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      setErrorMessage(`File is too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      setUploadState('error');
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        setUploadState('selected');
        setProgress(0);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        setUploadState('selected');
        setProgress(0);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploadState('uploading');
    setProgress(10); // Start with visual feedback

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Scale progress slightly to allow server line counting time before 100%
          setProgress(Math.min(percentCompleted * 0.9, 90));
        },
      });

      if (response.data && response.data.success) {
        setProgress(100);
        setTimeout(() => {
          setUploadResult(response.data);
          setUploadState('success');
          if (onUploadSuccess) {
            onUploadSuccess(response.data);
          }
        }, 300);
      } else {
        throw new Error(response.data?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const serverMessage = error.response?.data?.message || error.message || 'Error occurred during file upload';
      setErrorMessage(serverMessage);
      setUploadState('error');
    }
  };

  const resetUploader = () => {
    setFile(null);
    setUploadState('idle');
    setProgress(0);
    setErrorMessage('');
    setUploadResult(null);
    setAnalyzing(false);
    setAnalysisFinished(false);
  };

  const runAnalysis = async () => {
    if (uploadState !== 'success' || !uploadResult) return;
    setAnalyzing(true);
    setErrorMessage('');
    try {
      const response = await axios.get(`${BACKEND_URL}/api/analyze/${uploadResult.file_id}`);
      if (response.data && response.data.success) {
        setAnalysisFinished(true);
        if (onAnalysisComplete) {
          onAnalysisComplete(response.data);
        }
      } else {
        throw new Error(response.data?.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const serverMessage = error.response?.data?.message || error.message || 'Error occurred during log analysis';
      setErrorMessage(serverMessage);
      setUploadState('error');
    } finally {
      setAnalyzing(false);
    }
  };

  // Human readable file size formatter
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-panel rounded-2xl border border-background-border p-6 shadow-xl relative overflow-hidden transition-all duration-300">
      <div className="flex flex-col gap-4">
        {/* Card Header */}
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide">Upload Log File</h2>
          <p className="text-xs text-background-muted mt-0.5">Feed your raw application log text into the analysis pipeline</p>
        </div>

        {/* Drag and Drop Zone */}
        {uploadState === 'idle' && (
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 ${
              dragActive
                ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
                : 'border-background-border hover:border-slate-500 hover:bg-slate-800/20'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".log,.txt"
              onChange={handleFileChange}
            />
            <div className="p-4 bg-slate-800/80 rounded-full border border-slate-700">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Drag & drop files here</p>
              <p className="text-xs text-background-muted mt-1">or click to browse your files</p>
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-background-muted border-t border-background-border/50 pt-3 w-full justify-center">
              <span>Formats: <strong className="text-white">.log, .txt</strong></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
              <span>Max size: <strong className="text-white">50 MB</strong></span>
            </div>
          </div>
        )}

        {/* File Selected State */}
        {uploadState === 'selected' && file && (
          <div className="border border-background-border bg-slate-800/30 rounded-xl p-6 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                <p className="text-xs text-background-muted mt-1">{formatBytes(file.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={uploadFile}
                className="flex-1 py-2 px-4 bg-primary hover:bg-primary-hover active:scale-95 transition-all text-xs font-semibold text-purewhite rounded-lg shadow-lg shadow-primary/20"
              >
                Upload File
              </button>
              <button
                onClick={resetUploader}
                className="py-2 px-4 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg border border-background-border"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Uploading State */}
        {uploadState === 'uploading' && file && (
          <div className="border border-background-border bg-slate-800/30 rounded-xl p-6 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 animate-pulse">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Uploading {file.name}</p>
                <p className="text-xs text-background-muted mt-1">Processing stream and counting lines...</p>
              </div>
            </div>
            <div className="w-full">
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-background-muted font-mono-code">
                <span>{progress}% completed</span>
                <span>{formatBytes(file.size)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState === 'success' && uploadResult && (
          <div className="border border-accent/20 bg-accent/5 rounded-xl p-5 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-xl border border-accent/20">
                <CheckCircle2 className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{uploadResult.original_name || file?.name}</p>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-[11px] text-background-muted">
                    Lines: <strong className="text-accent">{uploadResult.total_lines.toLocaleString()}</strong>
                  </span>
                  <span className="text-[10px] text-slate-600">|</span>
                  <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-full text-[10px] text-accent font-semibold capitalize">
                    {uploadResult.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-lg p-3 text-[11px] font-mono-code text-slate-400 border border-slate-800/80">
              <div className="flex justify-between py-1">
                <span>File ID:</span>
                <span className="text-white select-all">{uploadResult.file_id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Saved Path:</span>
                <span className="text-slate-300">{uploadResult.saved_path}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Pipeline Stage:</span>
                <span className="text-accent font-semibold">Ready for Analysis</span>
              </div>
            </div>

            {/* Analysis Action */}
            {!analysisFinished && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={runAnalysis}
                  disabled={analyzing}
                  className="flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-xs font-bold text-purewhite shadow-lg transition-all bg-primary hover:bg-primary-hover shadow-primary/20 active:scale-95"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing Log Files...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-purewhite" />
                      <span>Analyze Logs</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={resetUploader}
                  className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-background-border transition-all active:scale-95"
                  title="Upload another file"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Simulated Analysis Detail Box */}
            {analyzing && (
              <div className="border border-primary/20 bg-primary/5 rounded-lg p-3 text-[10px] text-primary animate-pulse font-mono-code">
                [PIPELINE] Initializing ingestion stream... Parsing log metadata (file_id = "{uploadResult.file_id}")...
              </div>
            )}
            
            {analysisFinished && (
              <div className="border border-accent/20 bg-accent/5 rounded-lg p-3 text-[10px] text-accent animate-fade-in font-mono-code flex justify-between items-center gap-3">
                <span className="flex-1">
                  [SUCCESS] Log file ingested and parsed successfully.
                </span>
                <button
                  onClick={resetUploader}
                  className="p-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded transition-all active:scale-95 shrink-0"
                  title="Upload another file"
                >
                  <RefreshCw className="w-3 h-3 animate-none" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Error State */}
        {uploadState === 'error' && (
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-5 flex flex-col gap-4 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">Upload Blocked</p>
                <p className="text-xs text-red-400 mt-1">{errorMessage}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetUploader}
                className="flex-1 py-2 px-4 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg border border-background-border active:scale-95 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

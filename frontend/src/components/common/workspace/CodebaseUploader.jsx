import { useState, useRef } from 'react';
import { codebaseApi } from '../../../api/codebaseApi';
import Button from '../Button';
import StatusBadge from '../StatusBadge';

export default function CodebaseUploader({ workspaceId, onUploaded }) {
  const [dragging, setDragging]  = useState(false);
  const [file, setFile]          = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]        = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('zipFile', file);
      await codebaseApi.upload(workspaceId, fd);
      onUploaded?.();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        style={{
          border: `2px dashed ${dragging ? 'var(--orange)' : 'var(--panel-border)'}`,
          borderRadius: 4,
          padding: '32px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(255,107,43,0.04)' : 'transparent',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 10 }}>📁</div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
          {file
            ? <span style={{ color: 'var(--orange)' }}>{file.name}</span>
            : <>Drop your <strong style={{ color: 'var(--steel)' }}>.zip</strong> codebase here, or <span style={{ color: 'var(--orange)' }}>click to browse<br /></span></>
          }
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".zip"
          style={{ display: 'none' }}
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {error && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--red)', marginTop: 10 }}>⚠ {error}</p>
      )}

      {file && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          style={{ marginTop: 14, width: '100%' }}
        >
          {uploading ? '⟳ Uploading…' : '↑ Upload Codebase'}
        </Button>
      )}
    </div>
  );
}

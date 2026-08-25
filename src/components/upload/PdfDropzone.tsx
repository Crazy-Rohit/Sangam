import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { formatFileSize } from '../../lib/format'
import type { ProjectFileMeta } from '../../types'

type PdfDropzoneProps = {
  file: ProjectFileMeta | null
  onFile: (file: ProjectFileMeta | null) => void
}

export function PdfDropzone({ file, onFile }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOver, setIsOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function acceptFile(raw: File) {
    const isPdf =
      raw.type === 'application/pdf' || raw.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setError('Please upload a PDF project plan (.pdf).')
      return
    }
    setError(null)
    onFile({
      name: raw.name,
      size: raw.size,
      type: raw.type || 'application/pdf',
      uploadedAt: new Date().toISOString(),
      file: raw,
    })
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsOver(false)
    const dropped = event.dataTransfer.files[0]
    if (dropped) acceptFile(dropped)
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (selected) acceptFile(selected)
    event.target.value = ''
  }

  if (file) {
    return (
      <div className="upload-result">
        <div className="upload-file-icon" aria-hidden="true">
          PDF
        </div>
        <div className="upload-file-meta">
          <p className="upload-file-name">{file.name}</p>
          <p className="upload-file-sub">
            {formatFileSize(file.size)} · Ready for analysis
          </p>
          <p className="upload-status">
            <span className="status-dot" />
            Upload complete
          </p>
        </div>
        <div className="upload-actions">
          <button type="button" className="btn btn-ghost" onClick={() => inputRef.current?.click()}>
            Replace
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onFile(null)}>
            Remove
          </button>
        </div>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onChange}
        />
      </div>
    )
  }

  return (
    <div>
      <div
        className={`dropzone ${isOver ? 'dropzone-over' : ''}`}
        onDragOver={(event) => {
          event.preventDefault()
          setIsOver(true)
        }}
        onDragLeave={() => setIsOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <div className="dropzone-mark" aria-hidden="true">
          ↗
        </div>
        <h3>Upload Project Plan</h3>
        <p>
          Upload the project PDF containing development, infrastructure,
          environmental and planning information.
        </p>
        <p className="dropzone-hint">Drag and drop a .pdf file, or click to browse</p>
        <input
          ref={inputRef}
          className="sr-only"
          type="file"
          accept="application/pdf,.pdf"
          onChange={onChange}
        />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  )
}

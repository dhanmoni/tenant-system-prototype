import { Icon } from '../dashboard/Icons'

function DocumentUploadSlot({
	id,
	label,
	accept,
	hint,
	required = false,
	onChange,
	imagePreview,
	file,
	previewTitle,
	onPreview,
	onFilePreview,
}) {
	return (
		<div className="tenancy-doc-slot">
			<label className="tenancy-doc-slot__label" htmlFor={id}>
				<span className={`label-text${required ? ' required' : ''}`}>{label}</span>
				<input id={id} type="file" accept={accept} onChange={onChange} required={required} />
				{hint ? <span className="muted tenancy-doc-slot__hint">{hint}</span> : null}
			</label>
			<div className="tenancy-doc-slot__status">
				{imagePreview ? (
					<div className="tenancy-doc-slot__uploaded">
						<img src={imagePreview} alt="" className="tenancy-thumb tenancy-thumb--slot" />
						<span className="tenancy-doc-slot__uploaded-label">Ready to preview</span>
						<button
							type="button"
							className="tenancy-doc-preview-btn"
							title={`Preview ${previewTitle}`}
							aria-label={`Preview ${previewTitle}`}
							onClick={() => onPreview(previewTitle, imagePreview)}
						>
							<Icon name="eye" />
						</button>
					</div>
				) : file ? (
					<div className="tenancy-doc-slot__uploaded">
						<span className="tenancy-doc-slot__file-badge" aria-hidden>
							{file.type === 'application/pdf' || /\.pdf$/i.test(file.name) ? 'PDF' : 'IMG'}
						</span>
						<span className="tenancy-doc-slot__filename" title={file.name}>
							{file.name}
						</span>
						<button
							type="button"
							className="tenancy-doc-preview-btn"
							title={`Preview ${previewTitle}`}
							aria-label={`Preview ${previewTitle}`}
							onClick={() => onFilePreview(previewTitle, file)}
						>
							<Icon name="eye" />
						</button>
					</div>
				) : (
					<span className="tenancy-doc-slot__pending">Awaiting upload</span>
				)}
			</div>
		</div>
	)
}

export default DocumentUploadSlot

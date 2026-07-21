import { Icon } from '../dashboard/Icons'
import { useLanguage } from '../../i18n'

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
	const { t } = useLanguage()
	const hasFile = Boolean(imagePreview || file)
	const fileName = file?.name || (imagePreview ? t('ws.uin.upload.imageSelected') : '')

	return (
		<div className={`tenancy-doc-slot${hasFile ? ' is-uploaded' : ''}`}>
			<div className="tenancy-doc-slot__head">
				<span className={`tenancy-doc-slot__title${required ? ' is-required' : ''}`}>{label}</span>
				{hint ? <span className="tenancy-doc-slot__hint">{hint}</span> : null}
			</div>

			<div className="tenancy-doc-slot__row">
				<input
					id={id}
					className="tenancy-doc-slot__input"
					type="file"
					accept={accept}
					onChange={onChange}
					required={required && !hasFile}
				/>
				<label htmlFor={id} className="tenancy-doc-slot__pick-btn">
					{hasFile ? t('ws.uin.upload.changeFile') : t('ws.uin.upload.chooseFile')}
				</label>

				{imagePreview ? (
					<div className="tenancy-doc-slot__uploaded">
						<img src={imagePreview} alt="" className="tenancy-thumb tenancy-thumb--slot" />
						<span className="tenancy-doc-slot__filename" title={fileName}>
							{fileName}
						</span>
						<button
							type="button"
							className="tenancy-doc-preview-btn"
							title={t('ws.uin.upload.preview', { title: previewTitle })}
							aria-label={t('ws.uin.upload.preview', { title: previewTitle })}
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
							title={t('ws.uin.upload.preview', { title: previewTitle })}
							aria-label={t('ws.uin.upload.preview', { title: previewTitle })}
							onClick={() => onFilePreview(previewTitle, file)}
						>
							<Icon name="eye" />
						</button>
					</div>
				) : (
					<span className="tenancy-doc-slot__pending">{t('ws.uin.upload.noFile')}</span>
				)}
			</div>
		</div>
	)
}

export default DocumentUploadSlot

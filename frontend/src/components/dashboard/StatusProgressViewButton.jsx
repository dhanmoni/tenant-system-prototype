import { useState } from 'react'
import { Icon } from './Icons'
import ApplicationStatusProgressModal from './ApplicationStatusProgressModal'
import { STATUS } from '../../constants/status'

function isClosedStatus(status) {
	const s = String(status || '').toUpperCase()
	return s === STATUS.WITHDRAWN || s === STATUS.CANCELLED
}

/**
 * Icon button that opens the shared application status progress modal.
 */
function StatusProgressViewButton({
	application,
	className = '',
	title = 'View status progress',
	variant = 'admin',
	viewerRole,
	wrapperClassName = '',
}) {
	const [open, setOpen] = useState(false)

	if (!application || isClosedStatus(application.status)) return null

	const useWorkspaceBtn = variant === 'workspace' || variant === 'admin'
	const btnClass = useWorkspaceBtn
		? `ws-status-action-btn ws-status-action-btn--progress ${className}`.trim()
		: `table-icon-btn table-icon-btn--progress ${className}`.trim()

	const buttonAndModal = (
		<>
			<button
				type="button"
				className={btnClass}
				title={title}
				aria-label={title}
				onClick={(e) => {
					e.stopPropagation()
					setOpen(true)
				}}
			>
				<Icon name="timeline" className="btn-icon-svg" />
				{useWorkspaceBtn ? <span>Progress</span> : null}
			</button>
			<ApplicationStatusProgressModal
				open={open}
				onClose={() => setOpen(false)}
				application={application}
				viewerRole={viewerRole}
			/>
		</>
	)

	if (wrapperClassName) {
		return <div className={wrapperClassName}>{buttonAndModal}</div>
	}

	return buttonAndModal
}

export default StatusProgressViewButton

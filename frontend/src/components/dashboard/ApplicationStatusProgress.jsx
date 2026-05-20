import { buildApplicationStatusProgress } from '../../utils/applicationStatusProgress'

function StepIcon({ state }) {
	if (state === 'completed') {
		return (
			<span className="status-progress__icon status-progress__icon--done" aria-hidden>
				<svg viewBox="0 0 20 20" fill="none">
					<circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
					<path
						d="M6 10.2 8.6 12.8 14 7.4"
						stroke="currentColor"
						strokeWidth="1.75"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</span>
		)
	}

	if (state === 'in_progress') {
		return (
			<span className="status-progress__icon status-progress__icon--active" aria-hidden>
				<svg viewBox="0 0 20 20" fill="none">
					<circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
					<circle cx="10" cy="10" r="3" fill="currentColor" />
				</svg>
			</span>
		)
	}

	if (state === 'warning') {
		return (
			<span className="status-progress__icon status-progress__icon--warn" aria-hidden>
				<svg viewBox="0 0 20 20" fill="none">
					<circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
					<path d="M10 6v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
					<circle cx="10" cy="14" r="1" fill="currentColor" />
				</svg>
			</span>
		)
	}

	return (
		<span className="status-progress__icon status-progress__icon--pending" aria-hidden>
			<svg viewBox="0 0 20 20" fill="none">
				<circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
			</svg>
		</span>
	)
}

function badgeLabel(badge) {
	if (badge === 'in-progress') return 'In progress'
	if (badge === 'rejected') return 'Rejected'
	if (badge === 'completed') return 'Done'
	if (badge === 'pending') return 'Pending'
	return null
}

function ProgressStep({ step, isLast }) {
	const muted = step.state === 'completed'
	const label = badgeLabel(step.badge || step.state)

	return (
		<li className={`status-progress__step status-progress__step--${step.state}`}>
			<div className="status-progress__rail">
				<StepIcon state={step.state} />
				{!isLast ? <span className="status-progress__line" aria-hidden /> : null}
			</div>
			<div className="status-progress__content">
				<div className="status-progress__row">
					<p className={`status-progress__title${muted ? ' is-muted' : ''}`}>{step.title}</p>
					{label ? (
						<span className={`status-progress__badge status-progress__badge--${step.badge || step.state}`}>
							{label}
						</span>
					) : null}
				</div>
				{step.description ? (
					<p className="status-progress__desc">{step.description}</p>
				) : null}
				{step.timestamp ? <p className="status-progress__time">{step.timestamp}</p> : null}
				{step.substeps?.length ? (
					<ul className="status-progress__substeps">
						{step.substeps.map((sub) => (
							<li
								key={sub.id}
								className={`status-progress__substep status-progress__substep--${sub.state}`}
							>
								<span className="status-progress__subdot" aria-hidden />
								<span className="status-progress__subtitle">{sub.title}</span>
							</li>
						))}
					</ul>
				) : null}
			</div>
		</li>
	)
}

function ApplicationStatusProgress({ application }) {
	const { steps, currentLabel, applicationNo, formLabel } =
		buildApplicationStatusProgress(application)

	return (
		<div className="status-progress">
			<header className="status-progress__header">
				<div>
					<p className="status-progress__eyebrow">Tracking</p>
					<h3 className="status-progress__heading">{applicationNo}</h3>
					<p className="status-progress__meta">{formLabel}</p>
				</div>
				<span className="status-progress__current">{currentLabel}</span>
			</header>

			{steps.length === 0 ? (
				<p className="status-progress__empty">No progress information available yet.</p>
			) : (
				<ol className="status-progress__list">
					{steps.map((step, index) => (
						<ProgressStep key={step.id} step={step} isLast={index === steps.length - 1} />
					))}
				</ol>
			)}
		</div>
	)
}

export default ApplicationStatusProgress

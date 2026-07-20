import { useMemo } from 'react'
import { Icon } from '../../../components/dashboard/Icons'
import { STATUS } from '../../../constants/status'
import { APPLICATION_TYPES } from '../../../constants/application'
import { isProfileComplete } from '../../../utils/profileCompleteness'

function isTenancyApplication(app) {
	const type = String(app?.application_type || '').toLowerCase()
	return type.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE)
}

function isInProgressStatus(status) {
	const s = String(status || '').trim().toUpperCase()
	return [STATUS.IN_REVIEW, STATUS.PENDING, STATUS.UNDER_PROCESS].includes(s)
}

function buildNextSteps(applications, user) {
	const steps = []
	const normalized = applications.map((app) => ({
		...app,
		statusKey: String(app.status || '').trim().toUpperCase(),
	}))

	const draft = normalized.find((app) => app.statusKey === STATUS.DRAFT)
	if (draft) {
		const draftPath = isTenancyApplication(draft)
			? `/dashboard/tenancy-certificate?draft=${encodeURIComponent(draft.application_no || '')}`
			: `/dashboard/status?app_no=${encodeURIComponent(draft.application_no || '')}`

		steps.push({
			id: `draft-${draft.application_no || 'unknown'}`,
			icon: 'documentPlus',
			tone: 'accent',
			title: 'Resume draft application',
			description: draft.application_no
				? `${draft.application_no} is saved — pick up where you left off.`
				: 'You have an unfinished application waiting to be completed.',
			actionLabel: 'Continue',
			to: draftPath,
		})
	}

	const partial = normalized.find((app) => app.statusKey === STATUS.PARTIAL)
	if (partial?.application_no) {
		steps.push({
			id: `partial-${partial.application_no}`,
			icon: 'user',
			tone: 'warning',
			title: 'Complete party details',
			description: `${partial.application_no} is waiting for co-party information.`,
			actionLabel: 'Open application',
			to: `/dashboard/status?app_no=${encodeURIComponent(partial.application_no)}`,
		})
	}

	const inProgress = normalized.filter((app) => isInProgressStatus(app.status))
	if (inProgress.length > 0) {
		const target =
			inProgress.length === 1 && inProgress[0].application_no
				? `/dashboard/status?app_no=${encodeURIComponent(inProgress[0].application_no)}`
				: '/dashboard/status'

		steps.push({
			id: 'track-progress',
			icon: 'clock',
			tone: 'pending',
			title:
				inProgress.length === 1
					? 'Track your application'
					: `${inProgress.length} applications in progress`,
			description: 'Check processing updates from the rent authority.',
			actionLabel: inProgress.length === 1 ? 'View status' : 'View all',
			to: target,
		})
	}

	if (user && !isProfileComplete(user)) {
		steps.push({
			id: 'profile',
			icon: 'user',
			tone: 'neutral',
			title: 'Complete your profile',
			description: 'Add address, PAN, and passport photo to speed up future applications.',
			actionLabel: 'Update profile',
			to: '/dashboard/profile',
		})
	}

	if (applications.length === 0) {
		steps.push({
			id: 'apply-uin',
			icon: 'documentPlus',
			tone: 'accent',
			title: 'Apply for UIN',
			description: 'Start tenancy registration with a Unique Identification Number.',
			actionLabel: 'Get started',
			to: '/dashboard/tenancy-certificate',
		})
	} else if (steps.length === 0) {
		steps.push({
			id: 'browse-services',
			icon: 'services',
			tone: 'neutral',
			title: 'Explore more services',
			description: 'Browse Assam Tenancy Act forms for authority, court, and tribunal.',
			actionLabel: 'Browse forms',
			to: '/dashboard/services',
		})
	}

	return steps.slice(0, 4)
}

function CitizenNextSteps({ applications = [], user, loading = false, onNavigate }) {
	const steps = useMemo(() => buildNextSteps(applications, user), [applications, user])

	if (loading) {
		return <div className="ws-citizen-next-steps ws-citizen-next-steps--loading">Loading suggestions…</div>
	}

	return (
		<ul className="ws-citizen-next-steps" aria-label="Suggested next steps">
			{steps.map((step) => (
				<li key={step.id}>
					<article className={`ws-citizen-next-step ws-citizen-next-step--${step.tone}`}>
						<span className="ws-citizen-next-step-icon" aria-hidden>
							<Icon name={step.icon} />
						</span>
						<div className="ws-citizen-next-step-copy">
							<h3 className="ws-citizen-next-step-title">{step.title}</h3>
							<p className="ws-citizen-next-step-desc">{step.description}</p>
						</div>
						<button
							type="button"
							className="ws-btn ws-btn--outline ws-btn--sm ws-citizen-next-step-action"
							onClick={() => onNavigate?.(step.to)}
						>
							{step.actionLabel}
						</button>
					</article>
				</li>
			))}
		</ul>
	)
}

export default CitizenNextSteps

import { STATUS, STATUS_LABELS } from '../constants/status'
import { APPLICATION_TYPES } from '../constants/application'

const WORKFLOW_ORDER = [
	STATUS.DRAFT,
	STATUS.PARTIAL,
	STATUS.SUBMITTED,
	STATUS.IN_REVIEW,
	STATUS.COMPLETED,
	STATUS.APPROVED,
	STATUS.REJECTED,
]

function normalizeStatus(status) {
	const raw = String(status || '').trim()
	const upper = raw.toUpperCase()
	if (upper === 'UNDER PROCESS' || upper === 'UNDER_PROCESS') return STATUS.SUBMITTED
	if (raw === 'Under process') return STATUS.SUBMITTED
	return upper
}

function formatTimestamp(value) {
	if (!value) return null
	try {
		return new Date(value).toLocaleString('en-IN', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	} catch {
		return null
	}
}

function statusRank(status) {
	const idx = WORKFLOW_ORDER.indexOf(status)
	return idx === -1 ? 0 : idx
}

function resolveState(stepStatus, currentStatus, isTerminal) {
	const stepRank = statusRank(stepStatus)
	const currentRank = statusRank(currentStatus)

	if (currentStatus === STATUS.REJECTED) {
		if (stepStatus === STATUS.REJECTED) return 'warning'
		if (stepRank < statusRank(STATUS.SUBMITTED)) return 'pending'
		return stepRank <= currentRank ? 'completed' : 'pending'
	}

	if (stepRank < currentRank) return 'completed'
	if (stepRank === currentRank && !isTerminal) return 'in_progress'
	if (stepRank === currentRank && isTerminal) return 'completed'
	return 'pending'
}

export function isTenancyApplication(application = {}) {
	const type = String(
		application.form_type || application.application_type || application.form_key || ''
	).toLowerCase()
	return (
		application.source_type === 'tenancy' ||
		type.includes(APPLICATION_TYPES.TENANCY_CERTIFICATE) ||
		type.includes('tenancy')
	)
}

function buildTenancyPartySubsteps(application) {
	const initiatorDone = Boolean(application.initiator_completed)
	const secondDone = Boolean(application.second_party_completed)
	const initiatorLabel =
		application.initiator_role === 'LANDLORD' ? 'Landlord details' : 'Tenant details'
	const secondLabel =
		application.initiator_role === 'LANDLORD' ? 'Tenant details' : 'Landlord details'

	return [
		{
			id: 'initiator',
			title: initiatorLabel,
			state: initiatorDone ? 'completed' : 'in_progress',
		},
		{
			id: 'second-party',
			title: secondLabel,
			state: secondDone ? 'completed' : initiatorDone ? 'in_progress' : 'pending',
		},
	]
}

function buildFromMovementHistory(application, currentStatus) {
	const history = application.movement_history || []
	const steps = history.map((entry, index) => {
		const entryStatus = normalizeStatus(entry.status)
		const isLast = index === history.length - 1
		const isTerminal = [STATUS.COMPLETED, STATUS.APPROVED, STATUS.REJECTED].includes(currentStatus)

		let state = 'completed'
		if (isLast) {
			if (currentStatus === STATUS.REJECTED) state = 'warning'
			else if (isTerminal) state = 'completed'
			else state = 'in_progress'
		}

		return {
			id: `movement-${index}`,
			title: entry.action || STATUS_LABELS[entryStatus] || entry.status || 'Status update',
			description: entry.current_with ? `Held with ${entry.current_with}` : undefined,
			timestamp: formatTimestamp(entry.moved_at),
			state,
			badge: state === 'in_progress' ? 'in-progress' : state === 'warning' ? 'rejected' : state,
		}
	})

	if (currentStatus === STATUS.REJECTED && !steps.some((s) => s.state === 'warning')) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message || 'See remarks from the reviewing officer.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
	}

	if (application.uid && currentStatus === STATUS.COMPLETED) {
		steps.push({
			id: 'uin',
			title: 'UIN issued',
			description: application.uid ? `Unique ID: ${application.uid}` : undefined,
			state: 'completed',
			badge: 'completed',
		})
	}

	return steps
}

function buildTenancySteps(application, currentStatus) {
	const steps = []

	if (currentStatus === STATUS.DRAFT || Number(application.wizard_step) > 0) {
		steps.push({
			id: 'draft',
			title: 'Application draft',
			description:
				Number(application.wizard_step) > 0
					? `Form progress: step ${application.wizard_step} of 4`
					: 'Saved but not yet submitted.',
			timestamp: formatTimestamp(application.updated_at),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		})
	}

	const partyStep = {
		id: 'parties',
		title: 'Landlord & tenant details',
		description: 'Both parties must complete their sections.',
		substeps: buildTenancyPartySubsteps(application),
		state: resolveState(
			STATUS.PARTIAL,
			currentStatus,
			[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		),
		badge:
			currentStatus === STATUS.PARTIAL
				? 'in-progress'
				: statusRank(currentStatus) > statusRank(STATUS.PARTIAL)
					? 'completed'
					: 'pending',
	}

	if (
		currentStatus === STATUS.PARTIAL ||
		currentStatus === STATUS.DRAFT ||
		!application.initiator_completed ||
		!application.second_party_completed
	) {
		steps.push(partyStep)
	}

	steps.push({
		id: 'submitted',
		title: 'Submitted to Rent Authority',
		description: application.current_with
			? `Currently with ${application.current_with}`
			: 'Queued for departmental processing.',
		timestamp: formatTimestamp(application.created_at),
		state: resolveState(
			STATUS.SUBMITTED,
			currentStatus,
			[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		),
		badge:
			currentStatus === STATUS.SUBMITTED || currentStatus === STATUS.UNDER_PROCESS
				? 'in-progress'
				: statusRank(currentStatus) > statusRank(STATUS.SUBMITTED)
					? 'completed'
					: 'pending',
	})

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message || 'Contact the helpdesk for clarification.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
		return steps
	}

	steps.push({
		id: 'completed',
		title: application.uid ? 'UIN issued' : 'Certificate completed',
		description: application.uid
			? `Your Unique Identification Number is ${application.uid}.`
			: 'Final approval and certificate issuance.',
		timestamp: formatTimestamp(application.approved_at || application.updated_at),
		state: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
			? 'completed'
			: 'pending',
		badge: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
	})

	return steps
}

function buildServiceFormSteps(application, currentStatus) {
	const steps = [
		{
			id: 'draft',
			title: 'Draft saved',
			description: 'Application saved on the portal.',
			timestamp: formatTimestamp(application.updated_at),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		},
		{
			id: 'submitted',
			title: 'Submitted by applicant',
			description: 'Received in the district queue.',
			timestamp: formatTimestamp(application.created_at),
			state: resolveState(STATUS.SUBMITTED, currentStatus, false),
			badge:
				currentStatus === STATUS.SUBMITTED
					? 'in-progress'
					: statusRank(currentStatus) > statusRank(STATUS.SUBMITTED)
						? 'completed'
						: 'pending',
		},
		{
			id: 'assistant',
			title: 'Assistant review',
			description: application.forwarded_by?.name
				? `Forwarded by ${application.forwarded_by.name}`
				: 'Verified by the assistant before principal review.',
			timestamp: formatTimestamp(application.forwarded_at),
			state: resolveState(STATUS.IN_REVIEW, currentStatus, false),
			badge:
				currentStatus === STATUS.SUBMITTED
					? 'in-progress'
					: statusRank(currentStatus) >= statusRank(STATUS.IN_REVIEW)
						? 'completed'
						: 'pending',
		},
		{
			id: 'principal',
			title: 'Principal officer review',
			description: application.approved_by?.name
				? `Decision by ${application.approved_by.name}`
				: 'Final scrutiny and approval.',
			timestamp: formatTimestamp(application.approved_at),
			state:
				currentStatus === STATUS.IN_REVIEW
					? 'in_progress'
					: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
						? 'completed'
						: 'pending',
			badge:
				currentStatus === STATUS.IN_REVIEW
					? 'in-progress'
					: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
						? 'completed'
						: 'pending',
		},
	]

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message || 'Reason shared with the applicant.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
		return steps.filter((step) => step.id !== 'completed')
	}

	steps.push({
		id: 'completed',
		title: 'Completed',
		description: 'Application processed successfully.',
		timestamp: formatTimestamp(application.approved_at),
		state: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
		badge: [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus) ? 'completed' : 'pending',
	})

	if (currentStatus !== STATUS.DRAFT) {
		return steps.filter((step) => step.id !== 'draft')
	}

	return steps
}

/**
 * Build timeline steps for the status progress modal.
 * @param {object} application Row from list APIs
 * @returns {{ steps: object[], currentLabel: string, applicationNo: string }}
 */
export function buildApplicationStatusProgress(application = {}) {
	const currentStatus = normalizeStatus(application.status)
	const isTenancy = isTenancyApplication(application)

	let steps = []
	if (Array.isArray(application.movement_history) && application.movement_history.length > 0) {
		steps = buildFromMovementHistory(application, currentStatus)
	} else if (isTenancy) {
		steps = buildTenancySteps(application, currentStatus)
	} else {
		steps = buildServiceFormSteps(application, currentStatus)
	}

	return {
		steps,
		currentLabel: STATUS_LABELS[currentStatus] || application.status || 'Unknown',
		applicationNo: application.application_no || '—',
		formLabel:
			application.application_type ||
			application.form_type ||
			(isTenancy ? 'Tenancy certificate' : 'Application'),
	}
}

import { STATUS, STATUS_LABELS } from '../constants/status'
import { APPLICATION_TYPES, APPLICATION_LABELS } from '../constants/application'
import { ASSISTANT_ROLES, PRINCIPAL_ROLES, ROLES } from '../constants/roles'
import { ROLE_LABELS, getRoleLabel } from '../constants/roleLabels'

const RENT_AUTHORITY_FORM_TYPES = new Set([
	APPLICATION_TYPES.RENT_AUTHORITY_FILING,
	APPLICATION_TYPES.RENT_REVISION,
	APPLICATION_TYPES.OTHER_CHARGES_REVISION,
	APPLICATION_TYPES.VALUER_APPOINTMENT,
])

const RENT_COURT_FORM_TYPES = new Set([
	APPLICATION_TYPES.RENT_COURT_POSSESSION,
	APPLICATION_TYPES.RENT_COURT_FILING,
	APPLICATION_TYPES.RENT_COURT_APPEAL,
])

const RENT_TRIBUNAL_FORM_TYPES = new Set([APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL])

function resolveServiceFormType(application = {}) {
	const candidates = [
		application.form_type,
		application.form_key,
		application.application_type,
	]
		.map((value) => String(value || '').trim())
		.filter(Boolean)

	for (const value of candidates) {
		if (Object.values(APPLICATION_TYPES).includes(value)) return value
	}

	const blob = candidates.join(' ').toLowerCase()
	if (blob.includes(APPLICATION_TYPES.VALUER_APPOINTMENT) || blob.includes('form-i-b') || blob.includes('valuer')) {
		return APPLICATION_TYPES.VALUER_APPOINTMENT
	}
	if (
		blob.includes(APPLICATION_TYPES.OTHER_CHARGES_REVISION) ||
		blob.includes('form-i-a') ||
		blob.includes('other charges')
	) {
		return APPLICATION_TYPES.OTHER_CHARGES_REVISION
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_REVISION) ||
		/\bform-i\b/.test(blob) ||
		blob.includes('rent revision') ||
		blob.includes('fixation of rent')
	) {
		return APPLICATION_TYPES.RENT_REVISION
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_COURT_POSSESSION) ||
		blob.includes('form-ii') ||
		blob.includes('possession')
	) {
		return APPLICATION_TYPES.RENT_COURT_POSSESSION
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_COURT_FILING) ||
		blob.includes('form-iii') ||
		blob.includes('filed before the rent court')
	) {
		return APPLICATION_TYPES.RENT_COURT_FILING
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_AUTHORITY_FILING) ||
		blob.includes('form-iv') ||
		blob.includes('filed before the rent authority')
	) {
		return APPLICATION_TYPES.RENT_AUTHORITY_FILING
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_COURT_APPEAL) ||
		blob.includes('form-v') ||
		blob.includes('appeal against rent authority') ||
		blob.includes('appeal before the rent court')
	) {
		return APPLICATION_TYPES.RENT_COURT_APPEAL
	}
	if (
		blob.includes(APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL) ||
		blob.includes('form-vi') ||
		blob.includes('tribunal')
	) {
		return APPLICATION_TYPES.RENT_TRIBUNAL_APPEAL
	}
	return ''
}

function getServiceOfficeProfile(application = {}) {
	const formType = resolveServiceFormType(application)
	if (RENT_TRIBUNAL_FORM_TYPES.has(formType)) {
		return {
			formType,
			office: ROLE_LABELS[ROLES.RENT_TRIBUNAL],
			assistant: ROLE_LABELS[ROLES.RT_ASSISTANT],
			isAppeal: true,
		}
	}
	if (RENT_COURT_FORM_TYPES.has(formType)) {
		return {
			formType,
			office: ROLE_LABELS[ROLES.RENT_COURT],
			assistant: ROLE_LABELS[ROLES.RC_ASSISTANT],
			isAppeal: formType === APPLICATION_TYPES.RENT_COURT_APPEAL,
		}
	}
	return {
		formType,
		office: ROLE_LABELS[ROLES.RENT_AUTHORITY],
		assistant: ROLE_LABELS[ROLES.RA_ASSISTANT],
		isAppeal: false,
	}
}

const WORKFLOW_ORDER = [
	STATUS.DRAFT,
	STATUS.PARTIAL,
	STATUS.SUBMITTED,
	STATUS.IN_REVIEW,
	STATUS.VALUER_ASSIGNED,
	STATUS.VALUER_REPORT_SUBMITTED,
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

function timestampIfReached(state, value) {
	if (state === 'pending') return null
	return formatTimestamp(value)
}

function issuedUin(application) {
	const value = String(application?.uid || application?.uin || '').trim()
	if (!value || value === '.' || value === '-' || value === '—') return ''
	return value
}

function statusRank(status) {
	const idx = WORKFLOW_ORDER.indexOf(status)
	return idx === -1 ? 0 : idx
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
			note: initiatorDone ? 'Done' : 'Waiting',
			state: initiatorDone ? 'completed' : 'in_progress',
		},
		{
			id: 'second-party',
			title: secondLabel,
			note: secondDone ? 'Done' : 'Waiting',
			state: secondDone ? 'completed' : initiatorDone ? 'in_progress' : 'pending',
		},
	]
}

function tenancyPartyDescription(application, bothPartiesDone) {
	if (bothPartiesDone) return 'Both parties have completed their sections.'

	const initiatorDone = Boolean(application.initiator_completed)
	const initiatorName = application.initiator_role === 'LANDLORD' ? 'landlord' : 'tenant'
	const secondName = application.initiator_role === 'LANDLORD' ? 'tenant' : 'landlord'

	if (initiatorDone) {
		return `The ${initiatorName} has finished. Waiting for the ${secondName} to complete their section.`
	}

	return 'Both parties must complete their sections before the application is filed.'
}

function tenancyNextHint(application, currentStatus) {
	const initiatorDone = Boolean(application.initiator_completed)
	const secondDone = Boolean(application.second_party_completed)
	const secondName = application.initiator_role === 'LANDLORD' ? 'tenant' : 'landlord'

	if (currentStatus === STATUS.PARTIAL) {
		if (!initiatorDone) return 'Next: complete your remaining details so the other party can join.'
		if (!secondDone) {
			return `Next: waiting for the ${secondName} to complete their details. Filing starts only after both sides finish.`
		}
	}

	if (currentStatus === STATUS.SUBMITTED || currentStatus === STATUS.IN_REVIEW) {
		return 'Next: the office is generating your Unique Identification Number.'
	}

	return null
}

function displayStatusLabel(status, application = {}) {
	if (status === STATUS.COMPLETED || status === STATUS.APPROVED) return 'Approved'
	if (
		isTenancyApplication(application) &&
		[STATUS.SUBMITTED, STATUS.IN_REVIEW, STATUS.UNDER_PROCESS].includes(status)
	) {
		return 'In review'
	}
	if ([STATUS.IN_REVIEW, STATUS.VALUER_ASSIGNED, STATUS.VALUER_REPORT_SUBMITTED].includes(status)) {
		return 'In review'
	}
	if (status === STATUS.UNDER_PROCESS) return STATUS_LABELS[STATUS.SUBMITTED]
	return STATUS_LABELS[status] || status || 'Unknown'
}

function statusTone(status, application = {}) {
	if ([STATUS.COMPLETED, STATUS.APPROVED].includes(status)) return 'success'
	if (status === STATUS.REJECTED || status === STATUS.CANCELLED) return 'danger'
	if (
		isTenancyApplication(application) &&
		[STATUS.SUBMITTED, STATUS.IN_REVIEW, STATUS.UNDER_PROCESS].includes(status)
	) {
		return 'review'
	}
	if (
		[
			STATUS.IN_REVIEW,
			STATUS.VALUER_ASSIGNED,
			STATUS.VALUER_REPORT_SUBMITTED,
		].includes(status)
	) {
		return 'review'
	}
	if ([STATUS.DRAFT, STATUS.PARTIAL, STATUS.PENDING].includes(status)) return 'warning'
	if (status === STATUS.WITHDRAWN) return 'muted'
	return 'submitted'
}

function isApprovedStatus(status) {
	return [STATUS.COMPLETED, STATUS.APPROVED].includes(status)
}

function buildTenancySteps(application, currentStatus) {
	const steps = []
	const approved = isApprovedStatus(currentStatus)
	const bothPartiesDone =
		Boolean(application.initiator_completed) && Boolean(application.second_party_completed)
	const filed = statusRank(currentStatus) >= statusRank(STATUS.SUBMITTED)

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

	const partiesState =
		currentStatus === STATUS.PARTIAL || (currentStatus === STATUS.DRAFT && !bothPartiesDone)
			? 'in_progress'
			: bothPartiesDone || filed
				? 'completed'
				: 'pending'
	const officeWorking =
		currentStatus === STATUS.SUBMITTED || currentStatus === STATUS.IN_REVIEW
	const reviewState =
		approved || (currentStatus === STATUS.REJECTED && filed)
			? 'completed'
			: officeWorking
				? 'in_progress'
				: 'pending'
	const assistantDone = filed && currentStatus !== STATUS.SUBMITTED

	steps.push({
		id: 'parties',
		title: 'Landlord & tenant details',
		description: tenancyPartyDescription(application, bothPartiesDone),
		substeps: buildTenancyPartySubsteps(application),
		state: partiesState,
		badge:
			currentStatus === STATUS.PARTIAL
				? 'in-progress'
				: bothPartiesDone || filed
					? 'completed'
					: 'pending',
	})

	steps.push({
		id: 'review',
		title: 'In review',
		description: approved
			? 'The office completed review and issued the UIN.'
			: officeWorking
				? 'Both parties have filed. The office is generating your Unique Identification Number.'
				: 'Starts after both parties finish. The office then generates the UIN.',
		substeps: [
			{
				id: 'assistant',
				title: 'Assistant verification',
				note:
					currentStatus === STATUS.SUBMITTED
						? 'In progress'
						: assistantDone || approved
							? 'Done'
							: 'Waiting',
				state:
					currentStatus === STATUS.SUBMITTED
						? 'in_progress'
						: assistantDone || approved
							? 'completed'
							: 'pending',
			},
			{
				id: 'authority',
				title: 'Rent Authority decision',
				note:
					currentStatus === STATUS.IN_REVIEW ? 'In progress' : approved ? 'Done' : 'Waiting',
				state:
					currentStatus === STATUS.IN_REVIEW
						? 'in_progress'
						: approved
							? 'completed'
							: 'pending',
			},
		],
		timestamp: timestampIfReached(reviewState, application.created_at || application.forwarded_at),
		state: reviewState,
		badge: officeWorking ? 'in-progress' : approved ? 'completed' : 'pending',
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
		return currentStatus === STATUS.DRAFT ? steps : steps.filter((step) => step.id !== 'draft')
	}

	const uin = issuedUin(application)
	const uinState = approved && uin ? 'completed' : 'pending'

	steps.push({
		id: 'uin',
		title: uin ? 'UIN issued' : 'UIN',
		description: uin
			? `Your Unique Identification Number is ${uin}.`
			: 'Not issued yet. This number appears after the office completes review.',
		timestamp: timestampIfReached(uinState, application.approved_at),
		state: uinState,
		badge: uinState === 'completed' ? 'completed' : 'pending',
	})

	return currentStatus === STATUS.DRAFT ? steps : steps.filter((step) => step.id !== 'draft')
}

function serviceNextHint(application, currentStatus) {
	const { office } = getServiceOfficeProfile(application)

	if (currentStatus === STATUS.SUBMITTED) {
		return `Next: the ${office} assistant is verifying this application.`
	}
	if (currentStatus === STATUS.IN_REVIEW) {
		return `Next: ${office} is reviewing this application.`
	}
	if (currentStatus === STATUS.VALUER_ASSIGNED) {
		return 'Next: a valuer is preparing the valuation report.'
	}
	if (currentStatus === STATUS.VALUER_REPORT_SUBMITTED) {
		return `Next: ${office} is taking the final decision on the valuer report.`
	}
	return null
}

function isAssistantComplete(application, currentStatus) {
	if (Boolean(application.forwarded_at)) return true
	return [
		STATUS.IN_REVIEW,
		STATUS.VALUER_ASSIGNED,
		STATUS.VALUER_REPORT_SUBMITTED,
		STATUS.COMPLETED,
		STATUS.APPROVED,
	].includes(currentStatus)
}

function citizenAssistantDescription(application, currentStatus) {
	const { office, assistant } = getServiceOfficeProfile(application)
	if (isForwardedToOffice(application, currentStatus)) {
		return `Verified by the ${assistant} and sent to ${office}.`
	}
	if (currentStatus === STATUS.SUBMITTED) {
		return `With the ${assistant} for verification.`
	}
	return `The ${assistant} verifies the application after you submit.`
}

function getOfficeReviewLabel(application) {
	return getServiceOfficeProfile(application).office
}

function buildOfficeReviewDescription(application, currentStatus) {
	const office = getOfficeReviewLabel(application)
	const at = formatTimestamp(application.forwarded_at)

	if ([STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)) {
		const by = application.approved_by?.name
			? `Approved by ${application.approved_by.name} (${office}).`
			: `Final decision recorded by ${office}.`
		return application.approval_message
			? `${by} Message: ${application.approval_message}`
			: by
	}

	if (currentStatus === STATUS.VALUER_REPORT_SUBMITTED) {
		return `Valuer report received. ${office} is reviewing findings before a final decision.`
	}

	if (currentStatus === STATUS.VALUER_ASSIGNED) {
		const valuerName = application.assigned_valuer?.name
		return valuerName
			? `File with valuer ${valuerName} for valuation report.`
			: `File assigned to a valuer for a valuation report.`
	}

	if (currentStatus === STATUS.IN_REVIEW) {
		return at
			? `Under review by ${office} since ${at}.`
			: `Awaiting final decision by ${office}.`
	}

	return `After assistant verification, the file is reviewed by ${office}.`
}

function buildValuerAppointmentSteps(application, currentStatus) {
	const pastSubmitted = statusRank(currentStatus) > statusRank(STATUS.DRAFT)
	const assistantDone = isAssistantComplete(application, currentStatus)
	const approved = [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
	const { office, assistant } = getServiceOfficeProfile(application)
	const valuerName = application.assigned_valuer?.name
	const hasValuer =
		Boolean(application.assigned_valuer_id) ||
		[
			STATUS.VALUER_ASSIGNED,
			STATUS.VALUER_REPORT_SUBMITTED,
			STATUS.COMPLETED,
			STATUS.APPROVED,
		].includes(currentStatus)

	const firstReviewState =
		currentStatus === STATUS.IN_REVIEW
			? 'in_progress'
			: hasValuer || approved
				? 'completed'
				: 'pending'

	const valuerAssignedState =
		currentStatus === STATUS.VALUER_ASSIGNED ||
		(hasValuer && currentStatus !== STATUS.IN_REVIEW)
			? 'completed'
			: 'pending'

	const valuerReportState =
		currentStatus === STATUS.VALUER_ASSIGNED
			? 'in_progress'
			: currentStatus === STATUS.VALUER_REPORT_SUBMITTED ||
				  (approved && Boolean(application.valuer_report)) ||
				  statusRank(currentStatus) > statusRank(STATUS.VALUER_REPORT_SUBMITTED)
				? 'completed'
				: 'pending'

	const finalDecisionState =
		currentStatus === STATUS.VALUER_REPORT_SUBMITTED
			? 'in_progress'
			: approved
				? 'completed'
				: 'pending'

	const submittedState = pastSubmitted ? 'completed' : 'pending'
	const assistantState =
		currentStatus === STATUS.SUBMITTED ? 'in_progress' : assistantDone ? 'completed' : 'pending'

	const steps = [
		{
			id: 'draft',
			title: 'Draft saved',
			description: 'Application saved on the portal.',
			timestamp: timestampIfReached(
				currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
				application.updated_at
			),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		},
		{
			id: 'submitted',
			title: 'Submitted',
			description: pastSubmitted
				? `Your application was filed with ${office}.`
				: 'Waiting for you to submit.',
			timestamp: timestampIfReached(submittedState, application.created_at),
			state: submittedState,
			badge: submittedState === 'completed' ? 'completed' : 'pending',
		},
		{
			id: 'assistant',
			title: assistant,
			description: citizenAssistantDescription(application, currentStatus),
			timestamp: timestampIfReached(assistantState, application.forwarded_at),
			state: assistantState,
			badge: assistantState === 'in_progress' ? 'in-progress' : assistantState,
		},
		{
			id: 'office-review',
			title: `${office} review`,
			description:
				currentStatus === STATUS.IN_REVIEW
					? `${office} is reviewing the application and may appoint a valuer.`
					: firstReviewState === 'completed'
						? `Reviewed by ${office}. A valuer was assigned.`
						: `Starts after assistant verification.`,
			timestamp: timestampIfReached(firstReviewState, application.forwarded_at),
			state: firstReviewState,
			badge: firstReviewState === 'in_progress' ? 'in-progress' : firstReviewState,
		},
		{
			id: 'valuer-assigned',
			title: 'Valuer assignment',
			description: valuerName
				? `Assigned to ${valuerName}.`
				: hasValuer
					? 'Assigned to a district valuer.'
					: `${office} assigns a valuer when valuation is required.`,
			timestamp: timestampIfReached(valuerAssignedState, application.valuer_assigned_at),
			state: valuerAssignedState,
			badge: valuerAssignedState === 'in_progress' ? 'in-progress' : valuerAssignedState,
		},
		{
			id: 'valuer-report',
			title: 'Valuer report',
			description:
				currentStatus === STATUS.VALUER_ASSIGNED
					? 'Waiting for the valuation report from the assigned valuer.'
					: valuerReportState === 'completed'
						? 'Valuation report submitted to Rent Authority.'
						: 'The valuer submits findings for the final decision.',
			timestamp: timestampIfReached(
				valuerReportState,
				application.valuer_report_submitted_at ||
					(application.valuer_report ? application.updated_at : null)
			),
			state: valuerReportState,
			badge: valuerReportState === 'in_progress' ? 'in-progress' : valuerReportState,
		},
		{
			id: 'final-decision',
			title: 'Final decision',
			description: approved
				? `Approved by ${office}.`
				: currentStatus === STATUS.VALUER_REPORT_SUBMITTED
					? `Valuer report received. ${office} is taking the final decision.`
					: `Starts after the valuer report is submitted.`,
			timestamp: timestampIfReached(finalDecisionState, application.approved_at),
			state: finalDecisionState,
			badge: finalDecisionState === 'in_progress' ? 'in-progress' : finalDecisionState,
		},
	]

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message
				? `Reason: ${application.rejection_message}`
				: 'Reason shared with the applicant.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
	} else {
		steps.push({
			id: 'completed',
			title: 'Approved',
			description: application.approval_message
				? `Approved. Message: ${application.approval_message}`
				: 'Recorded when the office completes the final decision.',
			timestamp: timestampIfReached(approved ? 'completed' : 'pending', application.approved_at),
			state: approved ? 'completed' : 'pending',
			badge: approved ? 'completed' : 'pending',
		})
	}

	if (currentStatus !== STATUS.DRAFT) {
		return steps.filter((step) => step.id !== 'draft')
	}

	return steps
}

function buildServiceFormSteps(application, currentStatus) {
	const { formType, office, assistant, isAppeal } = getServiceOfficeProfile(application)
	if (formType === APPLICATION_TYPES.VALUER_APPOINTMENT) {
		return buildValuerAppointmentSteps(application, currentStatus)
	}

	const pastSubmitted = statusRank(currentStatus) > statusRank(STATUS.DRAFT)
	const assistantDone = isAssistantComplete(application, currentStatus)
	const approved = [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
	const officeWorking = currentStatus === STATUS.SUBMITTED || currentStatus === STATUS.IN_REVIEW
	const reviewState =
		approved || (currentStatus === STATUS.REJECTED && assistantDone)
			? 'completed'
			: officeWorking
				? 'in_progress'
				: 'pending'
	const submittedState = pastSubmitted ? 'completed' : 'pending'
	const assistantSubState =
		currentStatus === STATUS.SUBMITTED ? 'in_progress' : assistantDone ? 'completed' : 'pending'
	const officeSubState =
		currentStatus === STATUS.IN_REVIEW ? 'in_progress' : approved ? 'completed' : 'pending'
	const outcomeTitle = isAppeal ? 'Decision' : 'Approved'
	const outcomePending = isAppeal
		? `Recorded when ${office} decides the appeal.`
		: `Recorded when ${office} completes its decision.`
	const outcomeDone = application.approval_message
		? `${isAppeal ? 'Decided' : 'Approved'}. Message: ${application.approval_message}`
		: isAppeal
			? `Decided by ${office}.`
			: `Approved by ${office}.`

	const steps = [
		{
			id: 'draft',
			title: 'Draft saved',
			description: 'Application saved on the portal.',
			timestamp: timestampIfReached(
				currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
				application.updated_at
			),
			state: currentStatus === STATUS.DRAFT ? 'in_progress' : 'completed',
			badge: currentStatus === STATUS.DRAFT ? 'in-progress' : 'completed',
		},
		{
			id: 'submitted',
			title: 'Submitted',
			description: pastSubmitted
				? `Your application was filed with ${office}.`
				: 'Waiting for you to submit.',
			timestamp: timestampIfReached(submittedState, application.created_at),
			state: submittedState,
			badge: submittedState === 'completed' ? 'completed' : 'pending',
		},
		{
			id: 'review',
			title: 'In review',
			description: approved
				? `${office} completed review.`
				: officeWorking
					? `${office} is reviewing your application.`
					: `Starts after you submit. ${assistant} verifies first, then ${office} decides.`,
			substeps: [
				{
					id: 'assistant',
					title: assistant,
					note:
						assistantSubState === 'in_progress'
							? 'In progress'
							: assistantSubState === 'completed'
								? 'Done'
								: 'Waiting',
					state: assistantSubState,
				},
				{
					id: 'office',
					title: `${office} decision`,
					note:
						officeSubState === 'in_progress'
							? 'In progress'
							: officeSubState === 'completed'
								? 'Done'
								: 'Waiting',
					state: officeSubState,
				},
			],
			timestamp: timestampIfReached(reviewState, application.forwarded_at || application.created_at),
			state: reviewState,
			badge: officeWorking ? 'in-progress' : approved ? 'completed' : 'pending',
		},
	]

	if (currentStatus === STATUS.REJECTED) {
		steps.push({
			id: 'rejected',
			title: 'Application rejected',
			description: application.rejection_message
				? `Reason: ${application.rejection_message}`
				: 'Reason shared with the applicant.',
			timestamp: formatTimestamp(application.rejected_at),
			state: 'warning',
			badge: 'rejected',
		})
		return currentStatus !== STATUS.DRAFT
			? steps.filter((step) => step.id !== 'draft')
			: steps
	}

	steps.push({
		id: 'completed',
		title: outcomeTitle,
		description: approved ? outcomeDone : outcomePending,
		timestamp: timestampIfReached(approved ? 'completed' : 'pending', application.approved_at),
		state: approved ? 'completed' : 'pending',
		badge: approved ? 'completed' : 'pending',
	})

	if (currentStatus !== STATUS.DRAFT) {
		return steps.filter((step) => step.id !== 'draft')
	}

	return steps
}


function getForwardTargetLabel(application, viewerRole) {
	const assigned = application.assigned_to_role
	if (assigned) return getRoleLabel(assigned)
	if (viewerRole === ROLES.RA_ASSISTANT) return ROLE_LABELS[ROLES.RENT_AUTHORITY]
	if (viewerRole === ROLES.RC_ASSISTANT) return ROLE_LABELS[ROLES.RENT_COURT]
	if (viewerRole === ROLES.RT_ASSISTANT) return ROLE_LABELS[ROLES.RENT_TRIBUNAL]
	return getOfficeReviewLabel(application)
}

function isForwardedToOffice(application, currentStatus) {
	return (
		Boolean(application.forwarded_at) ||
		currentStatus === STATUS.IN_REVIEW ||
		currentStatus === STATUS.VALUER_ASSIGNED ||
		currentStatus === STATUS.VALUER_REPORT_SUBMITTED ||
		[STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
	)
}

function buildAssistantReviewDescription(application, viewerRole, currentStatus) {
	const target = getForwardTargetLabel(application, viewerRole)
	const forwarded = isForwardedToOffice(application, currentStatus)
	const at = formatTimestamp(application.forwarded_at)

	if (forwarded && target) {
		const by = application.forwarded_by?.name
			? ` Forwarded by ${application.forwarded_by.name}.`
			: ''
		const remarks = application.forward_remarks
			? ` Remarks: ${application.forward_remarks}`
			: ''
		return at
			? `Forwarded to ${target} on ${at}.${by}${remarks}`
			: `Forwarded to ${target} for final review.${by}${remarks}`
	}

	if (target) {
		return `Not yet forwarded. After verification, send to ${target} or reject with a reason.`
	}

	return 'Verify the application, then forward or reject with a reason.'
}

function getPrincipalOfficeLabel(viewerRole) {
	return ROLE_LABELS[viewerRole] || getRoleLabel(viewerRole) || 'Office'
}

function adaptStepsForViewer(steps, viewerRole, application, currentStatus) {
	let result = [...steps]

	if (viewerRole && ASSISTANT_ROLES.includes(viewerRole)) {
		const showCompleted = [STATUS.COMPLETED, STATUS.APPROVED].includes(currentStatus)
		const forwarded = isForwardedToOffice(application, currentStatus)

		result = result
			.filter((step) => {
				if (step.id === 'principal' || step.id === 'office-review' || step.id === 'final-decision') return false
				if (step.id === 'completed' && !showCompleted) return false
				const title = String(step.title || '').toLowerCase()
				if (title.includes('principal officer')) return false
				if (title === 'completed' && !showCompleted) return false
				return true
			})
			.map((step) => {
				if (step.id !== 'assistant') return step
				const target = getForwardTargetLabel(application, viewerRole)
				const forwarded = isForwardedToOffice(application, currentStatus)
				return {
					...step,
					title:
						forwarded && target ? `Forwarded to ${target}` : 'Assistant review',
					description: buildAssistantReviewDescription(
						application,
						viewerRole,
						currentStatus
					),
					state: forwarded
						? 'completed'
						: currentStatus === STATUS.SUBMITTED
							? 'in_progress'
							: step.state,
					badge: forwarded
						? 'completed'
						: currentStatus === STATUS.SUBMITTED
							? 'in-progress'
							: step.badge,
					timestamp: forwarded
						? formatTimestamp(application.forwarded_at) || step.timestamp
						: step.timestamp,
				}
			})
	}

	if (viewerRole && PRINCIPAL_ROLES.includes(viewerRole)) {
		const office = getPrincipalOfficeLabel(viewerRole)

		result = result
			.filter((step) => {
				const title = String(step.title || '').toLowerCase()
				return !title.includes('principal officer') && step.id !== 'principal'
			})
			.map((step) => {
				if (step.id !== 'office-review' && step.id !== 'final-decision') return step

				return {
					...step,
					title: step.id === 'final-decision' ? 'Final decision' : `${office} review`,
					description: application.approved_by?.name
						? `Decision recorded by ${application.approved_by.name}.`
						: currentStatus === STATUS.IN_REVIEW ||
							  currentStatus === STATUS.VALUER_REPORT_SUBMITTED
							? `Awaiting your decision as ${office}.`
							: `Final scrutiny and approval by ${office}.`,
				}
			})
	}

	if (viewerRole === ROLES.VALUER) {
		result = result
			.filter((step) => {
				if (step.id === 'draft') return false
				return true
			})
			.map((step) => {
				if (step.id === 'valuer-assigned' && currentStatus === STATUS.VALUER_ASSIGNED) {
					return {
						...step,
						title: 'Assigned to you',
						description: 'Submit your valuation report for this Form I-B.',
						state: 'in_progress',
						badge: 'in-progress',
					}
				}
				if (step.id === 'valuer-report' && currentStatus === STATUS.VALUER_ASSIGNED) {
					return {
						...step,
						title: 'Your valuation report',
						description: 'Pending — post your findings from the application page.',
						state: 'in_progress',
						badge: 'in-progress',
					}
				}
				if (
					step.id === 'valuer-report' &&
					currentStatus === STATUS.VALUER_REPORT_SUBMITTED
				) {
					return {
						...step,
						title: 'Your report submitted',
						description: 'Waiting for Rent Authority to record the final decision.',
						state: 'completed',
						badge: 'completed',
					}
				}
				return step
			})
	}

	// Citizens, super admin, district admin: never show legacy principal-officer step
	result = result.filter((step) => {
		if (step.id === 'principal') return false
		const title = String(step.title || '').toLowerCase()
		return !title.includes('principal officer')
	})

	return result
}

/** Office an assistant forwards applications to (by assistant role). */
export function getAssistantForwardOfficeLabel(viewerRole) {
	if (viewerRole === ROLES.RA_ASSISTANT) return ROLE_LABELS[ROLES.RENT_AUTHORITY]
	if (viewerRole === ROLES.RC_ASSISTANT) return ROLE_LABELS[ROLES.RENT_COURT]
	if (viewerRole === ROLES.RT_ASSISTANT) return ROLE_LABELS[ROLES.RENT_TRIBUNAL]
	return 'the reviewing office'
}

/**
 * Build timeline steps for the status progress modal.
 * @param {object} application Row from list APIs
 * @param {{ viewerRole?: string }} options Viewer role for role-specific timelines
 * @returns {{ steps: object[], currentLabel: string, applicationNo: string }}
 */
export function buildApplicationStatusProgress(application = {}, options = {}) {
	const { viewerRole } = options
	const currentStatus = normalizeStatus(application.status)
	const isTenancy = isTenancyApplication(application)

	let steps = []
	if (isTenancy) {
		steps = buildTenancySteps(application, currentStatus)
	} else {
		steps = buildServiceFormSteps(application, currentStatus)
	}

	steps = adaptStepsForViewer(steps, viewerRole, application, currentStatus)

	return {
		steps,
		nextHint: isTenancy
			? tenancyNextHint(application, currentStatus)
			: serviceNextHint(application, currentStatus),
		currentLabel: displayStatusLabel(currentStatus, application),
		currentTone: statusTone(currentStatus, application),
		applicationNo: application.application_no || '—',
		formLabel:
			APPLICATION_LABELS[resolveServiceFormType(application)] ||
			APPLICATION_LABELS[application.form_type] ||
			APPLICATION_LABELS[application.application_type] ||
			application.application_type ||
			application.form_type ||
			(isTenancy ? 'Tenancy certificate' : 'Application'),
	}
}

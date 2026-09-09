import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Info } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import { useServiceFormPreview } from '../hooks/useServiceFormPreview'
import { APPLICATION_TYPES } from '../constants/application'
import DeclarationCheckbox from './forms/DeclarationCheckbox'
import PriorProceedingsField from './forms/PriorProceedingsField'
import { PRIOR_STATUS } from '../constants/priorProceedings'
import {
	DECLARATION,
	VERIFICATION,
	composeVerification,
	declarationText,
} from '../constants/declarations'
import VerificationClause from './forms/VerificationClause'
import { hasProfileDefaults, profileDefaults } from '../utils/profileAutofill'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form5RentCourtFilingPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [rentCourtAt, setRentCourtAt] = useState('')
	const [tenancyUIN, setTenancyUIN] = useState('')

	// The account already holds these. Seeded at mount, not fixed: every one stays editable,
	// and the filer is the one asserting them.
	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [respondentName, setRespondentName] = useState('')
	const [respondentResidentialAddress, setRespondentResidentialAddress] = useState('')

	const [particularsOfApplication, setParticularsOfApplication] = useState('')
	// Paragraph 2 is a declaration the filer accepts, not text they write.
	const [jurisdictionAccepted, setJurisdictionAccepted] = useState(false)
	const [factsOfCase, setFactsOfCase] = useState('')
	const [groundsForRelief, setGroundsForRelief] = useState('')
	// Paragraph 5 is a negative declaration with an affirmative branch, so it is a yes/no
	// answer plus, where the answer is yes, the particulars the form requires.
	const [hasPriorProceedings, setHasPriorProceedings] = useState(null)
	const [priorProceedings, setPriorProceedings] = useState([])
	const [reliefSought, setReliefSought] = useState('')
	const [interimOrderSought, setInterimOrderSought] = useState('')
	const [listOfEnclosures, setListOfEnclosures] = useState('')

	const [signatureName, setSignatureName] = useState(profile.name)
	const [signatureImage, setSignatureImage] = useState(null)
	// The VERIFICATION clause is one sworn sentence, not ten fields, so it is held as one
	// object and rendered as the sentence the Gazette prints. See forms/VerificationClause.
	const [verification, setVerification] = useState({
		name: profile.name,
		relation: 'S/o.',
		relativeName: '',
		age: profile.age,
		address: profile.address,
		place: '',
		paragraphs: {},
	})

	const setVerificationField = useCallback((field, value) => {
		setVerification((current) => ({
			...current,
			[field]: value,
			...(field === 'name' ? { nameEdited: true } : {}),
			...(field === 'address' ? { addressEdited: true } : {}),
		}))
	}, [])

	const setParagraphAnswer = useCallback((number, answer) => {
		setVerification((current) => ({
			...current,
			paragraphs: { ...current.paragraphs, [number]: answer },
		}))
	}, [])

	// Paragraph 1 already names the filer and their address, and the verification opens with the
	// same two facts. They are mirrored across until the filer edits them: a verification naming a
	// different person from the body of the form is a defective filing, and asking for the same
	// thing twice in two places is how that happens.
	useEffect(() => {
		setVerification((current) => (current.nameEdited ? current : { ...current, name: applicantName }))
	}, [applicantName])

	useEffect(() => {
		setVerification((current) =>
			current.addressEdited ? current : { ...current, address: applicantResidentialAddress }
		)
	}, [applicantResidentialAddress])

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-court-filing-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form III submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form III')
			setError(msg)
		}
	})

	const submit = useCallback(async () => {
		setError('')

		if (!jurisdictionAccepted) {
			setError('Accept the declaration at paragraph 2 before filing.')
			return false
		}

		if (hasPriorProceedings === null) {
			setError('Answer paragraph 5 before filing.')
			return false
		}

		if (hasPriorProceedings) {
			const incomplete = priorProceedings.some(
				(entry) =>
					!entry.case_number.trim() ||
					!entry.forum.trim() ||
					(entry.status === PRIOR_STATUS.PENDING
						? !entry.pendency_details.trim()
						: !entry.decision.trim())
			)
			if (priorProceedings.length === 0 || incomplete) {
				setError(
					'Give the case number, the court or authority, and the pendency or decision for every case disclosed at paragraph 5.'
				)
				return false
			}
		}
		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('rent_court_at', rentCourtAt.trim())
			formData.append(
				'tenancy_uin',
				tenancyUIN.trim()
			)

			formData.append('applicant_name', applicantName.trim())
			formData.append(
				'applicant_residential_address',
				applicantResidentialAddress.trim()
			)

			formData.append('respondent_name', respondentName.trim())
			formData.append(
				'respondent_residential_address',
				respondentResidentialAddress.trim()
			)

			if (particularsOfApplication.trim()) {
				formData.append('particulars_of_application', particularsOfApplication.trim())
			}
			formData.append('jurisdiction_declaration_accepted', '1')
			if (factsOfCase.trim()) formData.append('facts_of_case', factsOfCase.trim())
			if (groundsForRelief.trim()) formData.append('grounds_for_relief', groundsForRelief.trim())
			formData.append('has_prior_proceedings', hasPriorProceedings ? '1' : '0')
			if (hasPriorProceedings) {
				priorProceedings.forEach((entry, i) => {
					formData.append(`prior_proceedings[${i}][case_number]`, entry.case_number.trim())
					formData.append(`prior_proceedings[${i}][forum]`, entry.forum.trim())
					if (entry.filing_date) {
						formData.append(`prior_proceedings[${i}][filing_date]`, entry.filing_date)
					}
					formData.append(`prior_proceedings[${i}][status]`, entry.status)
					if (entry.status === PRIOR_STATUS.PENDING) {
						formData.append(
							`prior_proceedings[${i}][pendency_details]`,
							entry.pendency_details.trim()
						)
					} else {
						formData.append(`prior_proceedings[${i}][decision]`, entry.decision.trim())
					}
				})
			}
			if (reliefSought.trim()) formData.append('relief_sought', reliefSought.trim())
			if (interimOrderSought.trim()) {
				formData.append('interim_order_sought', interimOrderSought.trim())
			}
			if (listOfEnclosures.trim()) formData.append('list_of_enclosures', listOfEnclosures.trim())

			formData.append('verification_name', verification.name.trim())
			formData.append('verification_relation', verification.relation)
			formData.append('verification_relative_name', verification.relativeName.trim())
			formData.append('verification_age', String(verification.age))
			formData.append('verification_address', verification.address.trim())
			formData.append('verification_place', verification.place.trim())
			// Sent as an object keyed by paragraph number; the server splits it into the two sets the
			// sentence names. The date is not sent - the server stamps it.
			Object.entries(verification.paragraphs).forEach(([number, answer]) => {
				formData.append(`verification_paragraphs[${number}]`, answer)
			})

			formData.append('signature_name', signatureName.trim())
			if (signatureImage) formData.append('signature_image', signatureImage)

			await mutation.mutateAsync(formData)
			return true
		} catch (err) {
			return false
		} finally {
			setSubmitting(false)
		}
	}, [
		applicantName,
		applicantResidentialAddress,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		listOfEnclosures,
		hasPriorProceedings,
		priorProceedings,
		particularsOfApplication,
		reliefSought,
		rentCourtAt,
		respondentName,
		respondentResidentialAddress,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Tenancy', [
					previewItem('Rent Court at', rentCourtAt),
					previewItem('Tenancy UIN', tenancyUIN),
				]),
				previewSection('Parties', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
					previewItem('Respondent name', respondentName),
					previewItem('Respondent address', respondentResidentialAddress),
				]),
				previewSection('Case details', [
					previewItem('Particulars of application', particularsOfApplication),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_III_JURISDICTION) : ''
					),
					previewItem('Facts of the case', factsOfCase),
					previewItem('Grounds for relief', groundsForRelief),
					previewItem(
						'Matters not previously filed',
						hasPriorProceedings === null
							? ''
							: hasPriorProceedings
								? priorProceedings
										.map(
											(entry, i) =>
												`${i + 1}. ${entry.case_number} before ${entry.forum} - ${
													entry.status === PRIOR_STATUS.PENDING
														? `pending: ${entry.pendency_details}`
														: `disposed: ${entry.decision}`
												}`
										)
										.join('\n')
								: declarationText(DECLARATION.FORM_III_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', listOfEnclosures),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_III, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			applicantName,
			applicantResidentialAddress,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionAccepted,
			listOfEnclosures,
			hasPriorProceedings,
		priorProceedings,
			particularsOfApplication,
			reliefSought,
			rentCourtAt,
			respondentName,
			respondentResidentialAddress,
			signatureImage,
			signatureName,
		verification,
			tenancyUIN,
												]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_FILING, tenancy, user, {
			setTenancyUIN,
			setRentCourtAt,
			setApplicantName,
			setApplicantResidentialAddress,
			setRespondentName,
			setRespondentResidentialAddress,
		})

	return (
		<div className="dashboard-card service-form-panel">
			{error ? <div className="error" role="alert">{error}</div> : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<TenancyUinLookup
					value={tenancyUIN}
					onChange={setTenancyUIN}
					onLoaded={handleTenancyLoaded}
					label="In the matter of Tenancy of Unique Identification Number"
				/>

				<label>
					<span className="label-text required">In the Rent Court at</span>
					<input type="text" value={rentCourtAt} onChange={(e) => setRentCourtAt(e.target.value)} required />
				</label>

				<fieldset className="tenancy-fieldset">
					<legend>A. Name of the Applicant</legend>
					<label>
						<span className="label-text required" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
							Name of the Applicant
							<div className="ground-choice__info-container">
								<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
								<div className="ground-choice__info-popup">
									<span>Add description and the residential address on which the service of notices is to be effected on the Applicant</span>
								</div>
							</div>
						</span>
						<input type="text" value={applicantName} onChange={(e) => setApplicantName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Applicant</span>
						<textarea
							value={applicantResidentialAddress}
							onChange={(e) => setApplicantResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>B. Name of the Respondent</legend>
					<label>
						<span className="label-text required" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
							Name of the Respondent
							<div className="ground-choice__info-container">
								<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
								<div className="ground-choice__info-popup">
									<span>Add description and the residential address on which the service of notices is to be effected on the Respondent(s)</span>
								</div>
							</div>
						</span>
						<input type="text" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} required />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">Residential address of the Respondent</span>
						<textarea
							value={respondentResidentialAddress}
							onChange={(e) => setRespondentResidentialAddress(e.target.value)}
							required
							rows={3}
						/>
					</label>
				</fieldset>

				<fieldset className="tenancy-fieldset">
					<legend>Details of application</legend>
					<label className="tenancy-field-full">
						<span className="label-text required">1. Particulars of application</span>
						<textarea
							required value={particularsOfApplication} onChange={(e) => setParticularsOfApplication(e.target.value)} rows={3} />
					</label>
					<DeclarationCheckbox
						fieldId={DECLARATION.FORM_III_JURISDICTION}
						label="2. Jurisdiction of the Rent Court"
						checked={jurisdictionAccepted}
						onChange={setJurisdictionAccepted}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
							3. Facts of the case
							<div className="ground-choice__info-container">
								<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
								<div className="ground-choice__info-popup">
									<span>Give here a concise statement of facts in a chronological order, each paragraph containing as nearly as possible a separate issue or fact.</span>
								</div>
							</div>
						</span>
						<textarea
							required value={factsOfCase} onChange={(e) => setFactsOfCase(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text required">4. Grounds for relief</span>
						<textarea
							required value={groundsForRelief} onChange={(e) => setGroundsForRelief(e.target.value)} rows={3} />
					</label>
					<PriorProceedingsField
						fieldId={DECLARATION.FORM_III_PRIOR_PROCEEDINGS}
						label="5. Matters not previously filed or pending with any other court"
						hasPrior={hasPriorProceedings}
						onHasPriorChange={setHasPriorProceedings}
						entries={priorProceedings}
						onEntriesChange={setPriorProceedings}
					/>
					<label className="tenancy-field-full">
						<span className="label-text required" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
							6. Relief sought
							<div className="ground-choice__info-container">
								<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
								<div className="ground-choice__info-popup">
									<span>In view of the grounds mentioned in para 4 above, the applicant prays for the following relief(s). Specify below the relief(s) sought explaining the grounds for such relief(s) and the legal provisions, if any, relied upon.</span>
								</div>
							</div>
						</span>
						<textarea
							required value={reliefSought} onChange={(e) => setReliefSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
							7. Interim order, if any prayed for
							<div className="ground-choice__info-container">
								<Info size={16} className="text-muted-foreground" style={{ cursor: 'help' }} />
								<div className="ground-choice__info-popup">
									<span>Pending final decision on the application, the applicant seeks the following interim relief. Give here the nature of the interim relief prayed for.</span>
								</div>
							</div>
						</span>
						<textarea value={interimOrderSought} onChange={(e) => setInterimOrderSought(e.target.value)} rows={3} />
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">8. List of enclosures</span>
						<textarea value={listOfEnclosures} onChange={(e) => setListOfEnclosures(e.target.value)} rows={3} />
					</label>
				</fieldset>

				<VerificationClause
					prefilled={hasProfileDefaults(profile)}
					fieldId={VERIFICATION.FORM_III}
					values={verification}
					onChange={setVerificationField}
					onParagraphChange={setParagraphAnswer}
				/>

				<fieldset className="tenancy-fieldset">
					{/* The Gazette prints "Signature of the Applicant" on all five forms, including the
					  * two appeal forms. Reproduced as printed. */}
					<legend>Signature of the Applicant</legend>
					<label>
						<span className="label-text required">Name against the signature</span>
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
						/>
					</label>
					<label className="tenancy-field-full">
						<span className="label-text">Signature image (optional)</span>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
						/>
					</label>
				</fieldset>

				<div className="form-actions">
					<button type="button" className="ws-btn ws-btn--outline" onClick={onBack} disabled={submitting}>
						Back
					</button>
					<button type="submit" className="ws-btn ws-btn--primary" disabled={submitting}>
						{submitting ? 'Submitting…' : 'Review & submit'}
					</button>
				</div>
			</form>

			<ServiceFormPreviewModal
				open={previewOpen}
				title="Review Form III"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form III"
			/>
		</div>
	)
}




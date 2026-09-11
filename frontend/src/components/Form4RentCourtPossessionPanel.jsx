import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BadgeCheck, FileText, IdCard, Info, PenLine, Scale, Users } from 'lucide-react'
import api, { csrf } from '../api'
import TenancyUinLookup from './forms/TenancyUinLookup'
import ServiceFormPreviewModal from './forms/ServiceFormPreviewModal'
import ServiceFormSection from './forms/ServiceFormSection'
import ServiceFormFieldLabel from './forms/ServiceFormFieldLabel'
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
import {
	describeBasis,
	describeGround,
	EVICTION_BASIS,
	EVICTION_BASIS_OPTIONS,
	EVICTION_GROUND_CLAUSES,
} from '../constants/evictionGrounds'
import { previewItem, previewSection, previewSections } from '../utils/serviceFormPreview'
import { completeServiceFormSubmit, getServiceFormSuccessMessage } from '../utils/serviceFormSubmit'
import { applyTenancyAutofill } from '../utils/tenancyUinAutofill'

export default function Form4RentCourtPossessionPanel({ onBack, serviceMeta, user }) {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')

	const [beforeRentCourt, setBeforeRentCourt] = useState('')

	// The account already holds these. Seeded at mount, not fixed: every one stays editable,
	// and the filer is the one asserting them.
	const profile = useMemo(() => profileDefaults(user), [user])

	const [applicantName, setApplicantName] = useState(profile.name)
	const [applicantResidentialAddress, setApplicantResidentialAddress] = useState(profile.address)

	const [tenancyUIN, setTenancyUIN] = useState('')
	const [tenantName, setTenantName] = useState('')

	// Form II recital: the basis is s. 21(2) or s. 22; s. 21(2) carries clauses (a) to (h).
	const [statutoryBasis, setStatutoryBasis] = useState(EVICTION_BASIS.SECTION_21_2)
	const [evictionGrounds, setEvictionGrounds] = useState([])

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
	const [enclosuresList, setEnclosuresList] = useState('')

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

	const toggleGround = useCallback((clause) => {
		setEvictionGrounds((current) =>
			current.includes(clause)
				? current.filter((c) => c !== clause)
				: [...current, clause]
		)
	}, [])

	const groundsApply = statutoryBasis === EVICTION_BASIS.SECTION_21_2

	const mutation = useMutation({
		mutationFn: async (formData) => {
			await csrf()
			const { data } = await api.post('/api/rent-court-possession-applications', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			})
			return data
		},
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['citizen-applications'] })
			queryClient.invalidateQueries({ queryKey: ['admin-applications'] })
			completeServiceFormSubmit(
				navigate,
				getServiceFormSuccessMessage(data, 'Form II submitted successfully.')
			)
		},
		onError: (err) => {
			const msg =
				err?.response?.data?.message ||
				(err?.response?.data?.errors
					? Object.values(err.response.data.errors).flat().join('. ')
					: 'Failed to submit Form II')
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

		if (groundsApply && evictionGrounds.length === 0) {
			setError(
				'Select at least one ground under section 21(2). The Rent Court may order recovery of possession only on a ground listed there.'
			)
			return false
		}

		setSubmitting(true)
		try {
			const formData = new FormData()

			formData.append('before_rent_court', beforeRentCourt.trim())
			formData.append('applicant_name', applicantName.trim())
			formData.append('applicant_residential_address', applicantResidentialAddress.trim())

			formData.append('tenancy_uin', tenancyUIN.trim())
			if (tenantName.trim()) formData.append('tenant_name', tenantName.trim())

			formData.append('statutory_basis', statutoryBasis)
			if (groundsApply) {
				evictionGrounds.forEach((clause) => formData.append('eviction_grounds[]', clause))
			}

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
			if (interimOrderSought.trim()) formData.append('interim_order_sought', interimOrderSought.trim())
			if (enclosuresList.trim()) formData.append('enclosures_list', enclosuresList.trim())

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
		beforeRentCourt,
		enclosuresList,
		factsOfCase,
		groundsForRelief,
		interimOrderSought,
		jurisdictionAccepted,
		hasPriorProceedings,
		priorProceedings,
		reliefSought,
		signatureImage,
		signatureName,
		verification,
		tenancyUIN,
		tenantName,
		statutoryBasis,
		evictionGrounds,
		groundsApply,
		particularsOfApplication,
		navigate,
	])

	const previewData = useMemo(
		() =>
			previewSections(
				previewSection('Court / tenancy', [
					previewItem('Before the Rent Court', beforeRentCourt),
					previewItem('Tenancy UIN', tenancyUIN),
					previewItem('Tenant name', tenantName),
				]),
				previewSection('Applicant', [
					previewItem('Applicant name', applicantName),
					previewItem('Applicant address', applicantResidentialAddress),
				]),
				previewSection('Grounds for recovery of possession', [
					previewItem('Statutory basis', describeBasis(statutoryBasis)),
					previewItem(
						'Grounds relied on',
						groundsApply ? evictionGrounds.map(describeGround).join('\n\n') : ''
					),
				]),
				previewSection('Details of application', [
					previewItem('Particulars of application', particularsOfApplication),
					previewItem(
						'Jurisdiction declared',
						jurisdictionAccepted ? declarationText(DECLARATION.FORM_II_JURISDICTION) : ''
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
											`${i + 1}. ${entry.case_number} before ${entry.forum} - ${entry.status === PRIOR_STATUS.PENDING
												? `pending: ${entry.pendency_details}`
												: `disposed: ${entry.decision}`
											}`
									)
									.join('\n')
								: declarationText(DECLARATION.FORM_II_PRIOR_PROCEEDINGS)
					),
					previewItem('Relief sought', reliefSought),
					previewItem('Interim order sought', interimOrderSought),
					previewItem('List of enclosures', enclosuresList),
				]),
				previewSection('Verification', [
					previewItem('Verification', composeVerification(VERIFICATION.FORM_II, verification)),
					previewItem('Place', verification.place),
					previewItem('Date', 'Stamped on submission'),
					previewItem('Name against the signature', signatureName),
					previewItem('Signature image', signatureImage),
				])
			),
		[
			applicantName,
			applicantResidentialAddress,
			beforeRentCourt,
			enclosuresList,
			factsOfCase,
			groundsForRelief,
			interimOrderSought,
			jurisdictionAccepted,
			hasPriorProceedings,
			priorProceedings,
			reliefSought,
			signatureImage,
			signatureName,
			verification,
			tenancyUIN,
			tenantName,
			statutoryBasis,
			evictionGrounds,
			groundsApply,
			particularsOfApplication,
		]
	)

	const { previewOpen, requestPreview, closePreview, confirmSubmit } = useServiceFormPreview(submit)

	const handleTenancyLoaded = (tenancy) =>
		applyTenancyAutofill(APPLICATION_TYPES.RENT_COURT_POSSESSION, tenancy, user, {
			setTenancyUIN,
			setApplicantName,
			setApplicantResidentialAddress,
			setTenantName,
			setBeforeRentCourt,
		})

	return (
		<div className="dashboard-card service-form-panel">
			{error ? (
				<div className="service-form-alert service-form-alert--error" role="alert">
					{error}
				</div>
			) : null}

			<form className="tenancy-form" onSubmit={requestPreview}>
				<ServiceFormSection
					icon={IdCard}
					title="Tenancy"
					lead="Start with the UIN for this tenancy, then name the Rent Court where this application will be heard."
				>
					<TenancyUinLookup
						value={tenancyUIN}
						onChange={setTenancyUIN}
						onLoaded={handleTenancyLoaded}
						label="Tenancy Unique Identification Number (UIN)"
						hint="Enter the UIN issued for this tenancy, then tap Fetch details. Only a party to the tenancy can look it up."
					/>
					<label>
						<ServiceFormFieldLabel
							required
							hint="Name the place where this Rent Court sits (for example, the district or town)."
						>
							Before the Rent Court at
						</ServiceFormFieldLabel>
						<input
							type="text"
							value={beforeRentCourt}
							onChange={(e) => setBeforeRentCourt(e.target.value)}
							required
						/>
					</label>
				</ServiceFormSection>

				<ServiceFormSection
					icon={Users}
					title="Parties"
					lead="Name the applicant and the tenant. Notices for the applicant will go to the address you give here."
				>
					<div className="sf-party-grid">
						<div className="sf-party-card">
							<h3 className="sf-party-card__title">A. Applicant</h3>
							<p className="sf-party-card__note">You (or the person filing this application)</p>
							<label>
								<ServiceFormFieldLabel
									required
									hint="Full name as it should appear on the application."
								>
									Name of the Applicant
								</ServiceFormFieldLabel>
								<input
									type="text"
									value={applicantName}
									onChange={(e) => setApplicantName(e.target.value)}
									required
								/>
							</label>
							<label className="tenancy-field-full">
								<ServiceFormFieldLabel
									required
									hint="Address where notices for the applicant should be served."
								>
									Residential address of the Applicant
								</ServiceFormFieldLabel>
								<textarea
									value={applicantResidentialAddress}
									onChange={(e) => setApplicantResidentialAddress(e.target.value)}
									required
									rows={3}
								/>
							</label>
						</div>

						<div className="sf-party-card">
							<h3 className="sf-party-card__title">B. Tenant</h3>
							<p className="sf-party-card__note">The tenant named in this tenancy</p>
							<label>
								<ServiceFormFieldLabel
									required
									hint="Full name of the tenant against whom possession is sought."
								>
									Name of the Tenant
								</ServiceFormFieldLabel>
								<input
									type="text"
									value={tenantName}
									onChange={(e) => setTenantName(e.target.value)}
									required
								/>
							</label>
						</div>
					</div>
				</ServiceFormSection>

				<ServiceFormSection
					icon={Scale}
					title="Grounds for recovery of possession"
					lead="Choose the statutory basis. Extra ground checkboxes open only when section 21(2) applies."
				>
					<p className="sf-section__inline-hint">
						Tap the{' '}
						<Info size={14} className="sf-inline-info" aria-hidden /> info icon on an option to see
						which section of the Act it refers to.
					</p>

					<div
						className="tenancy-field-full ground-choice-group"
						role="radiogroup"
						aria-label="Statutory basis"
					>
						{EVICTION_BASIS_OPTIONS.map((option) => (
							<label key={option.value} className="ground-choice">
								<input
									type="radio"
									name="statutory_basis"
									value={option.value}
									checked={statutoryBasis === option.value}
									onChange={() => setStatutoryBasis(option.value)}
								/>
								<span
									className="ground-choice__body"
									style={{
										flexDirection: 'row',
										alignItems: 'center',
										gap: '0.5rem',
										flexWrap: 'wrap',
									}}
								>
									<span className="ground-choice__label" style={{ marginBottom: 0 }}>
										{option.label}
									</span>
									<span
										className="ground-choice__info-container"
										role="note"
										tabIndex={0}
										aria-label={`${option.citation}: ${option.note}`}
										onClick={(e) => {
											e.preventDefault()
											e.stopPropagation()
										}}
										onMouseDown={(e) => {
											e.preventDefault()
											e.stopPropagation()
										}}
									>
										<Info size={16} aria-hidden />
										<span className="ground-choice__info-popup" role="tooltip">
											<strong>{option.citation}</strong>
											<span>{option.note}</span>
										</span>
									</span>
								</span>
							</label>
						))}
					</div>

					{groundsApply ? (
						<>
							<p className="sf-section__inline-hint" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
								<span className="label-text required" style={{ marginBottom: 0 }}>
									Grounds under section 21(2)
								</span>
								<span
									className="ground-choice__info-container"
									role="note"
									tabIndex={0}
									aria-label="Section 21(2) allows an order on one or more of the following grounds. Select every ground relied on."
								>
									<Info size={16} aria-hidden />
									<span className="ground-choice__info-popup" role="tooltip">
										<span>
											Section 21(2) allows an order on one or more of the following grounds. Select every
											ground relied on.
										</span>
									</span>
								</span>
							</p>
							<div className="tenancy-field-full ground-choice-group ground-choice-group--inline">
								{EVICTION_GROUND_CLAUSES.map((clause) => (
									<label key={clause.value} className="ground-choice">
										<input
											type="checkbox"
											value={clause.value}
											checked={evictionGrounds.includes(clause.value)}
											onChange={() => toggleGround(clause.value)}
										/>
										<span
											className="ground-choice__body"
											style={{
												flexDirection: 'row',
												alignItems: 'center',
												gap: '0.5rem',
												flexWrap: 'wrap',
											}}
										>
											<span className="ground-choice__label" style={{ marginBottom: 0 }}>
												{clause.label}
											</span>
											<span
												className="ground-choice__info-container"
												role="note"
												tabIndex={0}
												aria-label={`${clause.citation}: ${clause.text}`}
												onClick={(e) => {
													e.preventDefault()
													e.stopPropagation()
												}}
												onMouseDown={(e) => {
													e.preventDefault()
													e.stopPropagation()
												}}
											>
												<Info size={16} aria-hidden />
												<span className="ground-choice__info-popup" role="tooltip">
													<strong>{clause.citation}</strong>
													<p style={{ marginTop: '0.25rem', marginBottom: '0.25rem' }}>{clause.text}</p>
													{clause.explanation ? (
														<p style={{ marginTop: 0, fontStyle: 'italic' }}>{clause.explanation}</p>
													) : null}
												</span>
											</span>
										</span>
									</label>
								))}
							</div>
						</>
					) : (
						<p className="field-note tenancy-field-full">
							No additional ground checklist applies under section 22 — continue with the application
							details.
						</p>
					)}
				</ServiceFormSection>

				<ServiceFormSection
					icon={FileText}
					title="Details of the application"
					lead="Explain the dispute in plain words. Paragraph numbers match Form II in the Gazette."
				>
					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							required
							para={1}
							hint="In one or two sentences, what recovery of possession are you seeking?"
							info="Form II para 1 — Particulars of application."
						>
							Particulars of application
						</ServiceFormFieldLabel>
						<textarea
							required
							value={particularsOfApplication}
							onChange={(e) => setParticularsOfApplication(e.target.value)}
							rows={3}
						/>
					</label>

					<div className="sf-field-block">
						<ServiceFormFieldLabel
							required
							para={2}
							hint="Confirm that this Rent Court is the correct place to file."
							info="Form II para 2 — Jurisdiction of the Rent Court (declaration)."
						>
							Jurisdiction of the Rent Court
						</ServiceFormFieldLabel>
						<DeclarationCheckbox
							fieldId={DECLARATION.FORM_II_JURISDICTION}
							hideLabel
							simple
							summary="Yes — this matter can be heard by this Rent Court"
							checked={jurisdictionAccepted}
							onChange={setJurisdictionAccepted}
						/>
					</div>

					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							required
							para={3}
							hint="Write what happened in date order. Prefer one fact or issue per short paragraph."
							info="Form II para 3 — Facts of the case."
						>
							Facts of the case
						</ServiceFormFieldLabel>
						<textarea
							required
							value={factsOfCase}
							onChange={(e) => setFactsOfCase(e.target.value)}
							rows={4}
						/>
					</label>

					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							required
							para={4}
							hint="Why should the Rent Court grant what you are asking? Link to the grounds you chose above."
							info="Form II para 4 — Grounds for relief."
						>
							Grounds for relief
						</ServiceFormFieldLabel>
						<textarea
							required
							value={groundsForRelief}
							onChange={(e) => setGroundsForRelief(e.target.value)}
							rows={3}
						/>
					</label>

					<div className="sf-field-block">
						<ServiceFormFieldLabel
							required
							para={5}
							hint="Say whether this same matter is already before another court or authority."
							info="Form II para 5 — Matters not previously filed or pending with any other court."
						>
							Have you filed this matter elsewhere?
						</ServiceFormFieldLabel>
						<PriorProceedingsField
							fieldId={DECLARATION.FORM_II_PRIOR_PROCEEDINGS}
							hint="If yes, add each case below. If no, choose the first option."
							hasPrior={hasPriorProceedings}
							onHasPriorChange={setHasPriorProceedings}
							entries={priorProceedings}
							onEntriesChange={setPriorProceedings}
						/>
					</div>

					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							required
							para={6}
							hint="State clearly what order you want (for example: recovery of possession)."
							info="Form II para 6 — Relief sought. Mention legal provisions if you know them."
						>
							Relief sought
						</ServiceFormFieldLabel>
						<textarea
							required
							value={reliefSought}
							onChange={(e) => setReliefSought(e.target.value)}
							rows={3}
						/>
					</label>

					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							optional
							para={7}
							hint="Only if you need temporary help before the final order."
							info="Form II para 7 — Interim order, if any prayed for."
						>
							Interim order, if any prayed for
						</ServiceFormFieldLabel>
						<textarea
							value={interimOrderSought}
							onChange={(e) => setInterimOrderSought(e.target.value)}
							rows={3}
							placeholder="Leave blank if not needed"
						/>
					</label>

					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							optional
							para={8}
							hint="List affidavits or documents you are attaching, if any."
							info="Form II para 8 — List of enclosures."
						>
							List of enclosures
						</ServiceFormFieldLabel>
						<textarea
							value={enclosuresList}
							onChange={(e) => setEnclosuresList(e.target.value)}
							rows={3}
							placeholder="Example: Copy of tenancy agreement, rent receipts…"
						/>
					</label>
				</ServiceFormSection>

				<ServiceFormSection
					icon={BadgeCheck}
					title="Verification"
					lead="Complete the sworn statement below. Fill the blanks in the sentence, then enter the place of verification."
				>
					<VerificationClause
						prefilled={hasProfileDefaults(profile)}
						fieldId={VERIFICATION.FORM_II}
						values={verification}
						onChange={setVerificationField}
						onParagraphChange={setParagraphAnswer}
						embedded
					/>
				</ServiceFormSection>

				<ServiceFormSection
					icon={PenLine}
					title="Signature"
					lead="Put the name that should appear against the signature on this application."
				>
					<label>
						<ServiceFormFieldLabel required hint="Usually the applicant’s full name.">
							Name against the signature
						</ServiceFormFieldLabel>
						<input
							type="text"
							value={signatureName}
							onChange={(e) => setSignatureName(e.target.value)}
							required
						/>
					</label>
					<label className="tenancy-field-full">
						<ServiceFormFieldLabel
							optional
							hint="You may upload a scanned signature image if you have one."
						>
							Signature image
						</ServiceFormFieldLabel>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setSignatureImage(e.target.files?.[0] || null)}
						/>
					</label>
				</ServiceFormSection>

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
				title="Review Form II"
				subtitle={serviceMeta?.label}
				sections={previewData}
				onClose={closePreview}
				onConfirm={confirmSubmit}
				confirming={submitting}
				confirmLabel="Confirm & submit Form II"
			/>
		</div>
	)
}




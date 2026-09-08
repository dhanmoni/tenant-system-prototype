import { useCallback, useEffect, useState } from 'react'
import api from '../api'
import { blobToBase64, discoverAgent, signPdf, DscAgentError } from '../utils/dscAgent'

/**
 * Signing a hearing notice or order with the officer's Digital Signature Certificate.
 *
 * The round trip is deliberately three-legged, and each leg is somewhere different:
 *
 *   1. the portal server renders and returns the frozen notice PDF (authenticated, access-checked);
 *   2. the DSC Agent on the officer's own machine signs those bytes with the USB token, prompting
 *      for the PIN itself;
 *   3. the signed bytes go back to the portal, which records who signed and under whose authority.
 *
 * The PIN and the certificate never leave the officer's machine, and the portal cannot produce a
 * signature on its own - which is the point of doing it this way rather than holding keys server
 * side.
 */
export function useNoticeSigning(formType, applicationId) {
	const [agent, setAgent] = useState(null)
	const [checkingAgent, setCheckingAgent] = useState(true)
	const [signingId, setSigningId] = useState(null)
	const [error, setError] = useState('')

	const refreshAgent = useCallback(async () => {
		setCheckingAgent(true)
		try {
			setAgent(await discoverAgent())
		} finally {
			setCheckingAgent(false)
		}
	}, [])

	useEffect(() => {
		let cancelled = false
		;(async () => {
			const found = await discoverAgent()
			if (!cancelled) {
				setAgent(found)
				setCheckingAgent(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [])

	const base = `/api/admin/applications/${formType}/${applicationId}/proceedings`

	/** The notice PDF as a blob — the signed one if it exists, otherwise the draft. */
	const fetchDocument = useCallback(
		async (proceedingId) => {
			const response = await api.get(`${base}/${proceedingId}/document`, { responseType: 'blob' })
			if ((response.headers?.['content-type'] || '').includes('application/json')) {
				const parsed = JSON.parse(await response.data.text())
				throw new Error(parsed.message || 'Could not load the notice.')
			}
			return response.data
		},
		[base],
	)

	const signProceeding = useCallback(
		async (proceeding) => {
			setError('')
			setSigningId(proceeding.id)
			try {
				const current = await discoverAgent()
				setAgent(current)

				if (!current.connected) {
					throw new DscAgentError(
						'The DSC Agent is not running on this machine. Start it, then try again.',
						'not_running',
					)
				}
				if (!current.tokenPresent) {
					throw new DscAgentError('No DSC token detected. Insert your token, then try again.', 'no_token')
				}

				const pdfBase64 = await blobToBase64(await fetchDocument(proceeding.id))

				// Only ask for the PIN in the browser if the agent has no dialog of its own. When it
				// does — the normal case — requirePin makes the agent prompt, and the PIN never
				// touches this page.
				let pin
				if (!current.promptAvailable) {
					pin = window.prompt('Enter your DSC token PIN to sign this notice:', '')
					if (!pin) throw new DscAgentError('A PIN is needed to sign.', 'pin_cancelled')
				}

				const { signedPdfBase64, agentResponse } = await signPdf(current.base, pdfBase64, {
					// Shown in the signature panel of any PDF reader, so it names the forum the
					// notice issues from rather than the account that clicked the button.
					reason: proceeding.signature_authority_hint
						? `Issued by ${proceeding.signature_authority_hint}`
						: 'Issued through the Assam Tenancy Portal',
					pin,
				})

				const { data } = await api.post(`${base}/${proceeding.id}/signature`, {
					signed_pdf_base64: signedPdfBase64,
					agent_response: agentResponse,
				})

				return data.proceeding
			} catch (err) {
				const message =
					err?.response?.data?.message || err?.message || 'The notice could not be signed.'
				setError(message)
				throw new Error(message)
			} finally {
				setSigningId(null)
			}
		},
		[base, fetchDocument],
	)

	return {
		agent,
		checkingAgent,
		refreshAgent,
		signingId,
		signProceeding,
		fetchDocument,
		error,
		clearError: () => setError(''),
	}
}

/**
 * Talking to the DSC Agent that runs on the signing officer's own machine.
 *
 * The agent is a small local HTTP service (installed separately, Windows) that owns the PKCS#11
 * driver for the USB token. Everything about signing happens there: the token stays in the
 * officer's machine, the agent prompts for the PIN itself, and the signed bytes come back to this
 * page. Neither the PIN nor the certificate ever reaches the portal server, and the portal cannot
 * sign anything on anybody's behalf - it only receives the result.
 *
 * This is a module port of the vendor's dsc-agent-client.iife.js, kept close to it deliberately so
 * that a later drop-in of their file behaves the same. Two things differ, both because their
 * example pages are demos:
 *
 *   - the API key comes from the build environment, not a checked-in literal;
 *   - signPdf sends the key, which their own SDK function omits and only their raw-fetch demo
 *     pages include. Without it the agent refuses.
 */

const DEFAULT_PORTS = [18080, 18081, 18082]
const DISCOVERY_TIMEOUT_MS = 4000

/**
 * The agent's shared key.
 *
 * Not a server credential and not a secret from the officer: it authenticates this page to a
 * service running on the same machine as the browser, and anything in a bundle is readable anyway.
 * It lives in the environment so a deployment can rotate it without a code change.
 */
const API_KEY = import.meta.env.VITE_DSC_API_KEY || ''

export class DscAgentError extends Error {
	constructor(message, code) {
		super(message)
		this.name = 'DscAgentError'
		this.code = code
	}
}

export function arrayBufferToBase64(input) {
	if (typeof input === 'string') return input
	let bytes
	if (input instanceof ArrayBuffer) bytes = new Uint8Array(input)
	else if (ArrayBuffer.isView(input)) bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
	else throw new DscAgentError('Unsupported input: expected ArrayBuffer, TypedArray or base64 string')

	// Chunked so a large notice does not blow the argument limit on String.fromCharCode.
	let binary = ''
	for (let i = 0; i < bytes.length; i += 0x8000) {
		binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
	}
	return btoa(binary)
}

export async function blobToBase64(blob) {
	const buffer = await blob.arrayBuffer()
	return arrayBufferToBase64(buffer)
}

async function probe(port) {
	const controller = new AbortController()
	const timer = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT_MS)
	try {
		const response = await fetch(`http://127.0.0.1:${port}/health`, {
			signal: controller.signal,
			credentials: 'include',
		})
		if (!response.ok) return null
		const health = await response.json().catch(() => ({}))
		return { base: `http://127.0.0.1:${port}`, health }
	} catch {
		return null
	} finally {
		clearTimeout(timer)
	}
}

/**
 * Find the agent, or say why not.
 *
 * Returns { connected, base, health } rather than throwing, because "no agent" is an ordinary
 * state that the screen has to show rather than an error to handle: most officers will open a case
 * without a token plugged in.
 */
export async function discoverAgent(ports = DEFAULT_PORTS) {
	for (const port of ports) {
		const found = await probe(port)
		if (found) {
			return {
				connected: true,
				base: found.base,
				health: found.health,
				// The agent can raise its own PIN dialog. Where it can, the PIN must never be
				// collected in the browser - see signPdf.
				promptAvailable: Boolean(found.health?.promptAvailable),
				tokenPresent: Boolean(found.health?.slotPresent),
			}
		}
	}

	return { connected: false, base: null, health: null, promptAvailable: false, tokenPresent: false }
}

export async function agentHealth(base) {
	const response = await fetch(`${base}/health`, { credentials: 'include' })
	if (!response.ok) throw new DscAgentError('The DSC Agent stopped responding.', 'health_failed')
	return response.json()
}

/**
 * Sign one PDF with the token in the officer's machine.
 *
 * `pin` is only ever passed when the agent cannot prompt for itself. When it can - which is the
 * normal case, promptAvailable in /health - we send requirePin and the agent raises its own dialog,
 * so the PIN is never typed into a web page and never enters this application's memory at all.
 */
export async function signPdf(base, pdfBase64, { reason, pin, requirePin = true } = {}) {
	const body = {
		pdfBase64,
		reason: reason || 'Signed via DSC Agent',
		includeESS: true,
		embedIntermediates: true,
		signingTime: '',
		// The visible stamp goes on every page: a hearing notice is served as a whole, and a
		// signature on the last page alone leaves the earlier pages looking unattested.
		stampAllPages: true,
		duplicateWidgets: true,
		apiKey: API_KEY,
	}

	if (pin) body.pin = String(pin).trim()
	else if (requirePin) body.requirePin = true

	let response
	try {
		response = await fetch(`${base}/sign/pdf`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
			credentials: 'include',
		})
	} catch {
		throw new DscAgentError(
			'Lost contact with the DSC Agent. Check that it is still running, then try again.',
			'unreachable',
		)
	}

	const payload = await response.json().catch(() => ({}))
	if (!response.ok || !payload?.ok || !payload.signedPdfBase64) {
		throw new DscAgentError(payload?.message || `The DSC Agent refused the request (HTTP ${response.status}).`, 'refused')
	}

	// Everything the agent reported except the document itself. Handed to the server as a record of
	// which certificate was used; it is evidence, never authorisation.
	const { signedPdfBase64, ...agentResponse } = payload

	return { signedPdfBase64, agentResponse }
}

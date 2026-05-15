export const LANDING_A11Y_EVENT = 'landing-a11y'

export function emitLandingA11y(action) {
	window.dispatchEvent(new CustomEvent(LANDING_A11Y_EVENT, { detail: action }))
}

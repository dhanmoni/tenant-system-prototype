import { Fragment } from 'react'

/**
 * A statutory clause printed as one continuous sentence with blanks in it.
 *
 * Several of the Gazette forms do this: the VERIFICATION that closes Forms II to VI, and the
 * recital that opens Form I-B. Shredding such a sentence into a grid of labelled boxes loses the
 * thing that matters - the filer never reads the sentence they are signing.
 *
 * The prose is never written out in a component. It is split out of the shared template at render
 * time and the caller supplies one control per placeholder, so the words on screen and the words
 * the server records cannot drift apart: editing the sentence in one place changes both, and a
 * placeholder renamed on one side lands in `missing` rather than silently rendering a wrong oath.
 *
 * Each control needs its own accessible name. Visually the sentence supplies the context; a screen
 * reader moving between the inputs alone would not have it.
 */
function ClauseSentence({ template, blanks, className = '' }) {
	// Split on the placeholders present in `blanks`, keeping them as results. Built from the keys
	// rather than hard-coded, so a clause with different blanks needs no change here.
	const tokens = Object.keys(blanks)
	const pattern = new RegExp(`(${tokens.map(escapeForRegExp).join('|')})`, 'g')
	const segments = template.split(pattern)

	// A placeholder in the template that the caller gave no control for would otherwise be rendered
	// to the filer as raw text like ":address" inside a sentence they are about to swear to.
	const missing = (template.match(/:[a-z_]+/g) || []).filter((token) => !tokens.includes(token))
	if (missing.length > 0) {
		throw new Error(`ClauseSentence: no control supplied for ${missing.join(', ')}`)
	}

	return (
		<p className={`clause__sentence ${className}`.trim()}>
			{segments.map((segment, index) => (
				<Fragment key={index}>{blanks[segment] ?? segment}</Fragment>
			))}
		</p>
	)
}

function escapeForRegExp(value) {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default ClauseSentence

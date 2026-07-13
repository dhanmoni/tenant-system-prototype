import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import enBase from './messages/en'
import asBase from './messages/as'
import publicPagesEn from './messages/publicPagesEn'
import publicPagesAs from './messages/publicPagesAs'

const STORAGE_KEY = 'a11y-language'
const catalogs = {
	en: { ...enBase, ...publicPagesEn },
	as: { ...asBase, ...publicPagesAs },
}

const LanguageContext = createContext(null)

function interpolate(template, vars = {}) {
	if (!vars || typeof template !== 'string') return template
	return template.replace(/\{(\w+)\}/g, (_, key) =>
		vars[key] != null ? String(vars[key]) : `{${key}}`,
	)
}

function readStoredLanguage() {
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved === 'en' || saved === 'as') return saved
	} catch {
		// Ignore localStorage errors.
	}
	return 'en'
}

export function LanguageProvider({ children }) {
	const [language, setLanguageState] = useState(readStoredLanguage)

	const setLanguage = useCallback((next) => {
		if (next !== 'en' && next !== 'as') return
		setLanguageState(next)
	}, [])

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, language)
		} catch {
			// Ignore localStorage errors.
		}
		document.documentElement.lang = language === 'as' ? 'as' : 'en'
	}, [language])

	const t = useCallback(
		(key, vars) => {
			const catalog = catalogs[language] || catalogs.en
			const value = catalog[key] ?? catalogs.en[key] ?? key
			return interpolate(value, vars)
		},
		[language],
	)

	const value = useMemo(
		() => ({ language, setLanguage, t }),
		[language, setLanguage, t],
	)

	return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
	const ctx = useContext(LanguageContext)
	if (!ctx) {
		throw new Error('useLanguage must be used within LanguageProvider')
	}
	return ctx
}

import { createContext, useContext } from 'react'

const AuthSessionContext = createContext({ user: null, onLogout: null })

export function AuthSessionProvider({ user, onLogout, children }) {
	return (
		<AuthSessionContext.Provider value={{ user, onLogout }}>
			{children}
		</AuthSessionContext.Provider>
	)
}

export function useAuthSession() {
	return useContext(AuthSessionContext)
}

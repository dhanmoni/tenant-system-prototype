import { Link } from 'react-router-dom'
import { useAuthPanelNavigation } from '../../context/AuthPanelNavigationContext'
import { authHashForMode } from '../../utils/authPanelNav'

function AuthNavLink({ mode, className, children, ...rest }) {
	const authNav = useAuthPanelNavigation()
	const hash = authHashForMode(mode)
	const to = `/${hash}`

	if (authNav) {
		const open = mode === 'register' ? authNav.openRegister : authNav.openLogin
		const { onClick: onClickProp, ...linkRest } = rest
		return (
			<a
				href={hash}
				className={className}
				onClick={(e) => {
					e.preventDefault()
					onClickProp?.(e)
					open()
				}}
				{...linkRest}
			>
				{children}
			</a>
		)
	}

	return (
		<Link to={to} className={className} {...rest}>
			{children}
		</Link>
	)
}

export default AuthNavLink

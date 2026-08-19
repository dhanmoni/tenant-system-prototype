import { X } from 'lucide-react'
import { useLanguage } from '../../i18n'

function ProfileCompletionBanner({ onComplete, onDismiss }) {
	const { t } = useLanguage()

	return (
		<div className="ws-profile-flag" role="status" aria-live="polite">
			<p className="ws-profile-flag__text">{t('ws.profile.bannerText')}</p>
			<button type="button" className="ws-profile-flag__action ws-btn ws-btn--sm ws-btn--primary" onClick={onComplete}>
				{t('ws.profile.bannerAction')}
			</button>
			<button
				type="button"
				className="ws-profile-flag__dismiss"
				onClick={onDismiss}
				aria-label={t('ws.profile.bannerDismiss')}
			>
				<X aria-hidden strokeWidth={2.25} />
			</button>
		</div>
	)
}

export default ProfileCompletionBanner

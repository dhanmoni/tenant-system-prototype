import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function NotFound() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('notFound.title')}
			titleId="not-found-heading"
			breadcrumbLabel={t('notFound.title')}
			lead={t('notFound.lead')}
		>
			<div className="gov-plain-page">
				<p>{t('notFound.body')}</p>
				<p>
					<Link to="/">{t('notFound.home')}</Link>
					{' · '}
					<Link to="/sitemap">{t('notFound.sitemap')}</Link>
					{' · '}
					<Link to="/contact">{t('notFound.contact')}</Link>
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default NotFound

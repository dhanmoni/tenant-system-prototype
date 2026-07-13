import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function About() {
	const { t } = useLanguage()

	return (
		<PublicPageLayout
			title={t('about.title')}
			titleId="about-page-heading"
			breadcrumbLabel={t('about.title')}
			lead={t('about.lead')}
		>
			<div className="gov-plain-page">
				<section>
					<h2>{t('about.mission.title')}</h2>
					<p>{t('about.mission.body')}</p>
				</section>

				<section>
					<h2>{t('about.operator.title')}</h2>
					<p>{t('about.operator.body')}</p>
				</section>
			</div>
		</PublicPageLayout>
	)
}

export default About

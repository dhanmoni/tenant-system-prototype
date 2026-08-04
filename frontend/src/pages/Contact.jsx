import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import ContactMap from '../components/landing/ContactMap'
import { useLanguage } from '../i18n'

function Contact() {
	const { t } = useLanguage()
	const addressLines = t('contact.addressLines').split('\n')

	return (
		<PublicPageLayout
			title={t('contact.title')}
			titleId="contact-heading"
			breadcrumbLabel={t('contact.title')}
			lead={t('contact.lead')}
		>
			<div className="gov-plain-page">
				<div className="gov-plain-page__columns">
					<div className="gov-plain-page__col">
						<section>
							<h2>{t('contact.helpdesk')}</h2>
							<p>
								<strong>{t('contact.tollFree')}</strong>{' '}
								<a href="tel:18000000000">1800-000-0000</a>
							</p>
							<p>
								<strong>{t('contact.emailLabel')}</strong>{' '}
								<a href="mailto:helpdesk.tcms@nic.in">helpdesk.tcms@nic.in</a>
							</p>
							<p>
								<strong>{t('contact.hoursLabel')}</strong> {t('contact.hoursValue')}
							</p>
						</section>

						<section>
							<h2>{t('contact.phone')}</h2>
							<p>
								<a href="tel:+913612234567">+91 361 223 4567</a>
							</p>
						</section>
					</div>

					<div className="gov-plain-page__col">
						<section>
							<h2>{t('contact.officeAddress')}</h2>
							<p>
								{addressLines.map((line, index) => (
									<span key={line}>
										{index > 0 ? <br /> : null}
										{line}
									</span>
								))}
							</p>
						</section>

						<section>
							<h2>{t('contact.email')}</h2>
							<p>
								<a href="mailto:support@assamtenancy.gov.in">
									support@assamtenancy.gov.in
								</a>
							</p>
						</section>
					</div>
				</div>

				<section className="gov-plain-page__map" aria-labelledby="contact-map-heading">
					<h2 id="contact-map-heading">{t('contact.mapTitle')}</h2>
					<p>{t('contact.mapAddress')}</p>
					<ContactMap />
					<p className="gov-plain-page__map-note">
						<a
							href="https://www.google.com/maps/search/?api=1&query=Directorate+of+Town+and+Country+Planning+Assam+Dispur"
							target="_blank"
							rel="noopener noreferrer"
						>
							{t('contact.openMaps')}
						</a>
					</p>
				</section>

				<p className="gov-plain-page__meta">{t('contact.meta')}</p>

				<p className="gov-plain-page__links">
					<Link to="/#login">{t('contact.signIn')}</Link>
					{' · '}
					<Link to="/#register">{t('contact.register')}</Link>
					{' · '}
					<a href="https://tcp.assam.gov.in/" target="_blank" rel="noopener noreferrer">
						{t('contact.tcpSite')}
					</a>
				</p>
			</div>
		</PublicPageLayout>
	)
}

export default Contact

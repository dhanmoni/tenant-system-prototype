import { useState } from 'react'
import { Link } from 'react-router-dom'
import PublicPageLayout from '../components/landing/PublicPageLayout'
import { useLanguage } from '../i18n'

function Feedback() {
	const { t } = useLanguage()
	const [sent, setSent] = useState(false)
	const [error, setError] = useState('')
	const [form, setForm] = useState({ name: '', email: '', category: 'content', message: '' })

	const handleChange = (e) => {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
		if (name === 'message' && error) setError('')
	}

	const handleSubmit = (e) => {
		e.preventDefault()
		if (!form.message.trim()) {
			setError(t('feedback.required'))
			return
		}
		setError('')
		setSent(true)
		window.scrollTo(0, 0)
	}

	const handleReset = () => {
		setSent(false)
		setError('')
		setForm({ name: '', email: '', category: 'content', message: '' })
	}

	return (
		<PublicPageLayout
			title={t('feedback.title')}
			titleId="feedback-heading"
			breadcrumbLabel={t('feedback.title')}
			lead={t('feedback.lead')}
		>
			<div className="gov-plain-page gov-feedback-page">
				<div className="gov-feedback-layout">
					{sent ? (
						<div className="gov-feedback-thanks" role="status">
							<h2>{t('feedback.thanksTitle')}</h2>
							<p>{t('feedback.thanks')}</p>
							<button type="button" className="gov-feedback-form__submit" onClick={handleReset}>
								{t('feedback.sendAnother')}
							</button>
						</div>
					) : (
						<form className="gov-feedback-form" onSubmit={handleSubmit} noValidate>
							<div className="gov-feedback-form__field">
								<label htmlFor="feedback-name">{t('feedback.name')}</label>
								<input
									id="feedback-name"
									type="text"
									name="name"
									value={form.name}
									onChange={handleChange}
									autoComplete="name"
								/>
							</div>
							<div className="gov-feedback-form__field">
								<label htmlFor="feedback-email">{t('feedback.email')}</label>
								<input
									id="feedback-email"
									type="email"
									name="email"
									value={form.email}
									onChange={handleChange}
									autoComplete="email"
								/>
							</div>
							<div className="gov-feedback-form__field gov-feedback-form__field--full">
								<label htmlFor="feedback-category">{t('feedback.category')}</label>
								<select
									id="feedback-category"
									name="category"
									value={form.category}
									onChange={handleChange}
								>
									<option value="content">{t('feedback.cat.content')}</option>
									<option value="accessibility">{t('feedback.cat.accessibility')}</option>
									<option value="technical">{t('feedback.cat.technical')}</option>
									<option value="other">{t('feedback.cat.other')}</option>
								</select>
							</div>
							<div className="gov-feedback-form__field gov-feedback-form__field--full">
								<label htmlFor="feedback-message">
									{t('feedback.message')}
									<span className="gov-feedback-form__req" aria-hidden>
										{' '}
										*
									</span>
								</label>
								<textarea
									id="feedback-message"
									name="message"
									rows={8}
									value={form.message}
									onChange={handleChange}
									required
									aria-invalid={error ? 'true' : 'false'}
									aria-describedby={error ? 'feedback-message-error' : 'feedback-message-hint'}
								/>
							</div>
							{error ? (
								<p id="feedback-message-error" className="gov-feedback-form__error" role="alert">
									{error}
								</p>
							) : (
								<p id="feedback-message-hint" className="gov-feedback-form__note">
									{t('feedback.note')}
								</p>
							)}
							<div className="gov-feedback-form__actions">
								<button type="submit" className="gov-feedback-form__submit">
									{t('feedback.submit')}
								</button>
							</div>
						</form>
					)}

					<aside className="gov-feedback-aside" aria-labelledby="feedback-aside-heading">
						<h2 id="feedback-aside-heading">{t('feedback.aside.title')}</h2>
						<p>{t('feedback.aside.body')}</p>
						<p>
							<strong>{t('feedback.aside.contact')}</strong>
							<br />
							<Link to="/contact">{t('feedback.aside.contactLink')}</Link>
						</p>
						<p>
							<strong>{t('feedback.aside.help')}</strong>
							<br />
							<Link to="/help-centre">{t('feedback.aside.helpLink')}</Link>
						</p>
					</aside>
				</div>
			</div>
		</PublicPageLayout>
	)
}

export default Feedback

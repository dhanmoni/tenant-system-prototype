function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-layout">
        <div className="contact-details">
          <p className="contact-eyebrow">Get in touch</p>
          <h1>Contact Us</h1>
          <p className="contact-lead">
            Directorate of Town and Country Planning, Assam
          </p>
          <div className="contact-block">
            <h3>Address</h3>
            <p>
              Urban Affairs Complex
              <br />
              Sachivalaya Road, Dispur
              <br />
              Guwahati, Assam 781006
            </p>
          </div>
          <div className="contact-block">
            <h3>Phone</h3>
            <p>+91 361 223 4567</p>
          </div>
          <div className="contact-block">
            <h3>Email</h3>
            <p>support@assamtenancy.gov.in</p>
          </div>
        </div>
        <div className="contact-map-card" aria-label="Map to the office address">
          <iframe
            title="Office location map"
            className="contact-map"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=Directorate%20of%20Town%20and%20Country%20Planning%2C%20Assam&output=embed"
          />
        </div>
      </div>
    </section>
  )
}

export default Contact

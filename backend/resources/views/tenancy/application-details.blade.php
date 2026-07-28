<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tenancy Application - {{ $application->application_no }}</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: 'Times New Roman', Georgia, serif;
        font-size: 14px;
        line-height: 1.5;
        color: #000;
        margin: 0;
        padding: 24px;
        background: #f1f5f9;
      }
      .govt-form-document {
        position: relative;
        max-width: 800px;
        margin: 0 auto;
        background: #fff;
        border: 1px solid #cfd6e2;
        padding: 48px 56px;
      }
      .govt-form-header {
        text-align: center;
        margin-bottom: 30px;
      }
      .schedule-title {
        font-weight: bold;
        font-size: 1.2rem;
        text-transform: uppercase;
      }
      .section-reference {
        font-style: italic;
        margin-bottom: 5px;
      }
      .form-title {
        font-weight: bold;
        font-size: 1.1rem;
      }
      .addressee {
        margin-bottom: 20px;
      }
      .preview-list-item {
        display: flex;
        margin-bottom: 15px;
      }
      .preview-list-item .sl {
        width: 40px;
        flex: 0 0 40px;
      }
      .preview-list-item .label {
        flex: 1.5;
        padding-right: 10px;
      }
      .preview-list-item .value {
        flex: 2;
        word-break: break-word;
      }
      .charges-value {
        display: flex;
        flex-direction: column;
      }
      .signature-row {
        display: flex;
        justify-content: space-between;
        margin-top: 50px;
        margin-bottom: 30px;
      }
      .signature-block {
        text-align: center;
      }
      .signature-caption {
        margin-bottom: 10px;
      }
      .photo-box {
        border: 1px solid #000;
        width: 120px;
        height: 140px;
        margin: 10px auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fff;
        font-size: 0.8rem;
        text-align: center;
      }
      .photo-box img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
      }
      .sign-line {
        height: 50px;
        margin-top: 10px;
        display: flex;
        justify-content: center;
      }
      .sign-line img {
        max-height: 100%;
        max-width: 150px;
      }
      .enclosed {
        margin-top: 20px;
        margin-bottom: 10px;
      }
      .enclosed ol {
        margin-left: 20px;
        margin-top: 10px;
      }
      .enclosed li {
        margin-bottom: 5px;
      }
      @media print {
        body {
          padding: 0;
          background: #fff;
        }
        .govt-form-document {
          border: none;
          max-width: none;
        }
      }
    </style>
  </head>
  <body>
    @php
      $embedImages = ($embedImages ?? true) === true;

      $toDataUri = function ($path) use ($embedImages) {
          if (!$embedImages) {
              return null;
          }
          $full = $path ? public_path('storage/' . $path) : null;
          if (!$full || !is_file($full) || !is_readable($full)) {
              return null;
          }
          $mime = mime_content_type($full) ?: '';
          $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
          if (!in_array($mime, $allowed, true)) {
              return null;
          }
          $contents = file_get_contents($full);
          if ($contents === false) {
              return null;
          }
          return 'data:' . $mime . ';base64,' . base64_encode($contents);
      };

      $landlordPhotoSrc = $toDataUri($application->landlord_photo_path);
      $landlordSignatureSrc = $toDataUri($application->landlord_signature_path);
      $tenantPhotoSrc = $toDataUri($application->tenant_photo_path);
      $tenantSignatureSrc = $toDataUri($application->tenant_signature_path);

      $hasManager = $application->manager_name && $application->manager_name !== 'NA';
      $officeName = optional($application->office)->name;
      $districtName = optional($application->district)->name;
      $addressLine = $officeName
          ? trim($officeName . ($districtName ? ', ' . $districtName : ''))
          : '________________________';
    @endphp

    <div class="govt-form-document">
      <div class="govt-form-header">
        <div class="schedule-title">THE FIRST SCHEDULE</div>
        <div class="section-reference">[See section 4(1) and 7(2)]</div>
        <div class="form-title">FORM FOR INFORMATION OF TENANCY</div>
      </div>

      <div class="addressee">
        <div>To,</div>
        <div>The Rent Authority</div>
        <div>{{ $addressLine }} (Address)</div>
      </div>

      <div class="preview-list-container">
        <div class="preview-list-item">
          <div class="sl">1.</div>
          <div class="label">Name and address of the landlord</div>
          <div class="value">: {{ $application->landlord_name ? $application->landlord_name . ', ' . $application->landlord_address : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">2.</div>
          <div class="label">Name and address of the Property Manager (if any)</div>
          <div class="value">: {{ $hasManager ? $application->manager_name . ', ' . $application->manager_address : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">3.</div>
          <div class="label">Name(s) and address of the tenant, including email and contact details,</div>
          <div class="value">: {{ $application->tenant_name ? $application->tenant_name . ', ' . $application->tenant_address . ', Email: ' . $application->tenant_email . ', Phone: ' . $application->tenant_phone : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">4.</div>
          <div class="label">Description of previous tenancy, if any</div>
          <div class="value">: {{ $application->tenant_previous_tenancy }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">5.</div>
          <div class="label">Description of premises let to the tenant Including appurtenant land, if any</div>
          <div class="value">: {{ $application->property_premises_description }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">6.</div>
          <div class="label">Date from which possession is given to the tenant</div>
          <div class="value">: {{ $application->property_possession_date }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">7.</div>
          <div class="label">Rent payable as in section 8</div>
          <div class="value">: {{ $application->property_rent_payable ? '₹' . $application->property_rent_payable : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">8.</div>
          <div class="label">Furniture and other equipment provided to the tenant</div>
          <div class="value">: {{ $application->property_furniture_description }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">9.</div>
          <div class="label">
            Other charges payable<br />
            (a) Electricity<br />
            (b) Water<br />
            (c) Extra furnishing, fittings and fixtures<br />
            (d) Other services
          </div>
          <div class="value charges-value">
            <div>&nbsp;</div>
            <div>: {{ $application->property_charge_electricity }}</div>
            <div>: {{ $application->property_charge_water }}</div>
            <div>: {{ $application->property_charge_furnishing }}</div>
            <div>: {{ $application->property_charge_other_services }}</div>
          </div>
        </div>
        <div class="preview-list-item">
          <div class="sl">10.</div>
          <div class="label">Attach rent or lease or tenancy agreement</div>
          <div class="value">: Attached in uploads</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">11.</div>
          <div class="label">Duration of tenancy (Period for which let)</div>
          <div class="value">: {{ $application->property_tenancy_duration }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">12.</div>
          <div class="label">Permanent Account Number (PAN) of landlord:</div>
          <div class="value">: {{ $application->landlord_pan }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">13.</div>
          <div class="label">Aadhaar number of landlord:</div>
          <div class="value">: {{ $application->landlord_aadhar }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">14.</div>
          <div class="label">Mobile Number and E-mail id of landlord<br />(if available)</div>
          <div class="value">: {{ $application->landlord_phone }}, {{ $application->landlord_email }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">15.</div>
          <div class="label">Permanent Account Number (PAN) of tenant</div>
          <div class="value">: {{ $application->tenant_pan }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">16.</div>
          <div class="label">Aadhaar number of tenant</div>
          <div class="value">: {{ $application->tenant_aadhar }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">17.</div>
          <div class="label">Mobile Number and E-mail id of tenant</div>
          <div class="value">: {{ $application->tenant_phone }}, {{ $application->tenant_email }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">18.</div>
          <div class="label">Permanent Account Number (PAN) of Property Manager (if any)</div>
          <div class="value">: {{ $hasManager && $application->manager_pan && $application->manager_pan !== 'NA' ? $application->manager_pan : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">19.</div>
          <div class="label">Aadhaar number of Property Manager<br />(if any)</div>
          <div class="value">: {{ $hasManager ? $application->manager_aadhar : '' }}</div>
        </div>
        <div class="preview-list-item">
          <div class="sl">20.</div>
          <div class="label">Mobile Number and E-mail id of<br />Property Manager (if any)</div>
          <div class="value">: {{ $hasManager && $application->manager_phone && $application->manager_phone !== 'NA' ? $application->manager_phone . ($application->manager_email && $application->manager_email !== 'noemail@noemail.com' ? ', ' . $application->manager_email : '') : '' }}</div>
        </div>
      </div>

      <div class="signature-row">
        <div class="signature-block">
          <div class="signature-caption">Name and signature of landlord</div>
          <div class="photo-box">
            @if ($landlordPhotoSrc)
              <img src="{{ $landlordPhotoSrc }}" alt="Landlord Photo" />
            @else
              <span>Photograph<br />of<br />Landlord</span>
            @endif
          </div>
          <div class="sign-line">
            @if ($landlordSignatureSrc)
              <img src="{{ $landlordSignatureSrc }}" alt="Landlord Signature" />
            @endif
          </div>
        </div>
        <div class="signature-block">
          <div class="signature-caption">Name and signature of tenant</div>
          <div class="photo-box">
            @if ($tenantPhotoSrc)
              <img src="{{ $tenantPhotoSrc }}" alt="Tenant Photo" />
            @else
              <span>Photograph<br />of<br />Tenant</span>
            @endif
          </div>
          <div class="sign-line">
            @if ($tenantSignatureSrc)
              <img src="{{ $tenantSignatureSrc }}" alt="Tenant Signature" />
            @endif
          </div>
        </div>
      </div>

      <div class="enclosed">
        <strong>Enclosed:</strong>
        <ol>
          <li>Tenancy Agreement.</li>
          <li>Self-attested copies of PAN and Aadhaar of landlord.</li>
          <li>Self-attested copies of PAN and Aadhaar of tenant.</li>
        </ol>
      </div>
    </div>

    @if ($print)
      <script>
        window.addEventListener('load', () => {
          window.print()
        })
      </script>
    @endif
  </body>
</html>

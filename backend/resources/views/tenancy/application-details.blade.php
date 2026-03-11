<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Tenancy Application - {{ $application->application_no }}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        color: #0f172a;
        margin: 0;
        padding: 10px;
        background: #eef1f6;
      }
      .sheet {
        max-width: 760px;
        margin: 0 auto;
      }
      .card {
        border: 1px solid #cfd6e2;
        border-radius: 8px;
        background: #eef1f6;
        padding: 10px 12px;
        margin-bottom: 10px;
      }
      .document-header {
        text-align: center;
        margin: 4px 0 12px;
      }
      .document-header .schedule-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .document-header .section-reference {
        margin: 10px 0 14px;
        font-size: 14px;
        font-style: italic;
      }
      .document-header .form-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .title {
        margin: 0 0 8px;
        font-size: 12px;
        font-weight: 700;
      }
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 26px;
      }
      .field {
        display: grid;
        gap: 2px;
      }
      .label {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #475569;
        font-weight: 700;
      }
      .value {
        font-size: 12px;
        font-weight: 600;
        color: #0f172a;
        word-break: break-word;
      }
      a.value {
        color: #1d4ed8;
        text-decoration: underline;
      }
      .uploads-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 8px;
      }
      .uploads-table th,
      .uploads-table td {
        border: 1px solid #cfd6e2;
        padding: 6px;
        vertical-align: top;
        text-align: left;
      }
      .uploads-table th {
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #475569;
        font-weight: 700;
        background: #e9edf5;
      }
      .photo {
        width: 64px;
        height: 64px;
        object-fit: cover;
        border: 1px solid #cfd6e2;
      }
      .signature {
        width: 96px;
        height: 32px;
        object-fit: contain;
        border: 1px solid #cfd6e2;
        background: #fff;
      }
      .page-break-before {
        page-break-before: always;
        break-before: page;
      }
      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    @php
      $landlordPhotoFile = $application->landlord_photo_path ? public_path('storage/' . $application->landlord_photo_path) : null;
      $landlordSignatureFile = $application->landlord_signature_path ? public_path('storage/' . $application->landlord_signature_path) : null;
      $tenantPhotoFile = $application->tenant_photo_path ? public_path('storage/' . $application->tenant_photo_path) : null;
      $tenantSignatureFile = $application->tenant_signature_path ? public_path('storage/' . $application->tenant_signature_path) : null;
      $agreementPdfFile = $application->agreement_pdf_path ? public_path('storage/' . $application->agreement_pdf_path) : null;
      $agreementName = $application->agreement_pdf_path ? basename($application->agreement_pdf_path) : 'NA';
      $agreementUrl = $application->agreement_pdf_path ? url('storage/' . $application->agreement_pdf_path) : null;

      $toDataUri = function ($path) {
          if (!$path || !is_file($path) || !is_readable($path)) {
              return null;
          }
          $mime = mime_content_type($path) ?: '';
          $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
          if (!in_array($mime, $allowed, true)) {
              return null;
          }
          $contents = file_get_contents($path);
          if ($contents === false) {
              return null;
          }
          return 'data:' . $mime . ';base64,' . base64_encode($contents);
      };

      $landlordPhotoSrc = $toDataUri($landlordPhotoFile);
      $landlordSignatureSrc = $toDataUri($landlordSignatureFile);
      $tenantPhotoSrc = $toDataUri($tenantPhotoFile);
      $tenantSignatureSrc = $toDataUri($tenantSignatureFile);
    @endphp

    <div class="sheet">
      <div class="document-header">
        <p class="schedule-title">THE FIRST SCHEDULE</p>
        <p class="section-reference">[See section 4(1) and 7(2)]</p>
        <p class="form-title">FORM FOR INFORMATION OF TENANCY</p>
      </div>

      <div class="card">
        <p class="title">Registration</p>
        <div class="grid-2">
          <div class="field">
            <span class="label">Application No</span>
            <span class="value">{{ $application->application_no ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">&nbsp;</span>
            <span class="value">&nbsp;</span>
          </div>
          <div class="field">
            <span class="label">Date of Registration</span>
            <span class="value">{{ $application->registration_date ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Applied to Office</span>
            <span class="value">{{ optional($application->office)->name ?? 'N/A' }}</span>
          </div>
          <div class="field">
            <span class="label">Apply Type</span>
            <span class="value">{{ $application->apply_type ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Application Type</span>
            <span class="value">{{ $application->application_type ?? 'Tenancy Certificate' }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="title">Landlord Details</p>
        <div class="grid-2">
          <div class="field">
            <span class="label">Name</span>
            <span class="value">{{ $application->landlord_name ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Address</span>
            <span class="value">{{ $application->landlord_address ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Email</span>
            <span class="value">{{ $application->landlord_email ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Phone</span>
            <span class="value">{{ $application->landlord_phone ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">PAN No</span>
            <span class="value">{{ $application->landlord_pan ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">&nbsp;</span>
            <span class="value">&nbsp;</span>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="title">Property Manager Details</p>
        <div class="grid-2">
          <div class="field">
            <span class="label">Name</span>
            <span class="value">{{ $application->manager_name ?? 'NA' }}</span>
          </div>
          <div class="field">
            <span class="label">Address</span>
            <span class="value">{{ $application->manager_address ?? 'NA' }}</span>
          </div>
          <div class="field">
            <span class="label">Email</span>
            <span class="value">{{ $application->manager_email ?? 'NA' }}</span>
          </div>
          <div class="field">
            <span class="label">Phone</span>
            <span class="value">{{ $application->manager_phone ?? 'NA' }}</span>
          </div>
          <div class="field">
            <span class="label">PAN</span>
            <span class="value">{{ $application->manager_pan ?? 'NA' }}</span>
          </div>
          <div class="field">
            <span class="label">&nbsp;</span>
            <span class="value">&nbsp;</span>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="title">Tenant Details</p>
        <div class="grid-2">
          <div class="field">
            <span class="label">Name</span>
            <span class="value">{{ $application->tenant_name ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Address</span>
            <span class="value">{{ $application->tenant_address ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Email</span>
            <span class="value">{{ $application->tenant_email ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Phone</span>
            <span class="value">{{ $application->tenant_phone ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">PAN</span>
            <span class="value">{{ $application->tenant_pan ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Description of Previous Tenancy</span>
            <span class="value">{{ $application->tenant_previous_tenancy ?? '-' }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <p class="title">Property Details</p>
        <div class="grid-2">
          <div class="field">
            <span class="label">Date of Possession by Tenant</span>
            <span class="value">{{ $application->property_possession_date ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Rent Payable</span>
            <span class="value">{{ $application->property_rent_payable ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Description of Premises Let to Tenant Including Appurtenant Land if Any</span>
            <span class="value">{{ $application->property_premises_description ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Description of Furniture and Other Equipment Provided</span>
            <span class="value">{{ $application->property_furniture_description ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Other Charges - Electricity</span>
            <span class="value">{{ $application->property_charge_electricity ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Other Charges - Water</span>
            <span class="value">{{ $application->property_charge_water ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Other Charges - Extra Furnishing, Fittings and Fixtures</span>
            <span class="value">{{ $application->property_charge_furnishing ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Other Charges - Other Services</span>
            <span class="value">{{ $application->property_charge_other_services ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">Duration of Tenancy</span>
            <span class="value">{{ $application->property_tenancy_duration ?? '-' }}</span>
          </div>
          <div class="field">
            <span class="label">&nbsp;</span>
            <span class="value">&nbsp;</span>
          </div>
        </div>
      </div>

      <div class="card page-break-before">
        <p class="title">Uploads</p>
        <div class="field">
          <span class="label">Agreement (PDF)</span>
          @if ($agreementPdfFile && is_file($agreementPdfFile))
            @if ($agreementUrl)
              <a class="value" href="{{ $agreementUrl }}" target="_blank" rel="noopener noreferrer">Click here to open original agreement file</a>
            @endif
          @else
            <span class="value">Not uploaded</span>
          @endif
        </div>
        <table class="uploads-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Signature</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <span class="label">Landlord Photo</span><br />
                @if ($landlordPhotoSrc)
                  <img class="photo" src="{{ $landlordPhotoSrc }}" alt="Landlord Photo" />
                @else
                  <span class="value">Not uploaded</span>
                @endif
              </td>
              <td>
                <span class="label">Landlord Signature</span><br />
                @if ($landlordSignatureSrc)
                  <img class="signature" src="{{ $landlordSignatureSrc }}" alt="Landlord Signature" />
                @else
                  <span class="value">Not uploaded</span>
                @endif
              </td>
            </tr>
            <tr>
              <td>
                <span class="label">Tenant Photo</span><br />
                @if ($tenantPhotoSrc)
                  <img class="photo" src="{{ $tenantPhotoSrc }}" alt="Tenant Photo" />
                @else
                  <span class="value">Not uploaded</span>
                @endif
              </td>
              <td>
                <span class="label">Tenant Signature</span><br />
                @if ($tenantSignatureSrc)
                  <img class="signature" src="{{ $tenantSignatureSrc }}" alt="Tenant Signature" />
                @else
                  <span class="value">Not uploaded</span>
                @endif
              </td>
            </tr>
          </tbody>
        </table>
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

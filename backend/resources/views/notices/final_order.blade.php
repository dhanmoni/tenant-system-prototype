@extends('notices.layout')

@section('masthead')
    @include('notices._masthead', [
        'preTitle' => 'FINAL ORDER',
        'mainTitle' => 'FINAL ORDER',
    ])
@endsection

@section('body')
    <div class="bold" style="margin-bottom: 10px;">In the matter of:</div>
    <div class="block">
        <div class="bold">{{ $applicantName }}</div>
        <div>&hellip; Applicant/Petitioner</div>
        <div style="margin: 12px 0;">-Versus-</div>
        <div class="bold">{{ $respondentName }}</div>
        <div>&hellip; Opposite Party/Respondent</div>
    </div>

    <div class="centre bold" style="margin-bottom: 12px;">ORDER</div>

    <p class="para">An application concerning a tenancy dispute in respect of the premises situated
        at {{ $propertyAddress }} was filed before the {{ $officeName }} through the Assam Tenancy
        Portal under the Assam Tenancy Act, 2021 and the Rules made thereunder.</p>
    <p class="para">After the application was received, notice was issued to the parties and the
        matter was taken up for hearing/joint discussion on {{ $hearingDate }}. Both parties were
        given a reasonable opportunity to present their respective cases.</p>
    <p class="para">Both parties appeared before the {{ $officeName }} and were given a reasonable
        opportunity to be heard.</p>
    <p class="para">During the proceedings, both parties expressed their willingness to resolve the
        dispute amicably and, after discussion, agreed to the following terms and conditions:</p>

    <div class="verbatim">{{ $remarks }}</div>

    <p class="para">On consideration of the submissions and the terms placed on record, the
        {{ $officeName }} finds that the settlement was entered into voluntarily and, on the face of
        the record, is not contrary to law.</p>
    <p class="para">Accordingly, within the scope of the jurisdiction conferred by the Assam Tenancy
        Act, 2021 and the Rules made thereunder, the dispute is disposed of in terms of the
        settlement recorded above.</p>
    <p class="para">Both parties shall comply with the agreed terms within the stipulated period,
        subject to their obligations under applicable law.</p>
    <p class="para">The case accordingly stands disposed of in the above terms.</p>
    <p class="para bold">Ordered accordingly.</p>
@endsection

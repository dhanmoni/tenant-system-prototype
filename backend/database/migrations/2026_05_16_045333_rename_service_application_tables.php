<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::rename('rent_revision_applications', 'rent_authority_form_i_applications');
        Schema::rename('other_charges_revision_applications', 'rent_authority_form_ia_applications');
        Schema::rename('valuer_appointment_applications', 'rent_authority_form_ib_applications');
        Schema::rename('rent_court_possession_applications', 'rent_court_form_4_applications');
        Schema::rename('rent_court_filing_applications', 'rent_court_form_5_applications');
        Schema::rename('rent_authority_filing_applications', 'rent_authority_form_6_applications');
        Schema::rename('rent_court_appeal_applications', 'rent_court_form_7_applications');
        Schema::rename('rent_tribunal_appeal_applications', 'rent_tribunal_form_8_applications');
    }

    public function down()
    {
        Schema::rename('rent_authority_form_i_applications', 'rent_revision_applications');
        Schema::rename('rent_authority_form_ia_applications', 'other_charges_revision_applications');
        Schema::rename('rent_authority_form_ib_applications', 'valuer_appointment_applications');
        Schema::rename('rent_court_form_4_applications', 'rent_court_possession_applications');
        Schema::rename('rent_court_form_5_applications', 'rent_court_filing_applications');
        Schema::rename('rent_authority_form_6_applications', 'rent_authority_filing_applications');
        Schema::rename('rent_court_form_7_applications', 'rent_court_appeal_applications');
        Schema::rename('rent_tribunal_form_8_applications', 'rent_tribunal_appeal_applications');
    }
};

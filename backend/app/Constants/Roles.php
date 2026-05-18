<?php

namespace App\Constants;

class Roles
{
    public const SUPER_ADMIN = 'super_admin';
    public const DISTRICT_ADMIN = 'district_admin';
    public const USER = 'user';

    // Staff Roles (Principals)
    public const RENT_AUTHORITY = 'rent_authority';
    public const RENT_COURT = 'rent_court';
    public const RENT_TRIBUNAL = 'rent_tribunal';

    // Assistant Roles
    public const RA_ASSISTANT = 'ra_assistant';
    public const RC_ASSISTANT = 'rc_assistant';
    public const RT_ASSISTANT = 'rt_assistant';

    /**
     * Get all assistant roles.
     */
    public static function assistants(): array
    {
        return [
            self::RA_ASSISTANT,
            self::RC_ASSISTANT,
            self::RT_ASSISTANT,
        ];
    }

    /**
     * Get all principal staff roles.
     */
    public static function principals(): array
    {
        return [
            self::RENT_AUTHORITY,
            self::RENT_COURT,
            self::RENT_TRIBUNAL,
        ];
    }

    /**
     * Get all staff roles (assistants and principals).
     */
    public static function allStaff(): array
    {
        return array_merge(self::assistants(), self::principals());
    }

    /**
     * Get all administrative roles.
     */
    public static function allAdmin(): array
    {
        return [
            self::SUPER_ADMIN,
            self::DISTRICT_ADMIN,
        ];
    }

    /**
     * Get all management roles (admins and principals).
     */
    public static function allManagement(): array
    {
        return array_merge(self::allAdmin(), self::principals());
    }
}

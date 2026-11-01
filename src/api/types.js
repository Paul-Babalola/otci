// JSDoc types for the OTCI API. Editors (VS Code etc.) pick these up for
// autocomplete and checking in plain JS. Shapes marked "documented" come from
// a saved example in the Postman collection; shapes marked "assumed" are not
// documented there and must be confirmed against the backend (see
// docs/api-integration.md).

export {};

// ------------------------------------------------------------- enums

/** @typedef {'male'|'female'|'other'} Gender */
/** @typedef {'national_id'|'passport'|'drivers_license'|'voters_card'} CitizenIdType */
/** @typedef {'citizen'|'civil_servant'} UserType */
/**
 * @typedef {'pending'|'in_progress'|'eligible'|'ineligible'|'invited_interview'
 *   |'accepted'|'rejected'|'invited_idea_day'|'winner'} SubmissionStatus
 */
/**
 * Action keys accepted by the message-preview endpoints.
 * @typedef {'invite_interview'|'accept'|'reject'|'invite_idea_day'|'eligible'|'ineligible'|'winner'} SubmissionAction
 */
/** @typedef {'short_text'|'long_text'|'radio'|'checkbox'|'dropdown'|'multi_select'|'date'|'number'} FieldType */
/** @typedef {'admin'|'super_admin'} AdminRole */
/** @typedef {'ministry'|'agency'|'department'} MdaType */
/** @typedef {'csv'|'xlsx'} ExportFormat */

// ------------------------------------------------------------- common

/**
 * @typedef {Object} PageInfo
 * @property {number} total
 * @property {number} perPage
 * @property {number} currentPage
 * @property {number} lastPage
 * @property {number} from
 * @property {number} to
 */

/**
 * Normalised list response returned by every list function.
 * @template T
 * @typedef {Object} Paginated
 * @property {T[]} items
 * @property {PageInfo} page
 * @property {{first?:string,last?:string,prev?:string|null,next?:string|null}|null} links
 * @property {string} message
 * @property {AdminStats} [stats]  only on the unified admin list
 */

/** @typedef {{ page?: number, per_page?: number }} PageQuery */

/**
 * Email override accepted by every submission action. Empty strings mean
 * "use the default template".
 * @typedef {Object} EmailOverride
 * @property {string} [custom_subject]
 * @property {string} [custom_body]
 */

/**
 * Selection for bulk actions: explicit codes, or select_all with a status filter.
 * @typedef {Object} BulkSelection
 * @property {string[]} [submission_codes]
 * @property {boolean} [select_all]
 * @property {SubmissionStatus} [filter_status]
 */

// ------------------------------------------------------------- reference data (assumed)

/** @typedef {{ id: number, code?: string, name: string, is_others?: boolean, is_active?: boolean }} Sector */
/** @typedef {{ id: number, code?: string, name: string, type?: string }} Lga */
/** @typedef {{ id: number, code?: string, name: string, abbreviation?: string, type?: MdaType, is_active?: boolean }} Mda */

// ------------------------------------------------------------- public auth

/**
 * @typedef {Object} CitizenRegistration
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone
 * @property {string} email
 * @property {string} date_of_birth   YYYY-MM-DD
 * @property {Gender} gender
 * @property {number} lga_id
 * @property {CitizenIdType} means_of_id_type
 * @property {File|Blob} means_of_id   jpg/jpeg/png/pdf, max 10 MB
 * @property {string} password
 * @property {string} password_confirmation
 */

/**
 * @typedef {Object} CivilServantRegistration
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} phone
 * @property {string} email
 * @property {string} date_of_birth
 * @property {Gender} gender
 * @property {number} lga_id
 * @property {number} mda_id
 * @property {string} account_officer_email
 * @property {string} account_officer_role
 * @property {string} [designation]
 * @property {number} grade_level      1–100
 * @property {string} means_of_id_type the collection uses 'staff_id'
 * @property {File|Blob} means_of_id
 * @property {string} password
 * @property {string} password_confirmation
 */

/**
 * Assumed: the collection only shows that `data.token` exists.
 * @typedef {Object} AuthResult
 * @property {string} token
 * @property {PublicUser} [user]
 * @property {IdeaForm|null} [form]   "current active form", key name unconfirmed
 */

/**
 * Assumed shape.
 * @typedef {Object} PublicUser
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} [full_name]
 * @property {string} email
 * @property {string} [phone]
 * @property {UserType} user_type
 * @property {string} [means_of_id_url]
 */

// ------------------------------------------------------------- forms (assumed)

/** @typedef {{ id?: number, code?: string, label: string, value?: string }} FieldOption */

/**
 * @typedef {Object} FormField
 * @property {string} code               FLD-XXXXXXXX
 * @property {string} question_label
 * @property {FieldType|'file'} field_type
 * @property {string|null} [placeholder_text]
 * @property {string|null} [helper_text]
 * @property {boolean} is_required
 * @property {'sector'|null} [template_key]
 * @property {number} [sort_order]
 * @property {FieldOption[]} [options]
 */

/**
 * @typedef {Object} IdeaForm
 * @property {string} code
 * @property {string} title
 * @property {string} [description]
 * @property {string} [start_date]
 * @property {string} [end_date]
 * @property {boolean} [is_active]
 * @property {boolean} [is_accepting_responses]
 * @property {boolean} [is_current]
 * @property {string|null} [idea_day_date]
 * @property {string|null} [idea_day_time]
 * @property {string|null} [idea_day_venue]
 * @property {FormField[]} [fields]
 */

/** @typedef {{ field_code: string, answer: string|string[]|number }} Answer */

/** @typedef {{ answers: Answer[], sector_other?: string|null }} IdeaSubmission */

// ------------------------------------------------------------- invitations (documented)

/**
 * @typedef {Object} InvitationDetails
 * @property {string} name
 * @property {string} email
 * @property {AdminRole} role
 * @property {string} invited_by
 * @property {boolean} is_accepted
 * @property {boolean} is_expired
 */

/**
 * @typedef {Object} InvitationValidation
 * @property {boolean} valid
 * @property {string} [email]
 * @property {string} [name]
 * @property {AdminRole} [role]
 * @property {string} [role_label]
 * @property {string} [expires_at]
 * @property {string} [inviter_name]
 * @property {string} [reason]   assumed: the invalid-token example was not visible
 */

/**
 * The two collection requests for this URL disagree; pass whichever the
 * backend accepts (first_name + last_name is the newer one).
 * @typedef {Object} AcceptInvitation
 * @property {string} token
 * @property {string} [first_name]
 * @property {string} [last_name]
 * @property {string} [full_name]
 * @property {string} password
 * @property {string} password_confirmation
 */

// ------------------------------------------------------------- admin submissions

/**
 * Documented (List Submissions example).
 * @typedef {Object} SubmissionSummary
 * @property {number} id
 * @property {string} code
 * @property {string} title
 * @property {string} description
 * @property {SubmissionStatus} status
 * @property {string} status_label
 * @property {{ id: number, first_name: string, last_name: string, full_name: string, email: string, user_type: UserType }} user
 * @property {{ id: number, name: string }|null} sector
 * @property {string} submitted_at
 * @property {number} comments_count
 */

/**
 * Assumed beyond the fields listed in the collection's description.
 * @typedef {SubmissionSummary & {
 *   answers?: Array<{ field_code?: string, question_label: string, answer: any }>,
 *   allowed_transitions?: SubmissionStatus[],
 *   interview?: { scheduled_at?: string, venue?: string, notes?: string }|null
 * }} SubmissionDetail
 */

/**
 * @typedef {Object} SubmissionQuery
 * @property {SubmissionStatus} [status]
 * @property {UserType} [user_type]
 * @property {string} [form_code]
 * @property {string} [search]
 * @property {number} [page]
 * @property {number} [per_page]
 */

/**
 * Documented.
 * @typedef {Object} SubmissionStats
 * @property {number} total
 * @property {{ all: number, citizens: number, civil_servants: number }} user_types
 * @property {Record<SubmissionStatus, { key: SubmissionStatus, label: string, count: number }>} by_status
 * @property {Record<SubmissionStatus, number>} status_counts
 */

/**
 * @typedef {Object} ExportRequest
 * @property {ExportFormat} [format]
 * @property {string[]} [codes]
 * @property {boolean} [select_all]
 * @property {SubmissionStatus[]} [statuses]
 * @property {string} [from_date]
 * @property {string} [to_date]
 * @property {UserType} [user_type]
 */

/**
 * @typedef {Object} MessagePreviewContext
 * @property {string} [scheduled_at]  "YYYY-MM-DD HH:mm:ss"
 * @property {string} [venue]
 * @property {string} [reason]
 */

/** @typedef {{ body: string }} NewComment */

// ------------------------------------------------------------- admin events & reference

/**
 * @typedef {Object} EventInput
 * @property {string} title
 * @property {string} [description]
 * @property {string} start_date
 * @property {string} end_date
 * @property {boolean} [is_active]
 * @property {boolean} [is_accepting_responses]
 * @property {boolean} [is_current]
 * @property {string} [idea_day_date]
 * @property {string} [idea_day_time]
 * @property {string} [idea_day_venue]
 */

/**
 * @typedef {Object} FieldInput
 * @property {string} question_label
 * @property {FieldType} field_type
 * @property {string|null} [placeholder_text]
 * @property {string|null} [helper_text]
 * @property {boolean} [is_required]
 * @property {'sector'|null} [template_key]
 * @property {Array<{ label: string }>} [options]
 */

/** @typedef {{ name: string, is_active?: boolean }} SectorInput */
/** @typedef {{ name: string, abbreviation?: string, type: MdaType, is_active?: boolean }} MdaInput */

// ------------------------------------------------------------- admin management (documented)

/**
 * @typedef {Object} AdminStats
 * @property {number} total_admins
 * @property {number} active_admins
 * @property {number} super_admins
 * @property {number} pending_invites
 * @property {number} pending_invitations
 * @property {number} deactivated_admins
 */

/**
 * @typedef {Object} AdminRow
 * @property {number} id
 * @property {string|null} code
 * @property {'admin'|'invitation'} type
 * @property {string} name
 * @property {string} email
 * @property {AdminRole} role
 * @property {string} role_label
 * @property {'active'|'invited'|'deactivated'} status
 * @property {string} status_label
 * @property {string} date_added
 * @property {string} added_by
 * @property {string[]} available_actions
 * @property {boolean} can_change_role
 * @property {boolean} can_deactivate
 * @property {boolean} can_reactivate
 * @property {boolean} can_resend_invite
 * @property {boolean} can_revoke_invite
 */

/**
 * @typedef {Object} Admin
 * @property {string} code
 * @property {string} name
 * @property {string} email
 * @property {AdminRole} [role]
 * @property {string} [role_label]
 * @property {string} [status]
 * @property {string} [status_label]
 * @property {boolean} is_active
 * @property {string} [date_added]
 */

/**
 * @typedef {Object} Invitation
 * @property {number} id
 * @property {string} name
 * @property {string} email
 * @property {AdminRole} role
 * @property {string} invited_by
 * @property {boolean} is_accepted
 * @property {boolean} is_expired
 * @property {string|null} [accepted_at]
 * @property {string} expires_at
 */

/**
 * @typedef {Object} BatchInviteResult
 * @property {boolean} success
 * @property {number} total_sent
 * @property {Array<{ email: string, status: string, invitation_id: number }>} sent
 * @property {Array<{ email: string, reason?: string }>} skipped
 */

/**
 * @typedef {Object} InvitationPreview
 * @property {AdminRole} role
 * @property {string} role_label
 * @property {string} inviter_name
 * @property {string} expires_at
 * @property {number} expires_in_days
 * @property {string} default_subject
 * @property {string} default_body
 * @property {string} subject
 * @property {string} preview_body
 * @property {string} sample_button_text
 * @property {string} note
 * @property {string[]} allowed_placeholders
 */

/**
 * Supabase Auth (GoTrue) trả về thông báo lỗi bằng tiếng Anh.
 * Bảng ánh xạ dưới đây giúp hiển thị thông báo tiếng Việt cho người dùng.
 */

const BY_CODE: Record<string, string> = {
  invalid_credentials: 'Email hoặc mật khẩu không đúng. Vui lòng thử lại.',
  email_not_confirmed: 'Email chưa được xác minh. Vui lòng kiểm tra hộp thư và xác minh email.',
  user_already_exists: 'Tài khoản đã tồn tại. Vui lòng đăng nhập.',
  over_request_rate_limit: 'Quá nhiều lần thử. Vui lòng đợi 5 phút rồi thử lại.',
  over_email_send_rate_limit: 'Quá nhiều yêu cầu gửi email. Vui lòng đợi 5 phút rồi thử lại.',
  over_sms_send_rate_limit: 'Quá nhiều yêu cầu gửi tin nhắn. Vui lòng đợi 5 phút rồi thử lại.',
  weak_password: 'Mật khẩu quá yếu. Vui lòng dùng mật khẩu từ 6 ký tự trở lên.',
  validation_failed: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  email_address_invalid: 'Định dạng email không hợp lệ.',
  email_address_not_authorized: 'Email chưa được cấp quyền. Vui lòng kiểm tra hộp thư.',
  bad_json: 'Dữ liệu gửi lên không hợp lệ. Vui lòng thử lại.',
  unexpected_failure: 'Thao tác thất bại do lỗi hệ thống. Vui lòng thử lại sau.',
  session_not_found: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  token_expired: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  refresh_token_not_found: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  refresh_token_already_used: 'Phiên đăng nhập đã được làm mới ở nơi khác. Vui lòng đăng nhập lại.',
  new_password_should_differ_from_old_password: 'Mật khẩu mới phải khác mật khẩu cũ.',
  captcha_failed: 'Xác minh captcha thất bại. Vui lòng thử lại.',
  signup_disabled: 'Tính năng đăng ký đang tạm thời không khả dụng.',
  same_password: 'Mật khẩu mới phải khác mật khẩu cũ.',
  reauthentication_needed: 'Vui lòng đăng nhập lại để xác nhận danh tính.',
  otp_expired: 'Mã xác thực đã hết hạn. Vui lòng thử lại.',
  saml_provider_disabled: 'Nhà cung cấp đăng nhập không khả dụng. Vui lòng dùng email và mật khẩu.',
  manual_linking_disabled: 'Không thể liên kết tài khoản. Vui lòng đăng nhập bằng phương thức đã dùng trước đó.',
  database_error: 'Không thể lưu thông tin. Vui lòng thử lại.',
};

const BY_MESSAGE: [RegExp, string][] = [
  [/invalid login credentials/i, BY_CODE.invalid_credentials],
  [/email not confirmed/i, BY_CODE.email_not_confirmed],
  [/user already registered|already been registered|already in use/i, BY_CODE.user_already_exists],
  [/too many requests|rate limit|too many signups|security purposes/i, BY_CODE.over_request_rate_limit],
  [/unable to validate email|invalid email|email format/i, BY_CODE.email_address_invalid],
  [/password should be at least|weak password|password too weak/i, BY_CODE.weak_password],
  [/new password should be different|same password/i, BY_CODE.new_password_should_differ_from_old_password],
  [/token has expired|token expired/i, BY_CODE.token_expired],
  [/invalid refresh token|refresh token not found/i, BY_CODE.refresh_token_not_found],
  [/refresh token already used/i, BY_CODE.refresh_token_already_used],
  [/auth session missing|session not found/i, BY_CODE.session_not_found],
  [/reauthentication|not authenticated/i, BY_CODE.reauthentication_needed],
  [/captcha/i, BY_CODE.captcha_failed],
  [/signups not allowed|signup disabled|signups not allowed for otp/i, BY_CODE.signup_disabled],
  [/saml.*disabled|provider is disabled/i, BY_CODE.saml_provider_disabled],
  [/manual linking/i, BY_CODE.manual_linking_disabled],
  [/database error|constraint violation|duplicate key|violates/i, BY_CODE.database_error],
  [/unexpected failure|internal server error|500/i, BY_CODE.unexpected_failure],
];

const GENERIC = 'Thao tác thất bại. Vui lòng thử lại.';

export function translateAuthError(
  error: { code?: string | null; message?: string | null } | null | undefined,
  fallback: string = GENERIC,
): string {
  if (!error) return fallback;

  const byCode = error.code ? BY_CODE[error.code] : undefined;
  if (byCode) return byCode;

  const message = error.message ?? '';
  for (const [pattern, translated] of BY_MESSAGE) {
    if (pattern.test(message)) return translated;
  }

  return fallback;
}

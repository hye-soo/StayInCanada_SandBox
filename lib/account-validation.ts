export const MIN_PASSWORD_LENGTH = 12;

export interface AccountFormInput {
  name: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
}

export type AccountFormErrors = Partial<Record<keyof AccountFormInput, string>>;

export function validateAccountForm(input: AccountFormInput): AccountFormErrors {
  const errors: AccountFormErrors = {};
  if (!input.name.trim()) errors.name = "Enter your full name.";
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = "Passwords don't match.";
  }
  if (!input.acceptedTerms) {
    errors.acceptedTerms = "Agree to the terms and privacy notice to continue.";
  }
  return errors;
}

import { FormikErrors, FormikTouched } from "formik";

type FlatFormValues = Record<string, unknown>;

type SubmitWithToastOptions<TValues extends FlatFormValues> = {
  values: TValues;
  validateForm: () => Promise<FormikErrors<TValues>>;
  setTouched: (touched: FormikTouched<TValues>) => void;
  submitForm: () => void;
  showError: (title: string, message?: string) => void;
  toastTitle: string;
};

// Formik stores errors by field name. For a toast we only need one readable
// message, while the inline field errors still show the full details.
export function getFirstFormError<TValues extends FlatFormValues>(
  errors: FormikErrors<TValues>,
) {
  const firstError = Object.values(errors)[0];

  return typeof firstError === "string" ? firstError : "";
}

// When the user presses submit on an invalid form, mark every field as touched
// so inline errors appear at the same time as the toast.
export function touchAllFields<TValues extends FlatFormValues>(
  values: TValues,
) {
  return Object.keys(values).reduce(
    (touchedFields, fieldName) => ({
      ...touchedFields,
      [fieldName]: true,
    }),
    {} as FormikTouched<TValues>,
  );
}

// Shared submit behavior for Formik forms:
// 1. validate first
// 2. show one toast if invalid
// 3. mark fields touched so inline errors appear
// 4. submit only when the form is valid
export async function submitFormWithValidationToast<
  TValues extends FlatFormValues,
>({
  values,
  validateForm,
  setTouched,
  submitForm,
  showError,
  toastTitle,
}: SubmitWithToastOptions<TValues>) {
  const formErrors = await validateForm();
  const firstError = getFirstFormError(formErrors);

  if (firstError) {
    setTouched(touchAllFields(values));
    showError(toastTitle, firstError);
    return;
  }

  submitForm();
}

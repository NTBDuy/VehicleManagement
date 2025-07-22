import * as yup from 'yup';

const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

export const passwordSchema = (t: any) =>
  yup.object().shape({
    currentPassword: yup.string().required(t('validate.required.currentPassword')).trim(),

    newPassword: yup
      .string()
      .required(t('validate.required.newPassword'))
      .trim()
      .matches(strongPasswordRegex, t('validate.regex.password'))
      .test('not-same-as-current', t('validate.regex.differentPassword'), function (value) {
        return value !== this.parent.currentPassword;
      }),

    confirmPassword: yup
      .string()
      .required(t('validate.required.confirmPassword'))
      .oneOf([yup.ref('newPassword')], t('validate.regex.differentPassword')),
  });

import * as yup from 'yup';

export const reasonSchema = (t: any) =>
  yup.object().shape({
    reason: yup.string().required(t('validate.required.reason')).trim(),
  });

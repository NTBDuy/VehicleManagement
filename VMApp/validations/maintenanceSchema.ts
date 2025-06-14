import * as yup from 'yup';

export const maintenanceSchema = (t: any) =>
  yup.object().shape({
    estimatedEndDate: yup
      .number()
      .required(t('validate.required.estimate'))
      .min(1, t('validate.regex.estimate')),

    description: yup
      .string()
      .required(t('validate.required.description'))

  });
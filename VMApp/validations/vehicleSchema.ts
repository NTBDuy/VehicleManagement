import * as yup from 'yup';

export const vehicleSchema = (t: any) =>
  yup.object().shape({
    licensePlate: yup
      .string()
      .required(t('validate.required.plate'))
      .trim()
      .matches(/^[0-9]{2}[A-Z]{1}[0-9A-Z]?-?[0-9]{4,5}$/, t('validate.regex.plate')),

    brand: yup
      .string()
      .required(t('validate.required.brand'))
      .trim()
      .min(1, t('validate.required.brand')),

    model: yup
      .string()
      .required(t('validate.required.model'))
      .trim()
      .min(1, t('validate.required.model')),

    type: yup
      .string()
      .required(t('validate.required.type'))
      .oneOf(['Sedan', 'SUV', 'Truck', 'Van'], t('validate.required.type')),
  });
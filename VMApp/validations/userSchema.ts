import * as yup from 'yup';

export const userSchema = (t: any) =>
  yup.object().shape({
    fullName: yup
      .string()
      .required(t('validate.required.fullname'))
      .trim(),

    email: yup
      .string()
      .required(t('validate.required.email'))
      .trim()
      .matches(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
        t('validate.regex.email')
      ),

    phoneNumber: yup
      .string()
      .required(t('validate.required.phone'))
      .trim()
      .matches(
        /^[0-9]{9,10}$/, 
        t('validate.regex.phone')
      ),
  });
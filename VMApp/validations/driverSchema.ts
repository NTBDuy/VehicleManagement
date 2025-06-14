import * as yup from 'yup';

export const driverSchema = (t: any) =>
  yup.object().shape({
    fullName: yup.string().required(t('validate.required.fullname')).trim(),

    phoneNumber: yup
      .string()
      .required(t('validate.required.phone'))
      .trim()
      .matches(/^[0-9]{9,10}$/, t('validate.regex.phone')),

    licenseNumber: yup.string().required(t('validate.required.license')),

    licenseIssuedDate: yup
      .string()
      .required(t('validate.required.licenseIssueDate'))
      .trim()
      .matches(
        /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
        t('validate.regex.licenseIssueDate')
      ),

    yearsOfExperience: yup
      .number()
      .required(t('validate.required.yearOfExperience'))
      .min(1, t('validate.regex.yearOfExperience')),
  });

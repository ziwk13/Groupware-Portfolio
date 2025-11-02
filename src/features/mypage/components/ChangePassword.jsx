// [파일명: ChangePassword.jsx]

import { useState } from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import { gridSpacing } from 'store/constant';

// 폼 관리
import { Form, Formik } from 'formik';
import * as Yup from 'yup';

// API 직접 임포트 대신 useAuth 훅 사용
import useAuth from 'hooks/useAuth';

export default function ChangePassword() {
  // useAuth 훅에서 updatePassword 함수 가져오기
  const { updatePassword } = useAuth();
  const [successMessage, setSuccessMessage] = useState(null);

  return (
    <Formik
      initialValues={{
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        submit: null
      }}
      // 유효성 검사 스키마
      validationSchema={Yup.object().shape({
        currentPassword: Yup.string().required('현재 비밀번호를 입력해주세요.'),
        newPassword: Yup.string()
          .required('새 비밀번호를 입력해주세요.')
          .min(8, '비밀번호는 8자 이상 20자 이하로 입력해주세요.')
          .max(20, '비밀번호는 8자 이상 20자 이하로 입력해주세요.'),
        confirmPassword: Yup.string()
          .required('새 비밀번호 확인을 입력해주세요.')
          .oneOf([Yup.ref('newPassword'), null], '새 비밀번호가 일치하지 않습니다.')
      })}
      // 폼 제출(submit) 시 실행될 핸들러
      onSubmit={async (values, { setErrors, setStatus, setSubmitting, resetForm }) => {
        setSuccessMessage(null);

        try {
          // API DTO에 맞는 객체 생성
          const data = {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword
          };

          // Context에서 가져온 updatePassword 함수 호출
          await updatePassword(data);

          // 성공 처리
          setStatus({ success: true });
          setSubmitting(false);
          setSuccessMessage('비밀번호가 성공적으로 변경되었습니다.');
          resetForm();
        } catch (err) {
          // 에러 처리
          const errorMessage = err.message || '비밀번호 변경에 실패했습니다.';

          setStatus({ success: false });
          setErrors({ submit: errorMessage });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldTouched }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={gridSpacing}>
            {errors.submit && (
              <Grid size={12}>
                <Alert severity="error" sx={{ width: '100%' }}>
                  {errors.submit}
                </Alert>
              </Grid>
            )}

            {successMessage && (
              <Grid size={12}>
                <Alert severity="success" sx={{ width: '100%' }}>
                  {successMessage}
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="현재 비밀번호"
                type="password"
                name="currentPassword"
                value={values.currentPassword}
                onBlur={handleBlur}
                onChange={handleChange}
                error={Boolean(touched.currentPassword && errors.currentPassword)}
                helperText={touched.currentPassword && errors.currentPassword}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} />

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="변경할 비밀번호"
                type="password"
                name="newPassword"
                value={values.newPassword}
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  setFieldTouched('newPassword', true, false);
                  if (touched.confirmPassword) {
                    setFieldTouched('confirmPassword', true, true);
                  }
                }}
                error={Boolean(touched.newPassword && errors.newPassword)}
                helperText={touched.newPassword && errors.newPassword}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="변경할 비밀번호 재입력"
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onBlur={handleBlur}
                onChange={(e) => {
                  handleChange(e);
                  setFieldTouched('confirmPassword', true, false);
                }}
                error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
              />
            </Grid>

            <Grid size={12}>
              <Stack direction="row" justifyContent="flex-end">
                <AnimateButton>
                  <Button variant="outlined" size="large" type="submit" disabled={isSubmitting}>
                    비밀번호 변경
                  </Button>
                </AnimateButton>
              </Stack>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
}
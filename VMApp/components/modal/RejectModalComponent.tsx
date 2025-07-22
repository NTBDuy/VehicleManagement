import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { showToast } from 'utils/toast';
import { yupResolver } from '@hookform/resolvers/yup';
import { RequestService } from '@/services/requestService';
import { Controller, useForm } from 'react-hook-form';
import { reasonSchema } from '@/validations/reasonSchema';

import ReasonFormData from '@/types/ReasonFormData';

import InputField from '@/components/ui/InputFieldComponent';

Dimensions.get('window');

interface RejectModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: number;
  onSuccess: () => void;
}

const RejectModal = ({ visible, onClose, requestId, onSuccess }: RejectModalProps) => {
  const { t } = useTranslation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const getReasonSchema = reasonSchema(t);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible, fadeAnim, slideAnim]);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ReasonFormData>({
    resolver: yupResolver(getReasonSchema),
    defaultValues: {
      reason: '',
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: ReasonFormData) => {
    try {
      await RequestService.rejectRequest(requestId, data);
      showToast.success(`${t('common.success.title')}`, `${t('common.success.reject')}`);
      onSuccess();
      reset({
        reason: '',
      });
      handleClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleReject = () => {
    handleSubmit(onSubmit, (errors) => {
      console.log('Validation errors:', errors);
    })();
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      requestAnimationFrame(() => {
        reset({ reason: '' });
        onClose();
      });
    });
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
        }}>
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-end">
              <TouchableOpacity onPress={handleClose} className="flex-1" activeOpacity={1} />
              <Animated.View
                style={{
                  transform: [{ translateY: slideAnim }],
                }}
                className="rounded-t-2xl bg-gray-50 p-6 pb-12">
                <Text className="mb-6 text-center text-lg font-bold">
                  {t('common.confirmation.title.reject')}
                </Text>

                <View className="mb-4">
                  <Text className="text-lg font-semibold text-gray-800">
                    {t('common.confirmation.message.reject')}
                  </Text>
                </View>

                <View className="mb-6">
                  <Controller
                    control={control}
                    name="reason"
                    render={({ field: { onChange, value } }) => (
                      <InputField
                        label={t('common.fields.reason')}
                        value={value}
                        onChangeText={onChange}
                        error={errors.reason?.message}
                      />
                    )}
                  />
                </View>

                <View className="flex-row justify-between">
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-gray-600 py-3"
                    onPress={handleClose}>
                    <Text className="text-lg font-semibold text-white">
                      {t('common.button.close')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-[48%] items-center justify-center rounded-lg bg-red-600 py-3"
                    onPress={handleReject}
                    disabled={isSubmitting}>
                    <Text className="text-lg font-semibold text-white">
                      {isSubmitting
                        ? `${t('common.button.processing')}`
                        : `${t('common.button.reject')}`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

export default RejectModal;

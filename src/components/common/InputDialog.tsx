// src/components/common/InputDialog.tsx
import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, LAYOUT } from '../../../constants/colors';

interface InputDialogProps {
  visible: boolean;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export default function InputDialog({
  visible,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  keyboardType = 'default',
  onSubmit,
  onCancel,
}: InputDialogProps) {
  const [inputValue, setInputValue] = useState(defaultValue);

  const handleSubmit = () => {
    onSubmit(inputValue.trim());
    setInputValue('');
  };

  const handleCancel = () => {
    setInputValue(defaultValue);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
          </View>
          
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textSecondary}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType={keyboardType}
            autoFocus
            selectTextOnFocus
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: LAYOUT.spacing.xl,
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: LAYOUT.radius.md,
    padding: LAYOUT.spacing.xl,
    minWidth: 280,
    maxWidth: 400,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    ...LAYOUT.typography.subtitle,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  message: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: LAYOUT.radius.sm,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: LAYOUT.spacing.xl,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  submitButton: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.sm,
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    ...LAYOUT.typography.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButtonText: {
    ...LAYOUT.typography.body,
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
  },
});

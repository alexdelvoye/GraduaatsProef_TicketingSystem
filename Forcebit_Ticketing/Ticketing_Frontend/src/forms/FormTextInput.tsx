import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
} from "react-native";

import { homeStyles } from "../styles/homeStyles";
import { colors } from "../styles/theme";

type FormTextInputProps = TextInputProps & {
  error?: string;
  touched?: boolean;
  errorInputStyle?: StyleProp<TextStyle>;
  errorTextStyle?: StyleProp<TextStyle>;
};

export function FormTextInput({
  error,
  touched,
  errorInputStyle,
  errorTextStyle,
  style,
  placeholderTextColor = colors.muted,
  ...props
}: FormTextInputProps) {
  // Formik tracks "touched" separately from "error".
  // We only show the validation message after the user has interacted with the
  // field, so the form does not start in an angry red state.
  const showError = Boolean(touched && error);

  return (
    <View>
      {/* Native TextInput props are spread first so this component can be reused
         for password, email, multiline and normal text inputs. */}
      <TextInput
        {...props}
        style={[
          homeStyles.input,
          style,
          // React Native style arrays apply later entries last, so the error
          // style can override the normal border color.
          showError && (errorInputStyle ?? homeStyles.inputError),
        ]}
        placeholderTextColor={placeholderTextColor}
      />
      {showError ? (
        <Text style={[homeStyles.fieldErrorText, errorTextStyle]}>{error}</Text>
      ) : null}
    </View>
  );
}

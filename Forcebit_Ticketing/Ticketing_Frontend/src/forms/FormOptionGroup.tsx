import { Pressable, Text, View } from "react-native";

import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles } from "../styles/homeStyles";

type FormOptionGroupProps<T extends string> = {
  value: T;
  options: readonly T[];
  getLabel?: (option: T) => string;
  onChange: (value: T) => void;
  error?: string;
  touched?: boolean;
};

export function FormOptionGroup<T extends string>({
  value,
  options,
  getLabel = (option) => option,
  onChange,
  error,
  touched,
}: FormOptionGroupProps<T>) {
  // Option groups can contain many enum values. On smaller screens each option
  // grows into a comfortable touch target instead of staying tiny.
  const { isCompact } = useResponsiveLayout();

  // Same pattern as FormTextInput: only show validation after the field was
  // touched, otherwise a new form would immediately look invalid.
  const showError = Boolean(touched && error);

  return (
    <View>
      <View
        style={[
          homeStyles.optionGrid,
          isCompact ? homeStyles.optionGridCompact : null,
        ]}
      >
        {options.map((item) => (
          <Pressable
            key={item}
            style={[
              homeStyles.optionButton,
              isCompact ? homeStyles.optionButtonCompact : null,
              // The selected style is added second so it can override the
              // normal button colors.
              value === item && homeStyles.optionButtonSelected,
            ]}
            onPress={() => onChange(item)}
          >
            <Text
              style={[
                homeStyles.optionButtonText,
                value === item && homeStyles.optionButtonTextSelected,
              ]}
            >
              {getLabel(item)}
            </Text>
          </Pressable>
        ))}
      </View>

      {showError ? (
        <Text style={homeStyles.fieldErrorText}>{error}</Text>
      ) : null}
    </View>
  );
}

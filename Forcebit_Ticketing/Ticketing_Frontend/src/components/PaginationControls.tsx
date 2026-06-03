import { Pressable, Text, View } from "react-native";

import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { homeStyles as styles } from "../styles/homeStyles";

type PaginationControlsProps = {
  itemLabel: string;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

export function PaginationControls({
  itemLabel,
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,
}: PaginationControlsProps) {
  const { isNarrow } = useResponsiveLayout();

  if (totalPages <= 1) {
    return null;
  }

  return (
    // Generic pagination controls keep conversations, client rows, and ticket
    // sections visually and behaviorally consistent.
    <View
      style={[
        styles.paginationBar,
        isNarrow ? styles.paginationBarNarrow : null,
      ]}
    >
      <View>
        <Text style={styles.paginationSummary}>
          {startItem}-{endItem} of {totalItems} {itemLabel}
        </Text>
        <Text style={styles.paginationSubtext}>
          Page {currentPage} of {totalPages}
        </Text>
      </View>

      <View
        style={[
          styles.paginationActions,
          isNarrow ? styles.paginationActionsNarrow : null,
        ]}
      >
        <Pressable
          style={[
            styles.secondaryButton,
            styles.paginationButton,
            isNarrow ? styles.secondaryButtonCompact : null,
            !canGoPrevious && styles.buttonDisabled,
          ]}
          onPress={onPrevious}
          disabled={!canGoPrevious}
        >
          <Text style={styles.secondaryButtonText}>Previous</Text>
        </Pressable>

        <Pressable
          style={[
            styles.secondaryButton,
            styles.paginationButton,
            isNarrow ? styles.secondaryButtonCompact : null,
            !canGoNext && styles.buttonDisabled,
          ]}
          onPress={onNext}
          disabled={!canGoNext}
        >
          <Text style={styles.secondaryButtonText}>Next</Text>
        </Pressable>
      </View>
    </View>
  );
}

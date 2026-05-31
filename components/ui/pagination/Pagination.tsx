import React, {useRef, useState} from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import {Text} from '../Text';

export interface PaginationProps<T> {
  data: T[];
  renderItem: (info: {
    item: T;
    index: number;
    total: number;
  }) => React.ReactNode;
  previousLabel?: string;
  nextLabel?: string;
}

export function Pagination<T>({
  data,
  renderItem,
  previousLabel = '← Previous',
  nextLabel = 'Next →',
}: PaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = data.length;
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  const scrollRef = useRef<ScrollView>(null);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-15, 15])
    .simultaneousWithExternalGesture(scrollRef)
    .onEnd(({translationX}) => {
      if (translationX < -50 && safePage < totalPages - 1) {
        setCurrentPage(p => p + 1);
      } else if (translationX > 50 && safePage > 0) {
        setCurrentPage(p => p - 1);
      }
    });

  if (totalPages === 0) {
    return null;
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={styles.container}>
        <ScrollView ref={scrollRef} style={styles.content}>
          {renderItem({
            item: data[safePage],
            index: safePage,
            total: totalPages,
          })}
        </ScrollView>

        {totalPages > 1 && (
          <View style={styles.paginationBar}>
            {safePage > 0 ? (
              <TouchableOpacity
                testID="pagination-previous"
                onPress={() => setCurrentPage(p => p - 1)}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>{previousLabel}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pageButton} />
            )}

            <View style={styles.dots}>
              {Array.from({length: totalPages}, (_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === safePage && styles.dotActive]}
                />
              ))}
            </View>

            {safePage < totalPages - 1 ? (
              <TouchableOpacity
                testID="pagination-next"
                onPress={() => setCurrentPage(p => p + 1)}
                style={styles.pageButton}>
                <Text style={styles.pageButtonText}>{nextLabel}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.pageButton} />
            )}
          </View>
        )}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  paginationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  pageButton: {
    minWidth: 80,
  },
  pageButtonText: {
    color: '#951F6F',
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 14,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  dotActive: {
    backgroundColor: '#951F6F',
  },
});

import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useLibrary } from '../context/LibraryContext';

export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { books, borrowBook, returnBook, getBorrowedQuantity } =
    useLibrary();

  const [borrowQuantity, setBorrowQuantity] = useState(1);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [processing, setProcessing] = useState(false);

  const book = books.find((item) => item.id === id);
  const borrowedQuantity = useMemo(
    () => (book ? getBorrowedQuantity(book.id) : 0),
    [book, getBorrowedQuantity]
  );

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Không tìm thấy sách</Text>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonErrorText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBorrow = async () => {
    if (processing) return;

    if (borrowQuantity < 1 || borrowQuantity > book.quantity) {
      Alert.alert('Thông báo', 'Số lượng mượn không hợp lệ.');
      return;
    }

    setProcessing(true);
    const success = await borrowBook(book.id, borrowQuantity);
    setProcessing(false);

    if (success) {
      setBorrowQuantity(1);
      Alert.alert(
        'Mượn sách thành công',
        `Bạn đã mượn ${borrowQuantity} quyển "${book.title}". Hạn trả: 3 tháng kể từ ngày mượn.`
      );
    } else {
      Alert.alert(
        'Không thể mượn sách',
        'Không đủ số lượng sách hoặc thao tác không thành công.'
      );
    }
  };

  const handleReturn = async () => {
    if (processing) return;

    if (returnQuantity < 1 || returnQuantity > borrowedQuantity) {
      Alert.alert('Thông báo', 'Số lượng trả không hợp lệ.');
      return;
    }

    setProcessing(true);
    const success = await returnBook(book.id, returnQuantity);
    setProcessing(false);

    if (success) {
      Alert.alert(
        'Trả sách thành công',
        `Bạn đã trả ${returnQuantity} quyển "${book.title}".`
      );
      setReturnQuantity(1);
    } else {
      Alert.alert(
        'Không thể trả sách',
        'Không thể cập nhật thông tin trả sách.'
      );
    }
  };

  const increaseBorrow = () => {
    setBorrowQuantity((value) => Math.min(value + 1, book.quantity));
  };

  const decreaseBorrow = () => {
    setBorrowQuantity((value) => Math.max(value - 1, 1));
  };

  const increaseReturn = () => {
    setReturnQuantity((value) => Math.min(value + 1, borrowedQuantity));
  };

  const decreaseReturn = () => {
    setReturnQuantity((value) => Math.max(value - 1, 1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết sách</Text>
        <View style={styles.headerSpace} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.bookImageContainer}>
          <Text style={styles.bookImage}>📖</Text>
        </View>

        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>Tác giả: {book.author}</Text>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{book.category}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Thông tin sách</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ISBN</Text>
            <Text style={styles.infoValue}>{book.isbn}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số lượng còn lại</Text>
            <Text style={styles.infoValue}>{book.quantity} quyển</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái</Text>
            <Text
              style={[
                styles.infoValue,
                book.available ? styles.available : styles.unavailable,
              ]}
            >
              {book.available ? 'Còn sách' : 'Hết sách'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bạn đang mượn</Text>
            <Text
              style={[
                styles.infoValue,
                borrowedQuantity > 0
                  ? styles.borrowed
                  : styles.notBorrowed,
              ]}
            >
              {borrowedQuantity} quyển
            </Text>
          </View>
        </View>

        <View style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.description}>
            {book.description || 'Chưa có mô tả cho sách này.'}
          </Text>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Mượn sách</Text>
          <Text style={styles.hint}>Thời hạn trả: 3 tháng</Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseBorrow}
              disabled={processing || borrowQuantity <= 1}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{borrowQuantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseBorrow}
              disabled={processing || borrowQuantity >= book.quantity}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.borrowButton,
              (!book.available || processing) && styles.disabledButton,
            ]}
            onPress={handleBorrow}
            disabled={!book.available || processing}
          >
            <Text style={styles.buttonText}>
              {processing ? 'ĐANG XỬ LÝ...' : 'MƯỢN SÁCH'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>Trả sách</Text>
          <Text style={styles.hint}>
            {borrowedQuantity > 0
              ? `Bạn đang mượn ${borrowedQuantity} quyển`
              : 'Bạn chưa mượn sách này'}
          </Text>

          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={decreaseReturn}
              disabled={processing || borrowedQuantity === 0 || returnQuantity <= 1}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </TouchableOpacity>

            <Text style={styles.quantityText}>{returnQuantity}</Text>

            <TouchableOpacity
              style={styles.quantityButton}
              onPress={increaseReturn}
              disabled={
                processing ||
                borrowedQuantity === 0 ||
                returnQuantity >= borrowedQuantity
              }
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.returnButton,
              (borrowedQuantity === 0 || processing) &&
                styles.disabledButton,
            ]}
            onPress={handleReturn}
            disabled={borrowedQuantity === 0 || processing}
          >
            <Text style={styles.buttonText}>
              {processing ? 'ĐANG XỬ LÝ...' : 'TRẢ SÁCH'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5EEF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 32,
    color: '#163A63',
    lineHeight: 36,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#163A63',
  },
  headerSpace: {
    width: 42,
  },
  content: {
    paddingBottom: 30,
  },
  bookImageContainer: {
    width: 150,
    height: 190,
    borderRadius: 16,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  bookImage: {
    fontSize: 75,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#163A63',
    textAlign: 'center',
    lineHeight: 31,
  },
  author: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  categoryBadge: {
    alignSelf: 'center',
    backgroundColor: '#E5EEF9',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 12,
  },
  categoryText: {
    color: '#1E6FD9',
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#163A63',
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  infoLabel: {
    fontSize: 14,
    color: '#777',
  },
  infoValue: {
    fontSize: 14,
    color: '#222',
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 8,
  },
  available: {
    color: '#2E8B57',
  },
  unavailable: {
    color: '#D9534F',
  },
  borrowed: {
    color: '#1E6FD9',
  },
  notBorrowed: {
    color: '#777',
  },
  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginTop: 14,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#163A63',
  },
  hint: {
    fontSize: 14,
    color: '#777',
    marginTop: 6,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 20,
  },
  quantityButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E5EEF9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 26,
    color: '#163A63',
    fontWeight: 'bold',
  },
  quantityText: {
    minWidth: 35,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#163A63',
  },
  borrowButton: {
    height: 54,
    backgroundColor: '#1E6FD9',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  returnButton: {
    height: 54,
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#AAAAAA',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D9534F',
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: '#1E6FD9',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonErrorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

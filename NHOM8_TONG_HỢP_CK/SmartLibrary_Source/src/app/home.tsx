
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { useMemo } from 'react';
import { useLibrary } from '../context/LibraryContext';

import { auth } from '../config/firebase';

export default function HomeScreen() {
  const { books, borrowRecords } = useLibrary();

  // Chỉ lấy các lượt mượn hiện tại của tài khoản đang đăng nhập.
  const activeBorrowRecords = useMemo(
    () =>
      borrowRecords.filter(
        (record) =>
          record.status === 'borrowed' &&
          record.userId === auth.currentUser?.uid
      ),
    [borrowRecords]
  );

  // Tổng số quyển sách người dùng đang mượn.
  const totalBorrowedBooks = useMemo(
    () =>
      activeBorrowRecords.reduce(
        (total, record) => total + Number(record.quantity ?? 1),
        0
      ),
    [activeBorrowRecords]
  );

  // Gom số lượng theo từng tên sách.
  const borrowedByBook = useMemo(() => {
    const bookMap: Record<
      string,
      { title: string; quantity: number }
    > = {};

    activeBorrowRecords.forEach((record) => {
      const book = books.find((item) => item.id === record.bookId);
      if (!book) return;

      if (!bookMap[book.id]) {
        bookMap[book.id] = {
          title: book.title,
          quantity: 0,
        };
      }

      bookMap[book.id].quantity += Number(record.quantity ?? 1);
    });

    return Object.entries(bookMap);
  }, [activeBorrowRecords, books]);

  // Đăng xuất tài khoản
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/');
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);

      Alert.alert(
        'Lỗi',
        'Không thể đăng xuất. Vui lòng thử lại.'
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Phần tiêu đề */}
      <View style={styles.header}>
        <Text style={styles.title}>SmartLibrary</Text>

        <Text style={styles.subtitle}>
          Hệ thống quản lý thư viện thông minh
        </Text>

        <Text style={styles.welcome}>
          Chào mừng bạn đến với thư viện
        </Text>
      </View>

      {/* Thống kê sách đang mượn */}
      <View style={styles.borrowSummaryCard}>
        <Text style={styles.summaryTitle}>Tổng sách đang mượn</Text>
        <Text style={styles.totalBorrowed}>{totalBorrowedBooks}</Text>
        <Text style={styles.summaryDescription}>quyển sách</Text>
      </View>

      <View style={styles.borrowedBooksCard}>
        <Text style={styles.borrowedBooksTitle}>
          Số lượng theo từng tên sách
        </Text>

        {borrowedByBook.length === 0 ? (
          <Text style={styles.emptyBorrowedText}>
            Bạn hiện chưa mượn sách nào.
          </Text>
        ) : (
          borrowedByBook.map(([bookId, book]) => (
            <View key={bookId} style={styles.borrowedBookRow}>
              <Text style={styles.borrowedBookTitle}>{book.title}</Text>
              <Text style={styles.borrowedBookQuantity}>
                {book.quantity} quyển
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Danh sách chức năng */}
      <View style={styles.menuContainer}>
        {/* Tìm kiếm sách */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/books')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔍</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Tìm kiếm sách
            </Text>

            <Text style={styles.cardDescription}>
              Tìm kiếm sách theo tên, tác giả, thể loại
              hoặc mã ISBN.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Quét mã vạch */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/scan-book')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📷</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Quét mã vạch
            </Text>

            <Text style={styles.cardDescription}>
              Quét mã vạch để tìm kiếm thông tin sách
              nhanh chóng.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Lịch sử mượn sách */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/borrow-history')}
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📚</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Lịch sử mượn sách
            </Text>

            <Text style={styles.cardDescription}>
              Xem danh sách sách đã mượn, đã trả và
              thời hạn trả sách.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* Thông tin tài khoản */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            Alert.alert(
              'Thông tin tài khoản',
              auth.currentUser?.email ||
                'Không có thông tin tài khoản'
            )
          }
          activeOpacity={0.8}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>👤</Text>
          </View>

          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              Thông tin tài khoản
            </Text>

            <Text style={styles.cardDescription}>
              Xem email và thông tin tài khoản đang
              đăng nhập.
            </Text>
          </View>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Khu vực đăng xuất */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>
          Đăng xuất
        </Text>
      </TouchableOpacity>

      {/* Chân trang */}
      <Text style={styles.footer}>
        SmartLibrary © 2026
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
  },

  welcome: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },

  borrowSummaryCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },

  totalBorrowed: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginVertical: 6,
  },

  summaryDescription: {
    fontSize: 14,
    color: '#475569',
  },

  borrowedBooksCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  borrowedBooksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },

  borrowedBookRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  borrowedBookTitle: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    marginRight: 12,
  },

  borrowedBookQuantity: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2563eb',
  },

  emptyBorrowedText: {
    fontSize: 14,
    color: '#64748b',
  },

  menuContainer: {
    gap: 16,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    minHeight: 110,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  icon: {
    fontSize: 28,
  },

  cardContent: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
  },

  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
  },

  arrow: {
    fontSize: 32,
    color: '#94a3b8',
    marginLeft: 8,
  },

  logoutButton: {
    backgroundColor: '#dc2626',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 30,
  },

  logoutText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 25,
  },
});
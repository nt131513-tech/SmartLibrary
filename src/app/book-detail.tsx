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

  const {
    books,
    borrowBook,
    returnBook,
    isBorrowed,
  } = useLibrary();

  // Tìm sách theo ID được truyền từ màn hình Books
  const book = books.find(
    (item) => item.id === id
  );

  // Nếu không tìm thấy sách
  if (!book) {
    return (
      <View style={styles.errorContainer}>

        <Text style={styles.errorTitle}>
          Không tìm thấy sách
        </Text>

        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backButtonErrorText}>
            Quay lại
          </Text>
        </TouchableOpacity>

      </View>
    );
  }

  // Kiểm tra sách hiện tại đã được người dùng mượn hay chưa
  const borrowed = isBorrowed(book.id);


  // ================= MƯỢN SÁCH =================

  const handleBorrow = () => {
    const success = borrowBook(book.id);

    if (success) {
      Alert.alert(
        'Mượn sách thành công',
        `Bạn đã mượn "${book.title}".`
      );
    } else {
      Alert.alert(
        'Không thể mượn',
        'Sách hiện đang hết trong thư viện.'
      );
    }
  };


  // ================= TRẢ SÁCH =================

  const handleReturn = () => {
    returnBook(book.id);

    Alert.alert(
      'Trả sách thành công',
      `Bạn đã trả "${book.title}".`
    );
  };


  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Chi tiết sách
        </Text>

        <View style={styles.headerSpace} />

      </View>


      {/* ================= CONTENT ================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* ================= BOOK IMAGE ================= */}

        <View style={styles.bookImageContainer}>

          <Text style={styles.bookImage}>
            📖
          </Text>

        </View>


        {/* ================= TITLE ================= */}

        <Text style={styles.title}>
          {book.title}
        </Text>

        <Text style={styles.author}>
          Tác giả: {book.author}
        </Text>


        {/* ================= CATEGORY ================= */}

        <View style={styles.categoryBadge}>

          <Text style={styles.categoryText}>
            {book.category}
          </Text>

        </View>


        {/* ================= BOOK INFORMATION ================= */}

        <View style={styles.infoCard}>

          <Text style={styles.sectionTitle}>
            Thông tin sách
          </Text>


          {/* ISBN */}

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              ISBN
            </Text>

            <Text style={styles.infoValue}>
              {book.isbn}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* QUANTITY */}

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Số lượng
            </Text>

            <Text style={styles.infoValue}>
              {book.quantity} quyển
            </Text>

          </View>


          <View style={styles.divider} />


          {/* STATUS */}

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Trạng thái
            </Text>

            <Text
              style={[
                styles.infoValue,
                book.available
                  ? styles.available
                  : styles.unavailable,
              ]}
            >
              {book.available
                ? 'Còn sách'
                : 'Hết sách'}
            </Text>

          </View>


          <View style={styles.divider} />


          {/* BORROW STATUS */}

          <View style={styles.infoRow}>

            <Text style={styles.infoLabel}>
              Trạng thái của bạn
            </Text>

            <Text
              style={[
                styles.infoValue,
                borrowed
                  ? styles.borrowed
                  : styles.notBorrowed,
              ]}
            >
              {borrowed
                ? 'Đang mượn'
                : 'Chưa mượn'}
            </Text>

          </View>

        </View>


        {/* ================= DESCRIPTION ================= */}

        <View style={styles.descriptionCard}>

          <Text style={styles.sectionTitle}>
            Mô tả
          </Text>

          <Text style={styles.description}>
            {book.description}
          </Text>

        </View>


        {/* ================= BORROW / RETURN ================= */}

        {borrowed ? (

          <TouchableOpacity
            style={styles.returnButton}
            onPress={handleReturn}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              TRẢ SÁCH
            </Text>
          </TouchableOpacity>

        ) : (

          <TouchableOpacity
            style={[
              styles.borrowButton,
              !book.available && styles.disabledButton,
            ]}
            onPress={handleBorrow}
            activeOpacity={0.8}
            disabled={!book.available}
          >
            <Text style={styles.buttonText}>
              {book.available
                ? 'MƯỢN SÁCH'
                : 'HẾT SÁCH'}
            </Text>
          </TouchableOpacity>

        )}

      </ScrollView>

    </View>
  );
}


/* ================================================= */
/* ===================== STYLE ===================== */
/* ================================================= */

const styles = StyleSheet.create({

  /* ================= CONTAINER ================= */

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingTop: 50,
  },


  /* ================= HEADER ================= */

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


  /* ================= CONTENT ================= */

  content: {
    paddingBottom: 30,
  },


  /* ================= BOOK IMAGE ================= */

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


  /* ================= TITLE ================= */

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


  /* ================= CATEGORY ================= */

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


  /* ================= INFORMATION ================= */

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


  /* ================= BOOK STATUS ================= */

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


  /* ================= DESCRIPTION ================= */

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


  /* ================= BUTTON ================= */

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


  /* ================= ERROR ================= */

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
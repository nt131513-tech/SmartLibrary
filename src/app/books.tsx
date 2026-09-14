import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { useState } from 'react';
import { useLibrary } from '../context/LibraryContext';

type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  available: boolean;
  quantity: number;
};

const books: Book[] = [
  {
    id: '1',
    title: 'Lập trình C++ cơ bản',
    author: 'Nguyễn Văn A',
    category: 'Lập trình',
    isbn: '9786041234567',
    available: true,
    quantity: 5,
  },
  {
    id: '2',
    title: 'Lập trình Python',
    author: 'Trần Văn B',
    category: 'Lập trình',
    isbn: '9786041234568',
    available: true,
    quantity: 3,
  },
  {
    id: '3',
    title: 'Cơ sở dữ liệu',
    author: 'Lê Văn C',
    category: 'Công nghệ',
    isbn: '9786041234569',
    available: false,
    quantity: 0,
  },
  {
    id: '4',
    title: 'Trí tuệ nhân tạo',
    author: 'Phạm Văn D',
    category: 'AI',
    isbn: '9786041234570',
    available: true,
    quantity: 2,
  },
  {
    id: '5',
    title: 'Kiến trúc máy tính',
    author: 'Hoàng Văn E',
    category: 'Phần cứng',
    isbn: '9786041234571',
    available: true,
    quantity: 4,
  },
];

export default function BooksScreen() {
  const [search, setSearch] = useState('');
  const { books } = useLibrary();
  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword)
    );
  });

  return (
    <View style={styles.container}>

      {/* HEADER */}

      <View style={styles.header}>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Thư viện sách
        </Text>

        <View style={styles.headerSpace} />

      </View>

      {/* SEARCH */}

      <TextInput
        style={styles.searchInput}
        placeholder="🔍  Tìm kiếm sách..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      {/* RESULT */}

      <Text style={styles.resultText}>
        {filteredBooks.length} sách
      </Text>

      {/* BOOK LIST */}

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/book-detail',
                params: {
                  id: item.id,
                },
              })
            }
          >

            {/* BOOK ICON */}

            <View style={styles.bookIconContainer}>
              <Text style={styles.bookIcon}>
                📖
              </Text>
            </View>

            {/* BOOK INFO */}

            <View style={styles.bookInfo}>

              <Text
                style={styles.bookTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              <Text style={styles.author}>
                Tác giả: {item.author}
              </Text>

              <Text style={styles.category}>
                {item.category}
              </Text>

              <View style={styles.bottomRow}>

                <Text
                  style={[
                    styles.status,
                    item.available
                      ? styles.available
                      : styles.unavailable,
                  ]}
                >
                  {item.available
                    ? `Còn ${item.quantity} quyển`
                    : 'Hết sách'}
                </Text>

                <Text style={styles.arrow}>
                  ›
                </Text>

              </View>

            </View>

          </TouchableOpacity>
        )}
      />

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
    marginBottom: 20,
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

  searchInput: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#222',
  },

  resultText: {
    fontSize: 14,
    color: '#777',
    marginTop: 16,
    marginBottom: 10,
  },

  list: {
    paddingBottom: 20,
  },

  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    elevation: 2,
  },

  bookIconContainer: {
    width: 70,
    height: 90,
    borderRadius: 10,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  bookIcon: {
    fontSize: 36,
  },

  bookInfo: {
    flex: 1,
    marginLeft: 14,
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#163A63',
    lineHeight: 21,
  },

  author: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },

  category: {
    fontSize: 12,
    color: '#1E6FD9',
    marginTop: 4,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  status: {
    fontSize: 12,
    fontWeight: '600',
  },

  available: {
    color: '#2E8B57',
  },

  unavailable: {
    color: '#D9534F',
  },

  arrow: {
    fontSize: 25,
    color: '#1E6FD9',
  },
});
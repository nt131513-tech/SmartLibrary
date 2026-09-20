
import {
  ActivityIndicator,
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

export default function BooksScreen() {
  const [search, setSearch] = useState('');

  const { books, loading } = useLibrary();

  const filteredBooks = books.filter((book) => {
    const keyword = search.trim().toLowerCase();

    return (
      book.title.toLowerCase().includes(keyword) ||
      book.author.toLowerCase().includes(keyword) ||
      book.category.toLowerCase().includes(keyword) ||
      book.isbn.toLowerCase().includes(keyword) ||
      book.shelf.toLowerCase().includes(keyword)
    );
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>
          Đang tải danh sách sách...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Danh sách sách</Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm tên sách, tác giả, ISBN..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearch('')}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* COUNT */}
      <View style={styles.resultRow}>
        <Text style={styles.resultText}>
          {filteredBooks.length} sách
        </Text>

        <Text style={styles.resultHint}>
          Dữ liệu từ Firebase
        </Text>
      </View>

      {/* BOOK LIST */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredBooks.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookCard}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: '/book-detail',
                params: { id: item.id },
              })
            }
          >
            {/* BOOK ICON */}
            <View style={styles.bookIconContainer}>
              <Text style={styles.bookIcon}>📖</Text>
            </View>

            {/* BOOK INFORMATION */}
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
                Thể loại: {item.category}
              </Text>

              <Text style={styles.isbn}>
                ISBN: {item.isbn}
              </Text>

              <Text style={styles.shelf}>
                📍 Vị trí: Kệ {item.shelf || 'Chưa cập nhật'}
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

                <Text style={styles.arrow}>›</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>

            <Text style={styles.emptyTitle}>
              Không tìm thấy sách
            </Text>

            <Text style={styles.emptyText}>
              {books.length === 0
                ? 'Chưa có dữ liệu sách trên Firebase.'
                : 'Hãy thử tìm kiếm với từ khóa khác.'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#64748b',
  },

  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backIcon: {
    fontSize: 32,
    color: '#1e293b',
    marginTop: -3,
  },

  headerTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0f172a',
  },

  headerPlaceholder: {
    width: 42,
  },

  searchContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },

  searchIcon: {
    fontSize: 19,
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },

  clearText: {
    fontSize: 18,
    color: '#64748b',
    paddingLeft: 8,
  },

  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  resultText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },

  resultHint: {
    fontSize: 12,
    color: '#64748b',
  },

  listContent: {
    paddingBottom: 24,
  },

  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  bookIconContainer: {
    width: 58,
    height: 76,
    borderRadius: 10,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  bookIcon: {
    fontSize: 31,
  },

  bookInfo: {
    flex: 1,
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 5,
  },

  author: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 3,
  },

  category: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 3,
  },

  isbn: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 3,
  },

  shelf: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  status: {
    fontSize: 13,
    fontWeight: '600',
  },

  available: {
    color: '#16a34a',
  },

  unavailable: {
    color: '#dc2626',
  },

  arrow: {
    fontSize: 27,
    color: '#94a3b8',
    marginLeft: 8,
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 21,
  },
});
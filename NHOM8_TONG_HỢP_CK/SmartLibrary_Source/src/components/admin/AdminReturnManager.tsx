import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { AdminBook, AdminBorrowRecord, UserAccount } from '../../types/admin';

type Props = {
  borrowRecords: AdminBorrowRecord[];
  books: AdminBook[];
  users: UserAccount[];
};

export default function AdminReturnManager({
  borrowRecords,
  books,
  users,
}: Props) {
  const [search, setSearch] = useState('');

  const userMap = new Map(users.map((u) => [u.uid, u]));
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const borrowedList = borrowRecords.filter((r) => r.status === 'borrowed');

  const filteredList = borrowedList.filter((r) => {
    const user = userMap.get(r.userId);
    const book = bookMap.get(r.bookId);

    const s = search.toLowerCase();
    const matchUser = (user?.fullName || '').toLowerCase().includes(s) || (user?.email || '').toLowerCase().includes(s);
    const matchBook = (book?.title || '').toLowerCase().includes(s);

    return matchUser || matchBook;
  });

  const handleConfirmReturn = (record: AdminBorrowRecord) => {
    const book = bookMap.get(record.bookId);
    const user = userMap.get(record.userId);

    Alert.alert(
      'Xác nhận trả sách',
      `Xác nhận người dùng "${user?.fullName || user?.email}" đã trả sách "${book?.title || 'Sách'}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận trả',
          style: 'default',
          onPress: async () => {
            try {
              const now = Date.now();

              // 1. Update borrow record status
              await update(ref(db, `borrowRecords/${record.id}`), {
                status: 'returned',
                returnedAt: now,
              });

              // 2. Increment available book quantity
              if (book) {
                const newQty = Math.min((book.quantity || 0) + 1, book.totalQuantity || (book.quantity + 1));
                await update(ref(db, `books/${book.id}`), {
                  quantity: newQty,
                  available: newQty > 0,
                });
              }

              Alert.alert('Thành công', 'Đã xác nhận trả sách thành công!');
            } catch (error) {
              console.error('Lỗi khi trả sách:', error);
              Alert.alert('Lỗi', 'Không thể hoàn tất xác nhận trả sách.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Quản Lý Trả Sách ({borrowedList.length} sách đang mượn)</Text>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên sách hoặc tên người mượn..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const user = userMap.get(item.userId);
          const book = bookMap.get(item.bookId);

          const isOverdue = item.dueDate < Date.now();
          const borrowDateStr = new Date(item.borrowedAt).toLocaleDateString('vi-VN');
          const dueDateStr = new Date(item.dueDate).toLocaleDateString('vi-VN');

          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.bookTitle}>{book?.title || 'Sách N/A'}</Text>
                {isOverdue && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueBadgeText}>Quá hạn</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Người mượn: </Text>
                  {user?.fullName || 'N/A'} ({user?.email})
                </Text>
                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Ngày mượn: </Text>
                  {borrowDateStr}
                </Text>
                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Hạn trả: </Text>
                  <Text style={isOverdue ? styles.overdueText : undefined}>
                    {dueDateStr}
                  </Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.returnBtn}
                onPress={() => handleConfirmReturn(item)}
              >
                <Ionicons name="checkbox-outline" size={18} color="#FFF" />
                <Text style={styles.returnBtnText}>Xác Nhận Đã Trả Sách</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Hiện không có sách nào đang được mượn.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 8 },
  overdueBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  overdueBadgeText: { color: '#DC2626', fontSize: 11, fontWeight: 'bold' },
  cardBody: { marginTop: 2 },
  infoLine: { fontSize: 13, color: '#334155', marginBottom: 3 },
  label: { color: '#64748B', fontWeight: '600' },
  overdueText: { color: '#DC2626', fontWeight: 'bold' },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 10,
  },
  returnBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  emptyWrap: { alignItems: 'center', padding: 30 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});

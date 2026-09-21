import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { push, ref, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { AdminBook, AdminBorrowRecord, UserAccount } from '../../types/admin';

type Props = {
  borrowRecords: AdminBorrowRecord[];
  books: AdminBook[];
  users: UserAccount[];
};

export default function AdminOverdueManager({
  borrowRecords,
  books,
  users,
}: Props) {
  const userMap = new Map(users.map((u) => [u.uid, u]));
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const now = Date.now();

  const overdueList = borrowRecords
    .filter((r) => r.status === 'borrowed' && r.dueDate < now)
    .map((r) => {
      const overdueMs = now - r.dueDate;
      const overdueDays = Math.max(1, Math.floor(overdueMs / (1000 * 60 * 60 * 24)));
      return {
        ...r,
        overdueDays,
      };
    })
    .sort((a, b) => b.overdueDays - a.overdueDays);

  const handleSendReminder = async (record: typeof overdueList[0]) => {
    const user = userMap.get(record.userId);
    const book = bookMap.get(record.bookId);

    try {
      const notifRef = push(ref(db, 'notifications'));
      await update(notifRef, {
        id: notifRef.key,
        userId: record.userId,
        title: 'CẢNH BÁO QUÁ HẠN TRA SÁCH',
        message: `Bạn đang quá hạn ${record.overdueDays} ngày cho cuốn sách "${book?.title || 'đã mượn'}". Vui lòng hoàn trả lại thư viện ngay!`,
        type: 'overdue',
        createdAt: Date.now(),
        read: false,
      });

      Alert.alert(
        'Thành công',
        `Đã gửi thông báo nhắc nhở cho độc giả ${user?.fullName || user?.email}`
      );
    } catch (error) {
      console.error('Lỗi khi gửi thông báo:', error);
      Alert.alert('Lỗi', 'Không thể gửi thông báo.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Ionicons name="warning-outline" size={24} color="#DC2626" />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.headerTitle}>Danh Sách Trả Trễ / Quá Hạn ({overdueList.length})</Text>
          <Text style={styles.headerSub}>Các độc giả chưa hoàn trả sách theo đúng thời hạn</Text>
        </View>
      </View>

      <FlatList
        data={overdueList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const user = userMap.get(item.userId);
          const book = bookMap.get(item.bookId);
          const dueDateStr = new Date(item.dueDate).toLocaleDateString('vi-VN');

          return (
            <View style={styles.card}>
              <View style={styles.topRow}>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {book?.title || 'Sách N/A'}
                </Text>
                <View style={styles.daysBadge}>
                  <Text style={styles.daysBadgeText}>Trễ {item.overdueDays} ngày</Text>
                </View>
              </View>

              <View style={styles.details}>
                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Độc giả: </Text>
                  <Text style={styles.userName}>{user?.fullName || 'N/A'}</Text> ({user?.email})
                </Text>

                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Tác giả: </Text>
                  {book?.author || 'N/A'}
                </Text>

                <Text style={styles.infoLine}>
                  <Text style={styles.label}>Hạn trả ban đầu: </Text>
                  <Text style={styles.dueDateText}>{dueDateStr}</Text>
                </Text>
              </View>

              <TouchableOpacity
                style={styles.remindBtn}
                onPress={() => handleSendReminder(item)}
              >
                <Ionicons name="notifications-outline" size={16} color="#FFF" />
                <Text style={styles.remindBtnText}>Gửi Cảnh Báo Trả Trễ</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="checkmark-circle-outline" size={48} color="#10B981" />
            <Text style={styles.emptyTitle}>Tuyệt vời!</Text>
            <Text style={styles.emptyText}>Hiện không có trường hợp nào bị quá hạn trả sách.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#991B1B' },
  headerSub: { fontSize: 12, color: '#B91C1C', marginTop: 2 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  bookTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', flex: 1, marginRight: 8 },
  daysBadge: { backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  daysBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  details: { marginVertical: 4 },
  infoLine: { fontSize: 13, color: '#334155', marginBottom: 3 },
  label: { color: '#64748B', fontWeight: '600' },
  userName: { fontWeight: 'bold', color: '#1E293B' },
  dueDateText: { color: '#DC2626', fontWeight: 'bold' },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 6,
    paddingVertical: 8,
    marginTop: 10,
  },
  remindBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 12, marginLeft: 6 },
  emptyWrap: { alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#10B981', marginTop: 10 },
  emptyText: { color: '#64748B', fontSize: 14, marginTop: 4, textAlign: 'center' },
});

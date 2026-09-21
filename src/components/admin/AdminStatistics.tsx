import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminBook, AdminBorrowRecord } from '../../types/admin';

type Props = {
  books: AdminBook[];
  borrowRecords: AdminBorrowRecord[];
};

export default function AdminStatistics({ books, borrowRecords }: Props) {
  // 1. Calculate Borrow Count per Book
  const bookBorrowCountMap = new Map<string, number>();
  borrowRecords.forEach((rec) => {
    const current = bookBorrowCountMap.get(rec.bookId) || 0;
    bookBorrowCountMap.set(rec.bookId, current + 1);
  });

  // Top Most Borrowed Books
  const topBooks = books
    .map((b) => ({
      ...b,
      borrowCount: bookBorrowCountMap.get(b.id) || 0,
    }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 5);

  // 2. Total Stocks Stats
  const totalStock = books.reduce((acc, b) => acc + (b.totalQuantity || b.quantity || 0), 0);
  const availableStock = books.reduce((acc, b) => acc + (b.quantity || 0), 0);
  const borrowedStock = Math.max(0, totalStock - availableStock);
  const availabilityPercent = totalStock > 0 ? Math.round((availableStock / totalStock) * 100) : 0;

  // 3. Status breakdown
  const totalBorrowRecords = borrowRecords.length;
  const returnedCount = borrowRecords.filter((r) => r.status === 'returned').length;
  const activeCount = borrowRecords.filter((r) => r.status === 'borrowed').length;
  const overdueCount = borrowRecords.filter(
    (r) => r.status === 'borrowed' && r.dueDate < Date.now()
  ).length;

  // 4. Category breakdown
  const categoryStatsMap = new Map<string, { bookCount: number; borrowCount: number }>();
  books.forEach((b) => {
    const cat = b.category || 'Khác';
    const current = categoryStatsMap.get(cat) || { bookCount: 0, borrowCount: 0 };
    const borrows = bookBorrowCountMap.get(b.id) || 0;
    categoryStatsMap.set(cat, {
      bookCount: current.bookCount + 1,
      borrowCount: current.borrowCount + borrows,
    });
  });

  const categoryList = Array.from(categoryStatsMap.entries()).map(([cat, val]) => ({
    category: cat,
    ...val,
  }));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Báo Cáo & Thống Kê Thư Viện</Text>

      {/* Stock Summary Box */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tình Trạng Kho Sách</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressLabel}>Tỷ lệ sách sẵn có trong kho:</Text>
            <Text style={styles.progressPercent}>{availabilityPercent}%</Text>
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: `${availabilityPercent}%` }]} />
          </View>
        </View>

        <View style={styles.stockGrid}>
          <View style={styles.stockItem}>
            <Text style={styles.stockNum}>{totalStock}</Text>
            <Text style={styles.stockText}>Tổng số quyển</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={[styles.stockNum, { color: '#059669' }]}>{availableStock}</Text>
            <Text style={styles.stockText}>Sách còn lại</Text>
          </View>
          <View style={styles.stockItem}>
            <Text style={[styles.stockNum, { color: '#D97706' }]}>{borrowedStock}</Text>
            <Text style={styles.stockText}>Đang cho mượn</Text>
          </View>
        </View>
      </View>

      {/* Borrow Activity Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Lượt Mượn & Trạng Thái Phiếu</Text>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Ionicons name="documents-outline" size={20} color="#2563EB" />
            <Text style={styles.statVal}>{totalBorrowRecords}</Text>
            <Text style={styles.statSub}>Tổng lượt mượn</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color="#059669" />
            <Text style={[styles.statVal, { color: '#059669' }]}>{returnedCount}</Text>
            <Text style={styles.statSub}>Đã trả thành công</Text>
          </View>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Ionicons name="book-outline" size={20} color="#D97706" />
            <Text style={[styles.statVal, { color: '#D97706' }]}>{activeCount}</Text>
            <Text style={styles.statSub}>Đang mượn</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={[styles.statVal, { color: '#DC2626' }]}>{overdueCount}</Text>
            <Text style={styles.statSub}>Quá hạn trả</Text>
          </View>
        </View>
      </View>

      {/* Top Most Borrowed Books */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Sách Được Mượn Nhiều Nhất</Text>
        {topBooks.length === 0 ? (
          <Text style={styles.emptyText}>Chưa có dữ liệu lượt mượn.</Text>
        ) : (
          topBooks.map((item, index) => (
            <View key={item.id} style={styles.rankItem}>
              <View
                style={[
                  styles.rankBadge,
                  index === 0
                    ? styles.rank1
                    : index === 1
                    ? styles.rank2
                    : index === 2
                    ? styles.rank3
                    : styles.rankOther,
                ]}
              >
                <Text style={styles.rankBadgeText}>#{index + 1}</Text>
              </View>

              <View style={styles.rankInfo}>
                <Text style={styles.rankTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.rankAuthor}>Tác giả: {item.author}</Text>
              </View>

              <View style={styles.rankCountWrap}>
                <Text style={styles.rankCountNum}>{item.borrowCount}</Text>
                <Text style={styles.rankCountLabel}>lượt mượn</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Category Breakdown */}
      <View style={[styles.card, { marginBottom: 30 }]}>
        <Text style={styles.cardTitle}>📂 Phân Loại Theo Thể Loại</Text>
        {categoryList.map((cat) => (
          <View key={cat.category} style={styles.catRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.catName}>{cat.category}</Text>
              <Text style={styles.catSub}>
                {cat.bookCount} đầu sách • {cat.borrowCount} lượt mượn
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  progressContainer: { marginBottom: 16 },
  progressInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, color: '#475569' },
  progressPercent: { fontSize: 14, fontWeight: 'bold', color: '#2563EB' },
  barBg: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 5 },
  stockGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  stockItem: { alignItems: 'center' },
  stockNum: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  stockText: { fontSize: 12, color: '#64748B', marginTop: 2 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statVal: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginTop: 4 },
  statSub: { fontSize: 11, color: '#64748B', marginTop: 2 },
  emptyText: { color: '#94A3B8', fontSize: 13, fontStyle: 'italic' },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rankBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  rank1: { backgroundColor: '#FEF3C7' },
  rank2: { backgroundColor: '#E2E8F0' },
  rank3: { backgroundColor: '#FFEDD5' },
  rankOther: { backgroundColor: '#F1F5F9' },
  rankBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1E293B' },
  rankInfo: { flex: 1, marginLeft: 12 },
  rankTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },
  rankAuthor: { fontSize: 12, color: '#64748B', marginTop: 2 },
  rankCountWrap: { alignItems: 'flex-end', paddingLeft: 8 },
  rankCountNum: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  rankCountLabel: { fontSize: 10, color: '#64748B' },
  catRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  catName: { fontSize: 14, fontWeight: '600', color: '#334155' },
  catSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
});

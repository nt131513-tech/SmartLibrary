import { Ionicons } from '@expo/vector-icons';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AdminBook, AdminBorrowRecord, UserAccount } from '../../types/admin';

type Props = {
  books: AdminBook[];
  borrowRecords: AdminBorrowRecord[];
  users: UserAccount[];
  onNavigateTab: (tab: string) => void;
};

export default function AdminDashboard({
  books,
  borrowRecords,
  users,
  onNavigateTab,
}: Props) {
  const totalBooks = books.reduce((acc, curr) => acc + (curr.totalQuantity || 1), 0);
  const totalTitles = books.length;
  
  const activeBorrows = borrowRecords.filter(
    (r) => r.status === 'borrowed' || r.status === 'pending_borrow'
  );
  
  const pendingRequests = borrowRecords.filter(
    (r) => r.status === 'pending_borrow'
  );

  const now = Date.now();
  const overdueRecords = borrowRecords.filter(
    (r) => r.status === 'borrowed' && r.dueDate < now
  );

  const totalUsers = users.filter((u) => u.role === 'user').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Tổng Quan Thư Viện</Text>
        <Text style={styles.bannerSub}>
          Báo cáo tình trạng hệ thống và thống kê tổng quát
        </Text>
      </View>

      {/* Grid Stat Cards */}
      <View style={styles.grid}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#EBF5FF' }]}
          activeOpacity={0.8}
          onPress={() => onNavigateTab('books')}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#2563EB' }]}>
            <Ionicons name="book" size={24} color="#FFF" />
          </View>
          <Text style={styles.cardValue}>{totalTitles} ({totalBooks} bản)</Text>
          <Text style={styles.cardLabel}>Tổng Số Sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FEF3C7' }]}
          activeOpacity={0.8}
          onPress={() => onNavigateTab('borrows')}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#D97706' }]}>
            <Ionicons name="bookmark" size={24} color="#FFF" />
          </View>
          <Text style={styles.cardValue}>{activeBorrows.length}</Text>
          <Text style={styles.cardLabel}>Đang Được Mượn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#F3E8FF' }]}
          activeOpacity={0.8}
          onPress={() => onNavigateTab('users')}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#9333EA' }]}>
            <Ionicons name="people" size={24} color="#FFF" />
          </View>
          <Text style={styles.cardValue}>{totalUsers}</Text>
          <Text style={styles.cardLabel}>Người Dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { backgroundColor: '#FEE2E2' }]}
          activeOpacity={0.8}
          onPress={() => onNavigateTab('overdue')}
        >
          <View style={[styles.iconWrap, { backgroundColor: '#DC2626' }]}>
            <Ionicons name="warning" size={24} color="#FFF" />
          </View>
          <Text style={[styles.cardValue, { color: '#DC2626' }]}>
            {overdueRecords.length}
          </Text>
          <Text style={styles.cardLabel}>Sách Quá Hạn</Text>
        </TouchableOpacity>
      </View>

      {/* Alerts / Important Statuses */}
      {pendingRequests.length > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => onNavigateTab('borrows')}
        >
          <Ionicons name="notifications-outline" size={22} color="#D97706" />
          <Text style={styles.alertText}>
            Có <Text style={styles.boldText}>{pendingRequests.length}</Text> yêu cầu mượn sách mới cần xác nhận!
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#D97706" />
        </TouchableOpacity>
      )}

      {/* Quick Navigation Menu */}
      <Text style={styles.sectionTitle}>Chức Năng Quản Lý</Text>

      <View style={styles.menuGrid}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('books')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="library" size={22} color="#2563EB" />
          </View>
          <Text style={styles.menuText}>Quản Lý Sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('users')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="people-circle" size={22} color="#9333EA" />
          </View>
          <Text style={styles.menuText}>Người Dùng</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('borrows')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="swap-horizontal" size={22} color="#D97706" />
          </View>
          <Text style={styles.menuText}>Mượn Sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('returns')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkbox" size={22} color="#059669" />
          </View>
          <Text style={styles.menuText}>Trả Sách</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('overdue')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="alarm" size={22} color="#DC2626" />
          </View>
          <Text style={styles.menuText}>Quá Hạn</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('notifications')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#E0F2FE' }]}>
            <Ionicons name="send" size={22} color="#0284C7" />
          </View>
          <Text style={styles.menuText}>Gửi Thông Báo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => onNavigateTab('stats')}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="stats-chart" size={22} color="#DB2777" />
          </View>
          <Text style={styles.menuText}>Thống Kê</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  banner: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
  },
  bannerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerSub: {
    color: '#93C5FD',
    fontSize: 13,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  alertText: {
    flex: 1,
    marginLeft: 10,
    color: '#92400E',
    fontSize: 14,
  },
  boldText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },
  menuItem: {
    width: '30%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  menuText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});

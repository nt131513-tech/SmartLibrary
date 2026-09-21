import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebase';
import {
  AdminBook,
  AdminBorrowRecord,
  AppNotification,
  UserAccount,
} from '../types/admin';

// Admin Components
import AdminBookManager from '../components/admin/AdminBookManager';
import AdminBorrowManager from '../components/admin/AdminBorrowManager';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminNotificationManager from '../components/admin/AdminNotificationManager';
import AdminOverdueManager from '../components/admin/AdminOverdueManager';
import AdminReturnManager from '../components/admin/AdminReturnManager';
import AdminStatistics from '../components/admin/AdminStatistics';
import AdminUserManager from '../components/admin/AdminUserManager';

export type AdminTab =
  | 'dashboard'
  | 'books'
  | 'users'
  | 'borrows'
  | 'returns'
  | 'overdue'
  | 'notifications'
  | 'stats';

export default function LibrarianScreen() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(true);

  // Realtime Data from Firebase
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<AdminBorrowRecord[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // =====================================================
  // LISTEN TO FIREBASE REALTIME DATABASE
  // =====================================================
  useEffect(() => {
    // 1. Books listener
    const booksRef = ref(db, 'books');
    const unsubBooks = onValue(booksRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBooks([]);
        return;
      }
      const list: AdminBook[] = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        title: value.title || '',
        author: value.author || '',
        category: value.category || '',
        isbn: value.isbn || '',
        shelf: value.shelf || '',
        quantity: Number(value.quantity ?? 0),
        totalQuantity: Number(value.totalQuantity ?? value.quantity ?? 0),
        available: Boolean(value.available),
        description: value.description || '',
        coverImage: value.coverImage || '',
        barcode: value.barcode || '',
      }));
      setBooks(list);
    });

    // 2. Borrow Records listener
    const recordsRef = ref(db, 'borrowRecords');
    const unsubRecords = onValue(recordsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setBorrowRecords([]);
        return;
      }
      const list: AdminBorrowRecord[] = Object.entries(data).map(([id, value]: [string, any]) => ({
        id,
        userId: value.userId || '',
        bookId: value.bookId || '',
        borrowedAt: Number(value.borrowedAt || 0),
        dueDate: Number(value.dueDate || 0),
        returnedAt: value.returnedAt || null,
        status: value.status || 'borrowed',
      }));
      setBorrowRecords(list);
    });

    // 3. Users listener
    const usersRef = ref(db, 'users');
    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setUsers([]);
        return;
      }
      const list: UserAccount[] = Object.entries(data).map(([uid, value]: [string, any]) => ({
        uid,
        fullName: value.fullName || '',
        email: value.email || '',
        role: value.role || 'user',
        isLocked: Boolean(value.isLocked),
        createdAt: value.createdAt || '',
      }));
      setUsers(list);
    });

    // 4. Notifications listener
    const notifsRef = ref(db, 'notifications');
    const unsubNotifs = onValue(notifsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const list: AppNotification[] = Object.entries(data)
        .map(([id, value]: [string, any]) => ({
          id,
          userId: value.userId || 'all',
          title: value.title || '',
          message: value.message || '',
          type: value.type || 'general',
          createdAt: Number(value.createdAt || 0),
          read: Boolean(value.read),
        }))
        .sort((a, b) => b.createdAt - a.createdAt);

      setNotifications(list);
      setLoading(false);
    });

    setLoading(false);

    return () => {
      unsubBooks();
      unsubRecords();
      unsubUsers();
      unsubNotifs();
    };
  }, []);

  // =====================================================
  // LOGOUT
  // =====================================================
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi quyền quản thư?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              console.error('Lỗi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E6FD9" />
        <Text style={styles.loadingText}>Đang tải dữ liệu quản lý...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <Ionicons name="shield-checkmark" size={24} color="#1E6FD9" />
          <Text style={styles.headerTitle}>TRANG QUẢN THƯ (ADMIN)</Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Top Navigation Tab Bar */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'dashboard' && styles.tabActive]}
            onPress={() => setActiveTab('dashboard')}
          >
            <Ionicons
              name="grid-outline"
              size={16}
              color={activeTab === 'dashboard' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'dashboard' && styles.tabTextActive]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'books' && styles.tabActive]}
            onPress={() => setActiveTab('books')}
          >
            <Ionicons
              name="book-outline"
              size={16}
              color={activeTab === 'books' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'books' && styles.tabTextActive]}
            >
              Quản lý Sách
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === 'users' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}
            >
              Người Dùng
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'borrows' && styles.tabActive]}
            onPress={() => setActiveTab('borrows')}
          >
            <Ionicons
              name="swap-horizontal-outline"
              size={16}
              color={activeTab === 'borrows' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'borrows' && styles.tabTextActive]}
            >
              Mượn Sách
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'returns' && styles.tabActive]}
            onPress={() => setActiveTab('returns')}
          >
            <Ionicons
              name="checkbox-outline"
              size={16}
              color={activeTab === 'returns' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'returns' && styles.tabTextActive]}
            >
              Trả Sách
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'overdue' && styles.tabActive]}
            onPress={() => setActiveTab('overdue')}
          >
            <Ionicons
              name="alarm-outline"
              size={16}
              color={activeTab === 'overdue' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'overdue' && styles.tabTextActive]}
            >
              Quá Hạn
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'notifications' && styles.tabActive]}
            onPress={() => setActiveTab('notifications')}
          >
            <Ionicons
              name="notifications-outline"
              size={16}
              color={activeTab === 'notifications' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'notifications' && styles.tabTextActive]}
            >
              Thông Báo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <Ionicons
              name="stats-chart-outline"
              size={16}
              color={activeTab === 'stats' ? '#1E6FD9' : '#64748B'}
            />
            <Text
              style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}
            >
              Thống Kê
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Tab Content Rendering */}
      <View style={styles.content}>
        {activeTab === 'dashboard' && (
          <AdminDashboard
            books={books}
            borrowRecords={borrowRecords}
            users={users}
            onNavigateTab={(tab) => setActiveTab(tab as AdminTab)}
          />
        )}

        {activeTab === 'books' && <AdminBookManager books={books} />}

        {activeTab === 'users' && <AdminUserManager users={users} />}

        {activeTab === 'borrows' && (
          <AdminBorrowManager
            borrowRecords={borrowRecords}
            books={books}
            users={users}
          />
        )}

        {activeTab === 'returns' && (
          <AdminReturnManager
            borrowRecords={borrowRecords}
            books={books}
            users={users}
          />
        )}

        {activeTab === 'overdue' && (
          <AdminOverdueManager
            borrowRecords={borrowRecords}
            books={books}
            users={users}
          />
        )}

        {activeTab === 'notifications' && (
          <AdminNotificationManager
            users={users}
            notifications={notifications}
          />
        )}

        {activeTab === 'stats' && (
          <AdminStatistics books={books} borrowRecords={borrowRecords} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748B' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginLeft: 8,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 6,
    backgroundColor: '#F1F5F9',
  },
  tabActive: {
    backgroundColor: '#DBEAFE',
  },
  tabText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 6,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#1E6FD9',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
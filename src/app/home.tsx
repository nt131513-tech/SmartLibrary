
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

import { auth } from '../config/firebase';

export default function HomeScreen() {
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
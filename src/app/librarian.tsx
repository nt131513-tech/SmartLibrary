
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';
import { signOut } from 'firebase/auth';

import { auth } from '../config/firebase';

export default function LibrarianScreen() {
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);

              router.replace('/');
            } catch (error) {
              console.error('Lỗi đăng xuất:', error);

              Alert.alert(
                'Lỗi',
                'Không thể đăng xuất. Vui lòng thử lại.',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Giao diện thủ thư
      </Text>

      <Text style={styles.subtitle}>
        Chào mừng bạn đến trang quản lý thư viện
      </Text>

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>
          ĐĂNG XUẤT
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#163A63',
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 10,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
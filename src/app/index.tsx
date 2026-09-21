
import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import { get, ref } from 'firebase/database';

import { auth, db } from '../config/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginRole, setLoginRole] = useState<'user' | 'librarian'>('user');

  /* ================= ĐĂNG NHẬP ================= */

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập đầy đủ email và mật khẩu.',
      );
      return;
    }

    try {
      setLoading(true);

      // 1. Đăng nhập bằng Firebase Authentication
      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

      const user = userCredential.user;

      // 2. Lấy thông tin tài khoản từ Realtime Database
      const userSnapshot = await get(
        ref(db, `users/${user.uid}`),
      );

      if (!userSnapshot.exists()) {
        await signOut(auth);

        Alert.alert(
          'Lỗi tài khoản',
          'Tài khoản chưa có thông tin trên hệ thống.',
        );

        return;
      }

      const userData = userSnapshot.val();

      // Kiểm tra tài khoản có bị khóa hay không
      if (userData.isLocked) {
        await signOut(auth);
        Alert.alert(
          'Tài khoản bị khóa',
          'Tài khoản của bạn đã bị khóa bởi Quản thư. Vui lòng liên hệ để được hỗ trợ.',
        );
        return;
      }

      // 3. Lấy vai trò tài khoản
      const role = userData.role;

      // Kiểm tra chọn vai trò không khớp
      if (loginRole === 'librarian' && role !== 'librarian') {
        await signOut(auth);
        Alert.alert(
          'Lỗi phân quyền',
          'Tài khoản của bạn là Độc giả, không thể đăng nhập giao diện Quản thư.',
        );
        return;
      }

      // 4. Chuyển giao diện theo vai trò
      if (role === 'user') {
        Alert.alert(
          'Đăng nhập thành công',
          'Chào mừng bạn đến với Smart Library!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/home'),
            },
          ],
        );
      } else if (role === 'librarian') {
        Alert.alert(
          'Đăng nhập thành công',
          'Chào mừng thủ thư đến với hệ thống quản lý!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/librarian'),
            },
          ],
        );
      } else {
        // Vai trò không hợp lệ
        await signOut(auth);

        Alert.alert(
          'Lỗi phân quyền',
          'Tài khoản chưa được cấp quyền hợp lệ.',
        );
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);

      let message =
        'Đăng nhập thất bại. Vui lòng thử lại.';

      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found'
      ) {
        message = 'Email hoặc mật khẩu không chính xác.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ.';
      } else if (error.code === 'auth/too-many-requests') {
        message =
          'Bạn thử quá nhiều lần. Vui lòng thử lại sau.';
      } else if (
        error.code === 'PERMISSION_DENIED' ||
        error.code === 'database/permission-denied'
      ) {
        message =
          'Không có quyền đọc thông tin tài khoản trên Firebase.';
      }

      Alert.alert('Lỗi đăng nhập', message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= QUÊN MẬT KHẨU ================= */

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập email để khôi phục mật khẩu.',
      );
      return;
    }

    try {
      await sendPasswordResetEmail(
        auth,
        email.trim(),
      );

      Alert.alert(
        'Thành công',
        'Email khôi phục mật khẩu đã được gửi.',
      );
    } catch (error: any) {
      let message =
        'Không thể gửi email khôi phục mật khẩu.';

      if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'Không tìm thấy tài khoản với email này.';
      }

      Alert.alert('Lỗi', message);
    }
  };

  /* ================= GIAO DIỆN ================= */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/hcmute_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>SMART LIBRARY</Text>

        <Text style={styles.subtitle}>
          Thư viện thông minh HCMUTE
        </Text>
      </View>

      <View style={styles.form}>
        {/* TAB CHỌN LOẠI TÀI KHOẢN ĐĂNG NHẬP */}
        <View style={styles.roleTabContainer}>
          <TouchableOpacity
            style={[
              styles.roleTab,
              loginRole === 'user' && styles.roleTabActive,
            ]}
            onPress={() => setLoginRole('user')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.roleTabText,
                loginRole === 'user' && styles.roleTabTextActive,
              ]}
            >
              👤 Độc Giả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleTab,
              loginRole === 'librarian' && styles.roleTabActive,
            ]}
            onPress={() => setLoginRole('librarian')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.roleTabText,
                loginRole === 'librarian' && styles.roleTabTextActive,
              ]}
            >
              🛡️ Quản Thư (Admin)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Email</Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Mật khẩu</Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>
              {showPassword ? 'Ẩn' : 'Hiện'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.forgotButton}
          activeOpacity={0.7}
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotText}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.loginButton,
            loginRole === 'librarian' && styles.librarianLoginButton,
            loading && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginText}>
              {loginRole === 'librarian'
                ? 'ĐĂNG NHẬP QUẢN THƯ'
                : 'ĐĂNG NHẬP ĐỘC GIẢ'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={0.7}
          onPress={() => router.push('/register')}
        >
          <Text style={styles.registerText}>
            Chưa có tài khoản?{' '}
            <Text style={styles.registerLink}>
              Đăng ký
            </Text>
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>
        Smart Library Management System
      </Text>
    </View>
  );
}

/* ================= STYLE ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  header: {
    alignItems: 'center',
    marginBottom: 25,
  },

  logo: {
    width: 90,
    height: 90,
    marginBottom: 10,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#163A63',
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
  },

  form: {
    width: '100%',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },

  passwordContainer: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#222222',
  },

  eyeButton: {
    paddingHorizontal: 16,
  },

  eyeText: {
    color: '#1E6FD9',
    fontSize: 14,
    fontWeight: '600',
  },

  forgotButton: {
    alignItems: 'flex-end',
    marginTop: 10,
  },

  forgotText: {
    color: '#1E6FD9',
    fontSize: 14,
  },

  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },

  roleTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },

  roleTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  roleTabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  roleTabTextActive: {
    color: '#1E6FD9',
    fontWeight: 'bold',
  },

  loginButton: {
    height: 52,
    backgroundColor: '#1E6FD9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  librarianLoginButton: {
    backgroundColor: '#1E3A8A',
  },

  disabledButton: {
    opacity: 0.7,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  registerButton: {
    alignItems: 'center',
    marginTop: 18,
  },

  registerText: {
    color: '#666',
    fontSize: 15,
  },

  registerLink: {
    color: '#1E6FD9',
    fontWeight: '600',
  },

  footer: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 30,
  },
});
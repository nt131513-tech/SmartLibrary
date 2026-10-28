
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
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { ref, set } from 'firebase/database';

import { auth, db } from '../config/firebase';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'user' | 'librarian'>('user');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Kiểm tra dữ liệu đầu vào
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        'Thông báo',
        'Vui lòng nhập đầy đủ thông tin.',
      );
      return;
    }

    if (password.length < 6) {
      Alert.alert(
        'Thông báo',
        'Mật khẩu phải có ít nhất 6 ký tự.',
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        'Thông báo',
        'Mật khẩu xác nhận không trùng khớp.',
      );
      return;
    }

    try {
      setLoading(true);

      // Tạo tài khoản trên Firebase Authentication
      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password,
        );

      const user = userCredential.user;

      // Cập nhật họ tên trong Firebase Authentication
      await updateProfile(user, {
        displayName: fullName.trim(),
      });

      // Lưu thông tin người dùng vào Realtime Database
      await set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        fullName: fullName.trim(),
        email: user.email,
        role: role,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Đăng ký thành công',
        role === 'librarian'
          ? 'Tài khoản Quản thư (Thủ thư) đã được tạo thành công!'
          : 'Tài khoản Độc giả của bạn đã được tạo.',
        [
          {
            text: 'Đăng nhập ngay',
            onPress: () => router.replace('/'),
          },
        ],
      );
    } catch (error: any) {
      let message =
        'Đăng ký thất bại. Vui lòng thử lại.';

      if (error.code === 'auth/email-already-in-use') {
        message = 'Email này đã được sử dụng.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Địa chỉ email không hợp lệ.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Mật khẩu quá yếu.';
      } else if (error.code === 'auth/network-request-failed') {
        message = 'Lỗi kết nối mạng.';
      }

      Alert.alert('Lỗi đăng ký', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/hcmute_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          TẠO TÀI KHOẢN
        </Text>

        <Text style={styles.subtitle}>
          Smart Library
        </Text>
      </View>

      <View style={styles.form}>
        {/* TAB CHỌN LOẠI TÀI KHOẢN ĐĂNG KÝ */}
        <View style={styles.roleTabContainer}>
          <TouchableOpacity
            style={[
              styles.roleTab,
              role === 'user' && styles.roleTabActive,
            ]}
            onPress={() => setRole('user')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.roleTabText,
                role === 'user' && styles.roleTabTextActive,
              ]}
            >
              👤 Độc Giả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleTab,
              role === 'librarian' && styles.roleTabActive,
            ]}
            onPress={() => setRole('librarian')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.roleTabText,
                role === 'librarian' && styles.roleTabTextActive,
              ]}
            >
              🛡️ Quản Thư (Admin)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Họ và tên
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên"
          placeholderTextColor="#999"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>
          Email
        </Text>

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

        <Text style={styles.label}>
          Mật khẩu
        </Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
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

        <Text style={styles.label}>
          Xác nhận mật khẩu
        </Text>

        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Nhập lại mật khẩu"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            <Text style={styles.eyeText}>
              {showConfirmPassword ? 'Ẩn' : 'Hiện'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.registerButton,
            role === 'librarian' && styles.librarianRegisterButton,
            loading && styles.disabledButton,
          ]}
          activeOpacity={0.8}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              {role === 'librarian'
                ? 'ĐĂNG KÝ TÀI KHOẢN QUẢN THƯ'
                : 'ĐĂNG KÝ TÀI KHOẢN ĐỘC GIẢ'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            Đã có tài khoản? Đăng nhập
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    height: 50,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#222',
  },

  passwordContainer: {
    height: 50,
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
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#222',
  },

  eyeButton: {
    paddingHorizontal: 16,
  },

  eyeText: {
    color: '#1E6FD9',
    fontSize: 14,
    fontWeight: '600',
  },

  roleTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 8,
  },

  roleTab: {
    flex: 1,
    paddingVertical: 10,
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

  registerButton: {
    height: 52,
    backgroundColor: '#1E6FD9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  librarianRegisterButton: {
    backgroundColor: '#1E3A8A',
  },

  disabledButton: {
    opacity: 0.7,
  },

  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  backButton: {
    alignItems: 'center',
    marginTop: 18,
  },

  backText: {
    color: '#1E6FD9',
    fontSize: 15,
    fontWeight: '600',
  },
});
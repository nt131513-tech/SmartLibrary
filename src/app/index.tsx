import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function LoginScreen() {
  return (
    <View style={styles.container}>

      {/* ================= LOGO + TIÊU ĐỀ ================= */}

      <View style={styles.header}>

        <Image
          source={require('../../assets/images/hcmute_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          SMART LIBRARY
        </Text>

        <Text style={styles.subtitle}>
          Thư viện thông minh HCMUTE
        </Text>

      </View>

      {/* ================= FORM ĐĂNG NHẬP ================= */}

      <View style={styles.form}>

        {/* Email */}

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập email"
          placeholderTextColor="#301fb1"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Mật khẩu */}

        <Text style={styles.label}>
          Mật khẩu
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry={true}
          autoCapitalize="none"
        />

        {/* Quên mật khẩu */}

        <TouchableOpacity
          style={styles.forgotButton}
          activeOpacity={0.7}
        >
          <Text style={styles.forgotText}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        {/* ================= ĐĂNG NHẬP ================= */}

        <TouchableOpacity
          style={styles.loginButton}
          activeOpacity={0.8}
          onPress={() => router.replace('/home')}
        >
          <Text style={styles.loginText}>
            ĐĂNG NHẬP
          </Text>
        </TouchableOpacity>

        {/* ================= ĐĂNG KÝ ================= */}

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

      {/* ================= FOOTER ================= */}

      <Text style={styles.footer}>
        Smart Library Management System
      </Text>

    </View>
  );
}

/* =====================================================
   STYLE
===================================================== */

const styles = StyleSheet.create({

  /* ---------- Màn hình chính ---------- */

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },

  /* ---------- Header ---------- */

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  /* ---------- Logo ---------- */

  logo: {
    width: 140,
    height: 140,
    marginBottom: 10,
    marginTop: -15,
  },

  /* ---------- Tiêu đề ---------- */

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#163A63',
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 8,
  },

  /* ---------- Form ---------- */

  form: {
    width: '100%',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 15,
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

  /* ---------- Quên mật khẩu ---------- */

  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },

  forgotText: {
    fontSize: 14,
    color: '#1E6FD9',
  },

  /* ---------- Nút đăng nhập ---------- */

  loginButton: {
    height: 52,
    backgroundColor: '#1E6FD9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
  },

  loginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  /* ---------- Đăng ký ---------- */

  registerButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  registerText: {
    fontSize: 15,
    color: '#555555',
  },

  registerLink: {
    color: '#1E6FD9',
    fontWeight: 'bold',
  },

  /* ---------- Footer ---------- */

  footer: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    marginTop: 35,
  },

});
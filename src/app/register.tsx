import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function RegisterScreen() {
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

        <Text style={styles.label}>
          Họ và tên
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập họ và tên"
          placeholderTextColor="#999"
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
        />

        <Text style={styles.label}>
          Mật khẩu
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <Text style={styles.label}>
          Xác nhận mật khẩu
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Nhập lại mật khẩu"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.registerButton}
          activeOpacity={0.8}
          
        >
          <Text style={styles.registerButtonText}>
            ĐĂNG KÝ
          </Text>
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

  registerButton: {
    height: 52,
    backgroundColor: '#1E6FD9',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 25,
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
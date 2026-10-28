import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Stack, router, useSegments } from 'expo-router';

import {
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

import { get, ref } from 'firebase/database';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { auth, db } from '../config/firebase';
import { LibraryProvider } from '../context/LibraryContext';

export default function RootLayout() {
  const segments = useSegments();

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          setCheckingAuth(false);
          return;
        }

        try {
          const userSnapshot = await get(
            ref(db, `users/${user.uid}`)
          );

          const userData = userSnapshot.val();

          if (userData?.role === 'librarian') {
            router.replace('/librarian');
          } else if (userData?.role === 'user') {
            router.replace('/home');
          } else {
            await signOut(auth);
          }
        } catch (error) {
          console.error(
            'Lỗi kiểm tra tài khoản:',
            error
          );
        } finally {
          setCheckingAuth(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (checkingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#1E6FD9"
          />

          <Text style={styles.loadingText}>
            Đang kiểm tra phiên đăng nhập...
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <LibraryProvider>
        <Stack
          screenOptions={{
            headerShown: true,
            headerTitleAlign: 'center',
            headerBackTitle: 'Quay lại',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              headerShown: false,
            }}
          />

          <Stack.Screen
            name="register"
            options={{
              title: 'Đăng ký',
            }}
          />

          <Stack.Screen
            name="home"
            options={{
              title: 'Trang chủ',
            }}
          />

          <Stack.Screen
            name="books"
            options={{
              title: 'Tìm kiếm sách',
            }}
          />

          <Stack.Screen
            name="book-detail"
            options={{
              title: 'Chi tiết sách',
            }}
          />

          <Stack.Screen
            name="borrow-history"
            options={{
              title: 'Lịch sử mượn sách',
            }}
          />

          <Stack.Screen
            name="librarian"
            options={{
              title: 'Quản lý thư viện',
            }}
          />

          <Stack.Screen
            name="scan-book"
            options={{
              title: 'Quét mã vạch',
            }}
          />
        </Stack>
      </LibraryProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#475569',
  },
});
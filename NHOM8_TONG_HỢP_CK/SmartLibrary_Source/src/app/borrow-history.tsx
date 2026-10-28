import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { onValue, ref } from 'firebase/database';
import { auth, db } from '../config/firebase';
import { useLibrary } from '../context/LibraryContext';

type BorrowRecord = {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: number;
  dueDate: number;
  returnedAt?: number | null;
  status: 'borrowed' | 'returned';
};

export default function BorrowHistoryScreen() {
  const { books } = useLibrary();

  const [records, setRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const recordsRef = ref(db, 'borrowRecords');

    const unsubscribe = onValue(
      recordsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setRecords([]);
          setLoading(false);
          return;
        }

        const userRecords: BorrowRecord[] = Object.entries(
          data
        )
          .map(([id, value]) => {
            const record = value as BorrowRecord;

            return {
              ...record,
              id,
            };
          })
          .filter(
            (record) =>
              record.userId === currentUser.uid
          )
          .sort(
            (a, b) => b.borrowedAt - a.borrowedAt
          );

        setRecords(userRecords);
        setLoading(false);
      },
      (error) => {
        console.error(
          'Lỗi tải lịch sử mượn sách:',
          error
        );
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp?: number | null) => {
    if (!timestamp) {
      return '--';
    }

    return new Date(timestamp).toLocaleDateString(
      'vi-VN'
    );
  };

  const getBookTitle = (bookId: string) => {
    const book = books.find(
      (item) => item.id === bookId
    );

    return book
      ? book.title
      : `Mã sách: ${bookId}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Đang tải lịch sử mượn sách...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Lịch sử mượn sách
      </Text>

      {records.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>
            Bạn chưa có lịch sử mượn sách.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.bookTitle}>
                {getBookTitle(item.bookId)}
              </Text>

              <Text style={styles.info}>
                Mã sách: {item.bookId}
              </Text>

              <Text style={styles.info}>
                Ngày mượn:{' '}
                {formatDate(item.borrowedAt)}
              </Text>

              <Text style={styles.info}>
                Hạn trả: {formatDate(item.dueDate)}
              </Text>

              <Text style={styles.info}>
                Ngày trả:{' '}
                {formatDate(item.returnedAt)}
              </Text>

              <Text
                style={[
                  styles.status,
                  item.status === 'borrowed'
                    ? styles.borrowed
                    : styles.returned,
                ]}
              >
                {item.status === 'borrowed'
                  ? 'Đang mượn'
                  : 'Đã trả'}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 16,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },

  list: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },

  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1d4ed8',
    marginBottom: 10,
  },

  info: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 6,
  },

  status: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
  },

  borrowed: {
    color: '#ea580c',
  },

  returned: {
    color: '#16a34a',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    color: '#64748b',
  },

  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
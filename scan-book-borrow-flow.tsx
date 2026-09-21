import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useLibrary } from '../context/LibraryContext';

export default function ScanBookScreen() {
  const { books, borrowBook, loading } = useLibrary();
  const [permission, requestPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  const selectedBook = books.find((book) => book.id === selectedBookId);

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    const code = String(data).trim();

    const book = books.find(
      (item) =>
        String(item.barcode ?? '').trim() === code ||
        String(item.isbn ?? '').trim() === code ||
        item.id === code
    );

    setScanned(true);

    if (!book) {
      Alert.alert(
        'Không tìm thấy sách',
        `Không có sách nào trùng với mã: ${code}`,
        [
          {
            text: 'Quét lại',
            onPress: () => setScanned(false),
          },
          {
            text: 'Thoát',
            onPress: () => router.back(),
          },
        ]
      );
      return;
    }

    setSelectedBookId(book.id);
  };

  const handleBorrow = async () => {
    if (!selectedBook) return;

    if (selectedBook.quantity <= 0) {
      Alert.alert('Không thể mượn', 'Sách này hiện đã hết.');
      return;
    }

    setBorrowing(true);

    try {
      const success = await borrowBook(selectedBook.id, 1);

      if (success) {
        Alert.alert(
          'Mượn sách thành công',
          `Bạn đã mượn sách "${selectedBook.title}".`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
        setSelectedBookId(null);
        setScanned(false);
      } else {
        Alert.alert(
          'Mượn sách thất bại',
          'Không thể thực hiện mượn sách. Hãy kiểm tra tài khoản và số lượng sách.'
        );
      }
    } finally {
      setBorrowing(false);
    }
  };

  const handleCloseBookInfo = () => {
    setSelectedBookId(null);
    setScanned(false);
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Ứng dụng cần quyền camera để quét mã vạch sách.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Cấp quyền camera</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Thoát</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'],
        }}
        onMountError={(error) => {
          console.error('Lỗi khởi tạo camera:', error);
          Alert.alert('Lỗi camera', 'Không thể khởi tạo camera.');
        }}
      />

      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.title}>Quét mã vạch sách</Text>
        <Text style={styles.instruction}>Đưa mã vạch vào khung quét</Text>

        <View style={styles.scanFrame} />

        <TouchableOpacity style={styles.exitCameraButton} onPress={() => router.back()}>
          <Text style={styles.exitCameraText}>Thoát camera</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={selectedBook !== undefined && selectedBook !== null}
        transparent
        animationType="slide"
        onRequestClose={handleCloseBookInfo}
      >
        <View style={styles.modalBackground}>
          <View style={styles.bookCard}>
            <Text style={styles.modalTitle}>Thông tin sách</Text>

            {selectedBook?.coverImage ? (
              <Image source={{ uri: selectedBook.coverImage }} style={styles.cover} />
            ) : null}

            <Text style={styles.bookTitle}>{selectedBook?.title}</Text>
            <Text style={styles.info}>Tác giả: {selectedBook?.author}</Text>
            <Text style={styles.info}>Thể loại: {selectedBook?.category}</Text>
            <Text style={styles.info}>ISBN: {selectedBook?.isbn || 'Chưa cập nhật'}</Text>
            <Text style={styles.info}>Mã vạch: {selectedBook?.barcode || 'Chưa cập nhật'}</Text>
            <Text style={styles.info}>Kệ sách: {selectedBook?.shelf || 'Chưa cập nhật'}</Text>
            <Text style={styles.info}>
              Số lượng còn lại: {selectedBook?.quantity ?? 0}
            </Text>

            {selectedBook?.description ? (
              <Text style={styles.description}>{selectedBook.description}</Text>
            ) : null}

            {selectedBook && selectedBook.quantity > 0 ? (
              <TouchableOpacity
                style={styles.borrowButton}
                onPress={handleBorrow}
                disabled={borrowing || loading}
              >
                {borrowing ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Mượn sách</Text>
                )}
              </TouchableOpacity>
            ) : (
              <Text style={styles.outOfStock}>Sách hiện đã hết.</Text>
            )}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleCloseBookInfo}
              disabled={borrowing}
            >
              <Text style={styles.closeButtonText}>Thoát</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  camera: { flex: 1, width: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 35,
  },
  title: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  instruction: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 14,
    marginBottom: 45,
  },
  scanFrame: {
    width: '82%',
    height: 220,
    borderWidth: 3,
    borderColor: '#22C55E',
    borderRadius: 16,
  },
  exitCameraButton: {
    marginTop: 60,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 35,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exitCameraText: { color: '#111827', fontSize: 17, fontWeight: 'bold' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  message: { textAlign: 'center', fontSize: 16, marginBottom: 20, color: '#1E293B' },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButton: { marginTop: 14, padding: 12 },
  secondaryButtonText: { color: '#2563EB', fontSize: 16 },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: '88%',
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 14,
  },
  cover: { width: 100, height: 140, alignSelf: 'center', marginBottom: 12 },
  bookTitle: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  info: { fontSize: 15, color: '#475569', marginBottom: 7 },
  description: { marginTop: 8, color: '#64748B', lineHeight: 21 },
  borrowButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  closeButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: { color: '#111827', fontSize: 17, fontWeight: 'bold' },
  outOfStock: {
    textAlign: 'center',
    color: '#DC2626',
    fontWeight: 'bold',
    marginTop: 16,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { push, ref, update } from 'firebase/database';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { db } from '../../config/firebase';
import {
  AdminBook,
  AdminBorrowRecord,
  UserAccount,
} from '../../types/admin';

type Props = {
  borrowRecords: AdminBorrowRecord[];
  books: AdminBook[];
  users: UserAccount[];
};

export default function AdminBorrowManager({
  borrowRecords,
  books,
  users,
}: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'active'>(
    'pending'
  );

  // Modal tạo phiếu mượn trực tiếp
  const [createModal, setCreateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');

  // Barcode scanner
  const [scanModal, setScanModal] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [cameraPermission, requestCameraPermission] =
    useCameraPermissions();

  // Danh sách người dùng và sách
  const userMap = new Map(users.map((user) => [user.uid, user]));
  const bookMap = new Map(books.map((book) => [book.id, book]));

  const pendingList = borrowRecords.filter(
    (record) => record.status === 'pending_borrow'
  );

  const activeList = borrowRecords.filter(
    (record) => record.status === 'borrowed'
  );

  const displayList =
    activeSubTab === 'pending' ? pendingList : activeList;

  // Xử lý khi quét mã vạch
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) {
      return;
    }

    setScanned(true);

    const normalizedCode = data.trim().toLowerCase();

    const matchedBook = books.find(
      (book) =>
        String(book.barcode || '').trim().toLowerCase() === normalizedCode
    );

    if (!matchedBook) {
      Alert.alert(
        'Không tìm thấy sách',
        `Không có sách nào có mã vạch: ${data}`,
        [
          {
            text: 'Quét lại',
            onPress: () => setScanned(false),
          },
          {
            text: 'Đóng',
            onPress: () => {
              setScanned(false);
              setScanModal(false);
            },
          },
        ]
      );

      return;
    }

    if (matchedBook.quantity <= 0) {
      Alert.alert(
        'Sách đã hết',
        `Sách "${matchedBook.title}" hiện không còn bản nào để mượn.`
      );

      setScanned(false);
      return;
    }

    setSelectedBookId(matchedBook.id);
    setScanModal(false);
    setScanned(false);

    Alert.alert(
      'Đã nhận diện sách',
      `${matchedBook.title}\nMã vạch: ${data}`
    );
  };

  // Xác nhận yêu cầu mượn sách
  const handleApproveBorrow = async (
    record: AdminBorrowRecord
  ) => {
    try {
      const now = Date.now();
      const dueDate = now + 14 * 24 * 60 * 60 * 1000;

      await update(ref(db, `borrowRecords/${record.id}`), {
        status: 'borrowed',
        borrowedAt: now,
        dueDate,
      });

      Alert.alert(
        'Thành công',
        'Đã xác nhận cho mượn sách!'
      );
    } catch (error) {
      console.error('Lỗi xác nhận cho mượn:', error);

      Alert.alert(
        'Lỗi',
        'Không thể xác nhận yêu cầu mượn.'
      );
    }
  };

  // Tạo phiếu mượn trực tiếp
  const handleCreateManualBorrow = async () => {
    if (!selectedUserId || !selectedBookId) {
      Alert.alert(
        'Thông báo',
        'Vui lòng chọn Người dùng và Sách.'
      );

      return;
    }

    const targetBook = bookMap.get(selectedBookId);

    if (!targetBook || targetBook.quantity <= 0) {
      Alert.alert(
        'Lỗi',
        'Sách này hiện đã hết trong kho.'
      );

      return;
    }

    try {
      const now = Date.now();
      const dueDate = now + 14 * 24 * 60 * 60 * 1000;

      // Giảm số lượng sách
      const newQuantity = targetBook.quantity - 1;

      await update(ref(db, `books/${targetBook.id}`), {
        quantity: newQuantity,
        available: newQuantity > 0,
      });

      // Tạo phiếu mượn mới
      const newBorrowRef = push(ref(db, 'borrowRecords'));

      await update(newBorrowRef, {
        id: newBorrowRef.key,
        userId: selectedUserId,
        bookId: selectedBookId,
        borrowedAt: now,
        dueDate,
        status: 'borrowed',
        returnedAt: null,
      });

      Alert.alert(
        'Thành công',
        'Tạo phiếu mượn sách thành công!'
      );

      setCreateModal(false);
      setSelectedUserId('');
      setSelectedBookId('');
    } catch (error) {
      console.error('Lỗi tạo phiếu mượn:', error);

      Alert.alert(
        'Lỗi',
        'Không thể tạo phiếu mượn.'
      );
    }
  };

  // Mở camera quét mã vạch
  const openScanner = async () => {
    if (!cameraPermission?.granted) {
      const permissionResult = await requestCameraPermission();

      if (!permissionResult.granted) {
        Alert.alert(
          'Cần quyền camera',
          'Vui lòng cho phép ứng dụng sử dụng camera để quét mã vạch.'
        );

        return;
      }
    }

    setScanned(false);
    setScanModal(true);
  };

  // Đóng camera
  const closeScanner = () => {
    setScanned(false);
    setScanModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topRow}>
        <Text style={styles.headerTitle}>
          Quản Lý Mượn Sách
        </Text>

        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateModal(true)}
        >
          <Ionicons
            name="add"
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.createBtnText}>
            Tạo Phiếu Mượn
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[
            styles.subTab,
            activeSubTab === 'pending' && styles.subTabActive,
          ]}
          onPress={() => setActiveSubTab('pending')}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'pending' &&
                styles.subTabTextActive,
            ]}
          >
            Yêu cầu mượn ({pendingList.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.subTab,
            activeSubTab === 'active' && styles.subTabActive,
          ]}
          onPress={() => setActiveSubTab('active')}
        >
          <Text
            style={[
              styles.subTabText,
              activeSubTab === 'active' &&
                styles.subTabTextActive,
            ]}
          >
            Đang mượn ({activeList.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Danh sách phiếu mượn */}
      <FlatList
        data={displayList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const user = userMap.get(item.userId);
          const book = bookMap.get(item.bookId);

          const borrowDate = new Date(
            item.borrowedAt
          ).toLocaleDateString('vi-VN');

          const dueDate = new Date(
            item.dueDate
          ).toLocaleDateString('vi-VN');

          return (
            <View style={styles.recordCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.bookTitle}>
                  {book?.title || `Sách ID: ${item.bookId}`}
                </Text>

                <View
                  style={[
                    styles.badge,
                    item.status === 'pending_borrow'
                      ? styles.pendingBadge
                      : styles.activeBadge,
                  ]}
                >
                  <Text
                    style={
                      item.status === 'pending_borrow'
                        ? styles.pendingBadgeText
                        : styles.activeBadgeText
                    }
                  >
                    {item.status === 'pending_borrow'
                      ? 'Chờ xác nhận'
                      : 'Đang mượn'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.infoLine}>
                  <Text style={styles.label}>
                    Người mượn:{' '}
                  </Text>

                  {user?.fullName || 'N/A'} (
                  {user?.email || item.userId})
                </Text>

                <Text style={styles.infoLine}>
                  <Text style={styles.label}>
                    Tác giả:{' '}
                  </Text>

                  {book?.author || 'N/A'}
                </Text>

                <Text style={styles.infoLine}>
                  <Text style={styles.label}>
                    Ngày mượn:{' '}
                  </Text>

                  {borrowDate}

                  <Text style={styles.label}>
                    {' - Hạn trả: '}
                  </Text>

                  {dueDate}
                </Text>
              </View>

              {item.status === 'pending_borrow' && (
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => handleApproveBorrow(item)}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text style={styles.approveBtnText}>
                    Xác Nhận Cho Mượn
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {activeSubTab === 'pending'
                ? 'Không có yêu cầu mượn sách mới.'
                : 'Không có sách nào đang được mượn.'}
            </Text>
          </View>
        }
      />

      {/* Modal tạo phiếu mượn */}
      <Modal
        visible={createModal}
        animationType="slide"
        transparent
        onRequestClose={() => setCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tạo Phiếu Mượn Trực Tiếp
              </Text>

              <TouchableOpacity
                onPress={() => setCreateModal(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Chọn người dùng */}
            <Text style={styles.selectLabel}>
              1. Chọn Người Dùng *
            </Text>

            <View style={styles.pickerBox}>
              <FlatList
                data={users.filter(
                  (user) => user.role === 'user'
                )}
                keyExtractor={(user) => user.uid}
                style={styles.pickerList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickItem,
                      selectedUserId === item.uid &&
                        styles.pickItemActive,
                    ]}
                    onPress={() => setSelectedUserId(item.uid)}
                  >
                    <Text
                      style={[
                        styles.pickText,
                        selectedUserId === item.uid &&
                          styles.pickTextActive,
                      ]}
                    >
                      {item.fullName} ({item.email})
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Chọn sách */}
            <Text style={styles.selectLabel}>
              2. Chọn Sách Mượn *
            </Text>

            <TouchableOpacity
              style={styles.scanBtn}
              onPress={openScanner}
            >
              <Ionicons
                name="barcode-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text style={styles.scanBtnText}>
                Quét mã vạch sách
              </Text>
            </TouchableOpacity>

            {selectedBookId !== '' && (
              <Text style={styles.selectedBookText}>
                Đã chọn:{' '}
                {bookMap.get(selectedBookId)?.title ||
                  'Không xác định'}
              </Text>
            )}

            <View style={styles.pickerBox}>
              <FlatList
                data={books.filter(
                  (book) => book.quantity > 0
                )}
                keyExtractor={(book) => book.id}
                style={styles.pickerList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.pickItem,
                      selectedBookId === item.id &&
                        styles.pickItemActive,
                    ]}
                    onPress={() => setSelectedBookId(item.id)}
                  >
                    <Text
                      style={[
                        styles.pickText,
                        selectedBookId === item.id &&
                          styles.pickTextActive,
                      ]}
                    >
                      {item.title} (Còn: {item.quantity})
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCreateModal(false)}
              >
                <Text style={styles.cancelBtnText}>
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateManualBorrow}
              >
                <Text style={styles.saveBtnText}>
                  Tạo Phiếu
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal quét mã vạch */}
      <Modal
        visible={scanModal}
        animationType="slide"
        onRequestClose={closeScanner}
      >
        <View style={styles.scannerContainer}>
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={
              scanned ? undefined : handleBarcodeScanned
            }
            barcodeScannerSettings={{
              barcodeTypes: [
                'ean13',
                'ean8',
                'code128',
                'code39',
                'upc_a',
                'upc_e',
                'qr',
              ],
            }}
          />

          <View style={styles.scannerOverlay}>
            <TouchableOpacity
              style={styles.closeScannerBtn}
              onPress={closeScanner}
            >
              <Ionicons
                name="close"
                size={28}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <Text style={styles.scannerTitle}>
              Quét mã vạch sách
            </Text>

            <View style={styles.scanFrame} />

            <Text style={styles.scannerHint}>
              Đưa mã vạch vào trong khung để quét
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },

  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  createBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
    marginLeft: 4,
  },

  subTabRow: {
    flexDirection: 'row',
    marginBottom: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    padding: 3,
  },

  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },

  subTabActive: {
    backgroundColor: '#FFFFFF',
  },

  subTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  subTabTextActive: {
    color: '#1E293B',
    fontWeight: 'bold',
  },

  listContent: {
    paddingBottom: 20,
  },

  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },

  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },

  pendingBadgeText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: 'bold',
  },

  activeBadge: {
    backgroundColor: '#DBEAFE',
  },

  activeBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: 'bold',
  },

  cardBody: {
    marginTop: 4,
  },

  infoLine: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 3,
  },

  label: {
    color: '#64748B',
    fontWeight: '600',
  },

  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingVertical: 8,
    marginTop: 10,
  },

  approveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },

  emptyWrap: {
    alignItems: 'center',
    padding: 30,
  },

  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
  },

  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 11,
    marginBottom: 8,
  },

  scanBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },

  selectedBookText: {
    color: '#1D4ED8',
    fontSize: 13,
    marginBottom: 6,
  },

  pickerBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    padding: 4,
  },

  pickerList: {
    maxHeight: 150,
  },

  pickItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderRadius: 4,
  },

  pickItemActive: {
    backgroundColor: '#DBEAFE',
  },

  pickText: {
    fontSize: 13,
    color: '#334155',
  },

  pickTextActive: {
    color: '#1D4ED8',
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
  },

  selectLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
    marginTop: 10,
    marginBottom: 6,
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },

  cancelBtnText: {
    color: '#475569',
    fontWeight: 'bold',
  },

  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#059669',
  },

  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },

  // Thay cho StyleSheet.absoluteFillObject
  camera: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  scannerOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  closeScannerBtn: {
    position: 'absolute',
    top: 55,
    right: 20,
    zIndex: 2,
    padding: 8,
  },

  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
  },

  scanFrame: {
    width: 300,
    height: 180,
    borderWidth: 3,
    borderColor: '#22C55E',
    borderRadius: 12,
  },

  scannerHint: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 24,
  },
});
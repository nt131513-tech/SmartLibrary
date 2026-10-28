import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { push, ref, remove, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { ReaderCard, UserAccount } from '../../types/admin';

type Props = {
  users: UserAccount[];
  readerCards: ReaderCard[];
};

export default function AdminCardManager({ users, readerCards }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'expired' | 'locked'>('all');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State for Card Registration
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [readerType, setReaderType] = useState<'student' | 'lecturer' | 'other'>('student');
  const [validityMonths, setValidityMonths] = useState<number>(12); // Default 1 year
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Helper to generate a unique card code
  const generateCardNumber = () => {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `DG-${new Date().getFullYear()}-${randomDigits}`;
  };

  const openRegistrationModal = (prefillUser?: UserAccount) => {
    const newCardNum = generateCardNumber();
    setCardNumber(newCardNum);

    if (prefillUser) {
      setSelectedUserId(prefillUser.uid);
      setFullName(prefillUser.fullName || '');
      setUserEmail(prefillUser.email || '');
      setPhone(prefillUser.phone || '');
    } else {
      setSelectedUserId('');
      setFullName('');
      setUserEmail('');
      setPhone('');
    }

    setReaderType('student');
    setValidityMonths(12);
    setNotes('');
    setModalVisible(true);
  };

  const handleSelectUser = (uid: string) => {
    setSelectedUserId(uid);
    if (!uid) return;

    const u = users.find((item) => item.uid === uid);
    if (u) {
      setFullName(u.fullName || '');
      setUserEmail(u.email || '');
      if (u.phone) setPhone(u.phone);
    }
  };

  const handleRegisterCard = async () => {
    if (!cardNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập hoặc tạo mã thẻ độc giả.');
      return;
    }
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên độc giả.');
      return;
    }

    // Check if card number already exists
    const existing = readerCards.find(
      (c) => c.cardNumber.trim().toLowerCase() === cardNumber.trim().toLowerCase()
    );
    if (existing) {
      Alert.alert('Lỗi', `Mã thẻ "${cardNumber}" đã tồn tại trong hệ thống.`);
      return;
    }

    try {
      setSubmitting(true);
      const now = Date.now();
      const expiry = new Date(now);
      expiry.setMonth(expiry.getMonth() + validityMonths);

      const newCardData: Omit<ReaderCard, 'id'> = {
        cardNumber: cardNumber.trim().toUpperCase(),
        userId: selectedUserId || '',
        userEmail: userEmail.trim(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        readerType,
        issueDate: now,
        expiryDate: expiry.getTime(),
        status: 'active',
        notes: notes.trim(),
        createdAt: now,
      };

      const cardsRef = ref(db, 'readerCards');
      await push(cardsRef, newCardData);

      Alert.alert('Thành công', `Đã cấp thẻ độc giả thành công cho "${fullName.trim()}"!`);
      setModalVisible(false);
    } catch (error) {
      console.error('Lỗi đăng ký thẻ:', error);
      Alert.alert('Lỗi', 'Không thể tạo thẻ độc giả. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = (card: ReaderCard) => {
    const isLocked = card.status === 'locked';
    const newStatus = isLocked ? 'active' : 'locked';
    const actionName = isLocked ? 'MỞ KHÓA' : 'KHÓA';

    Alert.alert(
      `Xác nhận ${actionName} thẻ`,
      `Bạn có chắc chắn muốn ${actionName.toLowerCase()} thẻ độc giả "${card.cardNumber}" của độc giả ${card.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: actionName,
          style: isLocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await update(ref(db, `readerCards/${card.id}`), {
                status: newStatus,
              });
              Alert.alert('Thành công', `Đã ${actionName.toLowerCase()} thẻ thành công.`);
            } catch (err) {
              console.error('Lỗi đổi trạng thái thẻ:', err);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái thẻ.');
            }
          },
        },
      ]
    );
  };

  const handleRenewCard = (card: ReaderCard) => {
    Alert.alert(
      'Gia hạn thẻ độc giả',
      `Gia hạn thêm 12 tháng cho thẻ "${card.cardNumber}" của ${card.fullName}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Gia hạn 1 năm',
          onPress: async () => {
            try {
              const currentExpiry = card.expiryDate > Date.now() ? card.expiryDate : Date.now();
              const newExpiryObj = new Date(currentExpiry);
              newExpiryObj.setFullYear(newExpiryObj.getFullYear() + 1);

              await update(ref(db, `readerCards/${card.id}`), {
                expiryDate: newExpiryObj.getTime(),
                status: 'active',
              });
              Alert.alert('Thành công', 'Đã gia hạn thẻ độc giả thành công.');
            } catch (err) {
              console.error('Lỗi gia hạn thẻ:', err);
              Alert.alert('Lỗi', 'Không thể gia hạn thẻ độc giả.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteCard = (card: ReaderCard) => {
    Alert.alert(
      'Xóa thẻ độc giả',
      `Bạn có chắc muốn xóa thẻ "${card.cardNumber}" khỏi hệ thống? Hành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(db, `readerCards/${card.id}`));
              Alert.alert('Thành công', 'Đã xóa thẻ độc giả.');
            } catch (err) {
              console.error('Lỗi xóa thẻ:', err);
              Alert.alert('Lỗi', 'Không thể xóa thẻ.');
            }
          },
        },
      ]
    );
  };

  // Filtering
  const now = Date.now();
  const filteredCards = readerCards.filter((card) => {
    const s = search.toLowerCase();
    const matchesSearch =
      card.cardNumber.toLowerCase().includes(s) ||
      card.fullName.toLowerCase().includes(s) ||
      (card.userEmail || '').toLowerCase().includes(s) ||
      (card.phone || '').toLowerCase().includes(s);

    if (!matchesSearch) return false;

    const isExpired = card.expiryDate < now && card.status !== 'locked';

    if (statusFilter === 'active') return card.status === 'active' && !isExpired;
    if (statusFilter === 'expired') return isExpired;
    if (statusFilter === 'locked') return card.status === 'locked';

    return true;
  });

  const activeCount = readerCards.filter(
    (c) => c.status === 'active' && c.expiryDate >= now
  ).length;
  const expiredCount = readerCards.filter(
    (c) => c.expiryDate < now && c.status !== 'locked'
  ).length;
  const lockedCount = readerCards.filter((c) => c.status === 'locked').length;

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'N/A';
    const d = new Date(timestamp);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getReaderTypeLabel = (type: string) => {
    switch (type) {
      case 'student':
        return 'Sinh Viên';
      case 'lecturer':
        return 'Giảng Viên';
      default:
        return 'Độc Giả Khác';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Title & Register Action */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Quản Lý Thẻ Độc Giả ({readerCards.length})</Text>
          <Text style={styles.headerSubtitle}>Đăng ký & quản lý thẻ thư viện cho người đọc</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => openRegistrationModal()}
          activeOpacity={0.8}
        >
          <Ionicons name="card-outline" size={18} color="#FFF" />
          <Text style={styles.addBtnText}>Cấp Thẻ Mới</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#DBEAFE' }]}>
          <Text style={[styles.statNum, { color: '#1D4ED8' }]}>{activeCount}</Text>
          <Text style={styles.statLabel}>Đang Hoạt Động</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: '#FEF3C7' }]}>
          <Text style={[styles.statNum, { color: '#D97706' }]}>{expiredCount}</Text>
          <Text style={styles.statLabel}>Hết Hạn</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.statNum, { color: '#DC2626' }]}>{lockedCount}</Text>
          <Text style={styles.statLabel}>Bị Khóa</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo mã thẻ, tên độc giả, SĐT..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Status Chips */}
      <View style={styles.filterChipsRow}>
        <TouchableOpacity
          style={[styles.chip, statusFilter === 'all' && styles.chipActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={[styles.chipText, statusFilter === 'all' && styles.chipTextActive]}>
            Tất cả ({readerCards.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, statusFilter === 'active' && styles.chipActive]}
          onPress={() => setStatusFilter('active')}
        >
          <Text style={[styles.chipText, statusFilter === 'active' && styles.chipTextActive]}>
            Hoạt động ({activeCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, statusFilter === 'expired' && styles.chipActive]}
          onPress={() => setStatusFilter('expired')}
        >
          <Text style={[styles.chipText, statusFilter === 'expired' && styles.chipTextActive]}>
            Hết hạn ({expiredCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.chip, statusFilter === 'locked' && styles.chipActive]}
          onPress={() => setStatusFilter('locked')}
        >
          <Text style={[styles.chipText, statusFilter === 'locked' && styles.chipTextActive]}>
            Đã khóa ({lockedCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Cards List */}
      <FlatList
        data={filteredCards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => {
          const isExpired = item.expiryDate < now && item.status !== 'locked';
          const isLocked = item.status === 'locked';

          let statusBadgeColor = '#D1FAE5';
          let statusTextColor = '#047857';
          let statusLabel = 'Đang hoạt động';

          if (isLocked) {
            statusBadgeColor = '#FEE2E2';
            statusTextColor = '#B91C1C';
            statusLabel = 'Đã bị khóa';
          } else if (isExpired) {
            statusBadgeColor = '#FEF3C7';
            statusTextColor = '#B45309';
            statusLabel = 'Đã hết hạn';
          }

          return (
            <View style={styles.cardItem}>
              {/* Top Row: Card Code & Status */}
              <View style={styles.cardHeader}>
                <View style={styles.cardBadge}>
                  <Ionicons name="card" size={16} color="#1E6FD9" style={{ marginRight: 4 }} />
                  <Text style={styles.cardBadgeText}>{item.cardNumber}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusBadgeColor }]}>
                  <Text style={[styles.statusText, { color: statusTextColor }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              {/* Reader Info */}
              <View style={styles.cardBody}>
                <Text style={styles.readerName}>{item.fullName}</Text>
                <View style={styles.infoMetaRow}>
                  <View style={styles.readerTypeTag}>
                    <Text style={styles.readerTypeTagText}>
                      {getReaderTypeLabel(item.readerType)}
                    </Text>
                  </View>
                  {item.phone ? (
                    <Text style={styles.metaText}>📞 {item.phone}</Text>
                  ) : null}
                </View>

                {item.userEmail ? (
                  <Text style={styles.metaText}>✉️ {item.userEmail}</Text>
                ) : null}

                <View style={styles.dateRow}>
                  <Text style={styles.dateText}>
                    Ngày cấp: <Text style={styles.dateVal}>{formatDate(item.issueDate)}</Text>
                  </Text>
                  <Text style={styles.dateText}>
                    Hạn dùng: <Text style={styles.dateVal}>{formatDate(item.expiryDate)}</Text>
                  </Text>
                </View>

                {item.notes ? (
                  <Text style={styles.notesText}>📝 Ghi chú: {item.notes}</Text>
                ) : null}
              </View>

              {/* Actions */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#E0F2FE' }]}
                  onPress={() => handleRenewCard(item)}
                >
                  <Ionicons name="time-outline" size={14} color="#0284C7" />
                  <Text style={[styles.actionBtnText, { color: '#0284C7' }]}>Gia Hạn</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: isLocked ? '#D1FAE5' : '#FEE2E2' },
                  ]}
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons
                    name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'}
                    size={14}
                    color={isLocked ? '#059669' : '#DC2626'}
                  />
                  <Text
                    style={[
                      styles.actionBtnText,
                      { color: isLocked ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {isLocked ? 'Mở Khóa' : 'Khóa Thẻ'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#F1F5F9' }]}
                  onPress={() => handleDeleteCard(item)}
                >
                  <Ionicons name="trash-outline" size={14} color="#64748B" />
                  <Text style={[styles.actionBtnText, { color: '#64748B' }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có thẻ độc giả nào</Text>
            <Text style={styles.emptySub}>
              Nhấn nút "Cấp Thẻ Mới" ở phía trên để đăng ký thẻ thư viện cho độc giả.
            </Text>
          </View>
        }
      />

      {/* Modal Registration Form */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="card" size={22} color="#1E6FD9" />
                <Text style={styles.modalTitle}>Đăng Ký Thẻ Thư Viện</Text>
              </View>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Select Existing User (Optional) */}
              <Text style={styles.label}>Liên kết tài khoản độc giả (Tùy chọn):</Text>
              <View style={styles.userPickerContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={[
                      styles.userChip,
                      selectedUserId === '' && styles.userChipSelected,
                    ]}
                    onPress={() => handleSelectUser('')}
                  >
                    <Text
                      style={[
                        styles.userChipText,
                        selectedUserId === '' && styles.userChipTextSelected,
                      ]}
                    >
                      + Nhập Độc Giả Mới
                    </Text>
                  </TouchableOpacity>

                  {users
                    .filter((u) => u.role === 'user')
                    .map((u) => (
                      <TouchableOpacity
                        key={u.uid}
                        style={[
                          styles.userChip,
                          selectedUserId === u.uid && styles.userChipSelected,
                        ]}
                        onPress={() => handleSelectUser(u.uid)}
                      >
                        <Text
                          style={[
                            styles.userChipText,
                            selectedUserId === u.uid && styles.userChipTextSelected,
                          ]}
                        >
                          👤 {u.fullName || u.email}
                        </Text>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>

              {/* Card Number Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Mã Thẻ Độc Giả <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWithBtn}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Mã thẻ (Ví dụ: DG-2026-1001)"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                  />
                  <TouchableOpacity
                    style={styles.genBtn}
                    onPress={() => setCardNumber(generateCardNumber())}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#1E6FD9" />
                    <Text style={styles.genBtnText}>Tạo mã</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Full Name Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  Họ và Tên Độc Giả <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập đầy đủ họ và tên"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email & Phone */}
              <View style={styles.rowForm}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Email (nếu có)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Email liên hệ"
                    keyboardType="email-address"
                    value={userEmail}
                    onChangeText={setUserEmail}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Số điện thoại</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Số điện thoại"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>
              </View>

              {/* Reader Type Select */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Loại Độc Giả:</Text>
                <View style={styles.radioGroup}>
                  <TouchableOpacity
                    style={[
                      styles.radioBtn,
                      readerType === 'student' && styles.radioBtnActive,
                    ]}
                    onPress={() => setReaderType('student')}
                  >
                    <Text
                      style={[
                        styles.radioBtnText,
                        readerType === 'student' && styles.radioBtnTextActive,
                      ]}
                    >
                      Sinh Viên
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioBtn,
                      readerType === 'lecturer' && styles.radioBtnActive,
                    ]}
                    onPress={() => setReaderType('lecturer')}
                  >
                    <Text
                      style={[
                        styles.radioBtnText,
                        readerType === 'lecturer' && styles.radioBtnTextActive,
                      ]}
                    >
                      Giảng Viên
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.radioBtn,
                      readerType === 'other' && styles.radioBtnActive,
                    ]}
                    onPress={() => setReaderType('other')}
                  >
                    <Text
                      style={[
                        styles.radioBtnText,
                        readerType === 'other' && styles.radioBtnTextActive,
                      ]}
                    >
                      Độc Giả Khác
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Validity Period */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Thời Hạn Giá Trị Thẻ:</Text>
                <View style={styles.radioGroup}>
                  {[6, 12, 24, 36].map((months) => (
                    <TouchableOpacity
                      key={months}
                      style={[
                        styles.radioBtn,
                        validityMonths === months && styles.radioBtnActive,
                      ]}
                      onPress={() => setValidityMonths(months)}
                    >
                      <Text
                        style={[
                          styles.radioBtnText,
                          validityMonths === months && styles.radioBtnTextActive,
                        ]}
                      >
                        {months >= 12 ? `${months / 12} năm` : `${months} tháng`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Notes Input */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Ghi chú thêm:</Text>
                <TextInput
                  style={[styles.input, { height: 60, textAlignVertical: 'top' }]}
                  placeholder="Lớp, khoa, mút thời gian, địa chỉ..."
                  multiline={true}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>
            </ScrollView>

            {/* Modal Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.cancelModalBtnText}>Hủy Bỏ</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.submitModalBtn}
                onPress={handleRegisterCard}
                disabled={submitting}
              >
                <Text style={styles.submitModalBtnText}>
                  {submitting ? 'Đang Xử Lý...' : 'Xác Nhận Đăng Ký Thẻ'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E6FD9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFF', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  statNum: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#475569', marginTop: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  filterChipsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  chipActive: { backgroundColor: '#DBEAFE' },
  chipText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  chipTextActive: { color: '#1E6FD9', fontWeight: 'bold' },
  cardItem: {
    backgroundColor: '#FFF',
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
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: { fontSize: 13, fontWeight: 'bold', color: '#1E6FD9' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  cardBody: { marginBottom: 10 },
  readerName: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  infoMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  readerTypeTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  readerTypeTagText: { fontSize: 11, color: '#475569', fontWeight: '600' },
  metaText: { fontSize: 12, color: '#64748B', marginTop: 4 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 6,
  },
  dateText: { fontSize: 11, color: '#64748B' },
  dateVal: { fontWeight: 'bold', color: '#334155' },
  notesText: { fontSize: 11, color: '#64748B', fontStyle: 'italic', marginTop: 6 },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  emptyContainer: { alignItems: 'center', padding: 36 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginTop: 12 },
  emptySub: { fontSize: 13, color: '#94A3B8', textAlign: 'center', marginTop: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalTitleWrap: { flexDirection: 'row', alignItems: 'center' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginLeft: 8 },
  modalBody: { padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 6 },
  required: { color: '#DC2626' },
  userPickerContainer: { marginBottom: 14 },
  userChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userChipSelected: { backgroundColor: '#DBEAFE', borderColor: '#1E6FD9' },
  userChipText: { fontSize: 12, color: '#64748B' },
  userChipTextSelected: { color: '#1E6FD9', fontWeight: 'bold' },
  formGroup: { marginBottom: 14 },
  rowForm: { flexDirection: 'row' },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 42,
    fontSize: 14,
    color: '#1E293B',
  },
  inputWithBtn: { flexDirection: 'row', alignItems: 'center' },
  genBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    height: 42,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  genBtnText: { color: '#1E6FD9', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  radioGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  radioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  radioBtnActive: { backgroundColor: '#DBEAFE', borderColor: '#1E6FD9' },
  radioBtnText: { fontSize: 13, color: '#475569' },
  radioBtnTextActive: { color: '#1E6FD9', fontWeight: 'bold' },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    gap: 10,
  },
  cancelModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  cancelModalBtnText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
  submitModalBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1E6FD9',
  },
  submitModalBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});

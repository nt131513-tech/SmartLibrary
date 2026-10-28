import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { push, ref, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { AppNotification, UserAccount } from '../../types/admin';

type Props = {
  users: UserAccount[];
  notifications: AppNotification[];
};

export default function AdminNotificationManager({
  users,
  notifications,
}: Props) {
  const [targetUserId, setTargetUserId] = useState<string>('all');
  const [notifType, setNotifType] = useState<'general' | 'new_book' | 'due_soon' | 'overdue'>('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const normalUsers = users.filter((u) => u.role === 'user');

  const handleApplyTemplate = (type: typeof notifType) => {
    setNotifType(type);
    if (type === 'new_book') {
      setTitle('📚 Sách Mới Vừa Về Thư Viện!');
      setMessage('Thư viện vừa cập nhật thêm nhiều đầu sách hấp dẫn mới. Hãy đến mượn ngay hôm nay!');
    } else if (type === 'due_soon') {
      setTitle('⏰ Nhắc Nhở Hạn Trả Sách Sắp Tới');
      setMessage('Sách bạn mượn sẽ đến hạn trả trong vòng 2 ngày tới. Vui lòng chuẩn bị trả đúng hạn.');
    } else if (type === 'overdue') {
      setTitle('🚨 Cảnh Báo Quá Hạn Trả Sách');
      setMessage('Bạn đang có sách quá hạn trả tại thư viện. Vui lòng mang sách trả để tránh phát sinh phí.');
    } else {
      setTitle('📢 Thông Báo Từ Thư Viện');
      setMessage('Thư viện thông báo về lịch làm việc và các quy định mới...');
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo.');
      return;
    }

    try {
      setSending(true);

      const notifData = {
        userId: targetUserId,
        title: title.trim(),
        message: message.trim(),
        type: notifType,
        createdAt: Date.now(),
        read: false,
      };

      const newRef = push(ref(db, 'notifications'));
      await update(newRef, {
        ...notifData,
        id: newRef.key,
      });

      Alert.alert(
        'Thành công',
        targetUserId === 'all'
          ? 'Đã gửi thông báo tới TẤT CẢ người dùng!'
          : 'Đã gửi thông báo thành công!'
      );

      // Reset
      setTitle('');
      setMessage('');
    } catch (error) {
      console.error('Lỗi gửi thông báo:', error);
      Alert.alert('Lỗi', 'Không thể gửi thông báo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Gửi Thông Báo Cho Độc Giả</Text>

      {/* Preset Templates */}
      <Text style={styles.sectionLabel}>Mẫu Thông Báo Nhanh</Text>
      <View style={styles.templateRow}>
        <TouchableOpacity
          style={[styles.templateChip, notifType === 'new_book' && styles.chipActive]}
          onPress={() => handleApplyTemplate('new_book')}
        >
          <Text style={[styles.chipText, notifType === 'new_book' && styles.chipTextActive]}>
            📚 Sách mới
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.templateChip, notifType === 'due_soon' && styles.chipActive]}
          onPress={() => handleApplyTemplate('due_soon')}
        >
          <Text style={[styles.chipText, notifType === 'due_soon' && styles.chipTextActive]}>
            ⏰ Sắp hết hạn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.templateChip, notifType === 'overdue' && styles.chipActive]}
          onPress={() => handleApplyTemplate('overdue')}
        >
          <Text style={[styles.chipText, notifType === 'overdue' && styles.chipTextActive]}>
            🚨 Quá hạn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.templateChip, notifType === 'general' && styles.chipActive]}
          onPress={() => handleApplyTemplate('general')}
        >
          <Text style={[styles.chipText, notifType === 'general' && styles.chipTextActive]}>
            📢 Thông báo chung
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.cardForm}>
        <Text style={styles.label}>Gửi đến người dùng:</Text>
        <ScrollView horizontal style={styles.targetScroll} showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.targetChip,
              targetUserId === 'all' && styles.targetChipActive,
            ]}
            onPress={() => setTargetUserId('all')}
          >
            <Text
              style={[
                styles.targetText,
                targetUserId === 'all' && styles.targetTextActive,
              ]}
            >
              🌐 Tất cả độc giả ({normalUsers.length})
            </Text>
          </TouchableOpacity>

          {normalUsers.map((u) => (
            <TouchableOpacity
              key={u.uid}
              style={[
                styles.targetChip,
                targetUserId === u.uid && styles.targetChipActive,
              ]}
              onPress={() => setTargetUserId(u.uid)}
            >
              <Text
                style={[
                  styles.targetText,
                  targetUserId === u.uid && styles.targetTextActive,
                ]}
              >
                👤 {u.fullName || u.email}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Tiêu đề thông báo *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Nhập tiêu đề..."
        />

        <Text style={styles.label}>Nội dung thông báo *</Text>
        <TextInput
          style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
          value={message}
          onChangeText={setMessage}
          multiline
          placeholder="Nhập nội dung thông báo..."
        />

        <TouchableOpacity
          style={[styles.sendBtn, sending && { opacity: 0.6 }]}
          onPress={handleSendNotification}
          disabled={sending}
        >
          <Ionicons name="paper-plane-outline" size={18} color="#FFF" />
          <Text style={styles.sendBtnText}>
            {sending ? 'Đang gửi...' : 'GỬI THÔNG BÁO'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Sent Notifications History */}
      <Text style={styles.historyTitle}>Lịch Sử Thông Báo Đã Gửi ({notifications.length})</Text>

      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>Chưa có thông báo nào được gửi.</Text>
      ) : (
        notifications.slice(0, 10).map((n, index) => (
          <View key={n.id || index} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyCardTitle}>{n.title}</Text>
              <Text style={styles.historyDate}>
                {new Date(n.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </View>
            <Text style={styles.historyMessage}>{n.message}</Text>
            <Text style={styles.historyTarget}>
              Gửi tới: {n.userId === 'all' ? 'Tất cả độc giả' : 'ID: ' + n.userId}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#64748B', marginBottom: 8 },
  templateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  templateChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: { backgroundColor: '#DBEAFE', borderColor: '#2563EB' },
  chipText: { fontSize: 12, color: '#475569' },
  chipTextActive: { color: '#1D4ED8', fontWeight: 'bold' },
  cardForm: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 8, marginBottom: 4 },
  targetScroll: { marginBottom: 10, maxHeight: 38 },
  targetChip: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  targetChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  targetText: { fontSize: 12, color: '#334155' },
  targetTextActive: { color: '#FFF', fontWeight: 'bold' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    marginTop: 10,
  },
  sendBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  emptyText: { color: '#94A3B8', fontSize: 13, fontStyle: 'italic', marginBottom: 20 },
  historyCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B', flex: 1 },
  historyDate: { fontSize: 11, color: '#94A3B8' },
  historyMessage: { fontSize: 13, color: '#475569', marginTop: 4 },
  historyTarget: { fontSize: 11, color: '#2563EB', marginTop: 6, fontStyle: 'italic' },
});

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ref, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { UserAccount } from '../../types/admin';

type Props = {
  users: UserAccount[];
};

export default function AdminUserManager({ users }: Props) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    return (
      (u.fullName || '').toLowerCase().includes(s) ||
      (u.email || '').toLowerCase().includes(s)
    );
  });

  const handleToggleLock = (user: UserAccount) => {
    const newStatus = !user.isLocked;
    const actionText = newStatus ? 'KHÓA' : 'MỞ KHÓA';

    Alert.alert(
      `Xác nhận ${actionText}`,
      `Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản "${user.fullName || user.email}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: actionText,
          style: newStatus ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await update(ref(db, `users/${user.uid}`), {
                isLocked: newStatus,
              });
              Alert.alert('Thành công', `Đã ${actionText.toLowerCase()} tài khoản thành công.`);
            } catch (error) {
              console.error('Lỗi khi đổi trạng thái khóa:', error);
              Alert.alert('Lỗi', 'Không thể cập nhật trạng thái tài khoản.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Quản Lý Tài Khoản ({users.length})</Text>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên người dùng, email..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.uid}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const isLibrarian = item.role === 'librarian';
          const isLocked = item.isLocked === true;

          return (
            <View style={styles.userCard}>
              <View style={styles.avatarWrap}>
                <Ionicons
                  name={isLibrarian ? 'shield-checkmark' : 'person'}
                  size={24}
                  color={isLibrarian ? '#2563EB' : '#475569'}
                />
              </View>

              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{item.fullName || 'Chưa cập nhật'}</Text>
                  {isLibrarian && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>Thủ Thư</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userEmail}>{item.email}</Text>
                
                <View style={styles.statusRow}>
                  <Text style={styles.statusLabel}>Trạng thái: </Text>
                  <View
                    style={[
                      styles.statusTag,
                      isLocked ? styles.lockedTag : styles.activeTag,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusTagText,
                        isLocked ? styles.lockedTagText : styles.activeTagText,
                      ]}
                    >
                      {isLocked ? 'Đã bị khóa' : 'Hoạt động'}
                    </Text>
                  </View>
                </View>
              </View>

              {!isLibrarian && (
                <TouchableOpacity
                  style={[
                    styles.lockBtn,
                    isLocked ? styles.unlockBtnStyle : styles.lockBtnStyle,
                  ]}
                  onPress={() => handleToggleLock(item)}
                >
                  <Ionicons
                    name={isLocked ? 'lock-open-outline' : 'lock-closed-outline'}
                    size={16}
                    color="#FFF"
                  />
                  <Text style={styles.lockBtnText}>
                    {isLocked ? 'Mở Khóa' : 'Khóa'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Không tìm thấy tài khoản người dùng nào.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  userCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  roleBadge: {
    backgroundColor: '#DBEAFE',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  roleBadgeText: { fontSize: 10, color: '#1D4ED8', fontWeight: 'bold' },
  userEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusLabel: { fontSize: 12, color: '#64748B' },
  statusTag: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  activeTag: { backgroundColor: '#D1FAE5' },
  activeTagText: { color: '#047857', fontSize: 11, fontWeight: '600' },
  lockedTag: { backgroundColor: '#FEE2E2' },
  lockedTagText: { color: '#B91C1C', fontSize: 11, fontWeight: '600' },
  lockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  lockBtnStyle: { backgroundColor: '#DC2626' },
  unlockBtnStyle: { backgroundColor: '#059669' },
  lockBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
  emptyWrap: { alignItems: 'center', padding: 30 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
});

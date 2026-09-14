import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>

      {/* ================= HEADER ================= */}

      <View style={styles.header}>

        <View>
          <Text style={styles.welcome}>
            Xin chào 👋
          </Text>

          <Text style={styles.title}>
            Smart Library
          </Text>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          activeOpacity={0.8}
        >
          <Text style={styles.profileIcon}>
            👤
          </Text>
        </TouchableOpacity>

      </View>


      {/* ================= BANNER ================= */}

      <View style={styles.banner}>

        <Text style={styles.bannerTitle}>
          Thư viện thông minh
        </Text>

        <Text style={styles.bannerText}>
          Tìm sách, mượn sách và đặt chỗ
          {'\n'}
          ngồi ngay trên điện thoại.
        </Text>

      </View>


      {/* ================= CHỨC NĂNG ================= */}

      <Text style={styles.sectionTitle}>
        Chức năng chính
      </Text>

      <View style={styles.grid}>

        {/* ================= SÁCH ================= */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => router.push('/books')}
        >
          <Text style={styles.cardIcon}>
            📚
          </Text>

          <Text style={styles.cardTitle}>
            Sách
          </Text>

          <Text style={styles.cardDescription}>
            Tìm kiếm và mượn sách
          </Text>
        </TouchableOpacity>


        {/* ================= ĐẶT CHỖ ================= */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => {
            // Sẽ kết nối màn hình đặt chỗ sau
          }}
        >
          <Text style={styles.cardIcon}>
            💺
          </Text>

          <Text style={styles.cardTitle}>
            Đặt chỗ
          </Text>

          <Text style={styles.cardDescription}>
            Xem và đặt chỗ ngồi
          </Text>
        </TouchableOpacity>


        {/* ================= LỊCH SỬ ================= */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => {
            // Sẽ kết nối màn hình lịch sử sau
          }}
        >
          <Text style={styles.cardIcon}>
            📋
          </Text>

          <Text style={styles.cardTitle}>
            Lịch sử
          </Text>

          <Text style={styles.cardDescription}>
            Mượn sách và đặt chỗ
          </Text>
        </TouchableOpacity>


        {/* ================= THÔNG BÁO ================= */}

        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => {
            // Sẽ kết nối màn hình thông báo sau
          }}
        >
          <Text style={styles.cardIcon}>
            🔔
          </Text>

          <Text style={styles.cardTitle}>
            Thông báo
          </Text>

          <Text style={styles.cardDescription}>
            Thông báo thư viện
          </Text>
        </TouchableOpacity>

      </View>


      {/* ================= ĐĂNG XUẤT ================= */}

      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.7}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.logoutText}>
          Đăng xuất
        </Text>
      </TouchableOpacity>

    </View>
  );
}


/* ================================================= */
/* ===================== STYLE ===================== */
/* ================================================= */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingHorizontal: 20,
    paddingTop: 55,
  },


  /* ================= HEADER ================= */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 14,
    color: '#666',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#163A63',
    marginTop: 4,
  },

  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5EEF9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  profileIcon: {
    fontSize: 23,
  },


  /* ================= BANNER ================= */

  banner: {
    backgroundColor: '#1E6FD9',
    borderRadius: 16,
    padding: 20,
    marginTop: 25,
  },

  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },

  bannerText: {
    color: '#EAF3FF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },


  /* ================= SECTION ================= */

  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
    marginTop: 25,
    marginBottom: 15,
  },


  /* ================= GRID ================= */

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },


  /* ================= CARD ================= */

  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    minHeight: 145,
    elevation: 2,
  },

  cardIcon: {
    fontSize: 32,
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#163A63',
  },

  cardDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 5,
    lineHeight: 17,
  },


  /* ================= LOGOUT ================= */

  logoutButton: {
    alignItems: 'center',
    marginTop: 15,
  },

  logoutText: {
    color: '#D9534F',
    fontSize: 14,
    fontWeight: '600',
  },

});
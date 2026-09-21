import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLibrary } from "../context/LibraryContext";

// Ảnh bìa sách book01 trong thư mục assets
const bookCoverImages: Record<string, any> = {
  book01: require("../../assets/images/book01.png"),
  book02: require("../../assets/images/book02.png"),
  book03: require("../../assets/images/book03.png"),
  book04: require("../../assets/images/book04.png"),
};

export default function ScanBookScreen() {
  const [permission, requestPermission] = useCameraPermissions();

  const { books, borrowBook, loading } = useLibrary();

  const [scanned, setScanned] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState(false);

  const selectedBook = books.find(
    (book) => book.id === selectedBookId
  );

  // Xử lý khi quét mã sách
  const handleBarcodeScanned = ({
    data,
  }: {
    data: string;
    type: string;
  }) => {
    if (scanned) return;

    setScanned(true);

    const code = data.trim();

    // Tìm sách theo barcode, ISBN hoặc ID
    const foundBook = books.find(
      (book) =>
        book.barcode?.toString().trim() === code ||
        book.isbn?.toString().trim() === code ||
        book.id === code
    );

    if (!foundBook) {
      Alert.alert(
        "Không tìm thấy sách",
        `Không có sách nào tương ứng với mã:\n${code}`,
        [
          {
            text: "Quét lại",
            onPress: () => setScanned(false),
          },
          {
            text: "Thoát",
            style: "cancel",
            onPress: () => router.back(),
          },
        ]
      );

      return;
    }

    setSelectedBookId(foundBook.id);
  };

  // Xử lý mượn sách
  const handleBorrowBook = async () => {
    if (!selectedBook) return;

    setBorrowing(true);

    try {
      const success = await borrowBook(selectedBook.id, 1);

      if (success) {
        Alert.alert(
          "Mượn sách thành công",
          `Bạn đã mượn sách "${selectedBook.title}".`,
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert(
          "Không thể mượn sách",
          "Sách có thể đã hết hoặc bạn đã đạt giới hạn mượn sách."
        );
      }
    } catch (error) {
      console.error("Borrow book error:", error);

      Alert.alert(
        "Lỗi",
        "Đã xảy ra lỗi trong quá trình mượn sách."
      );
    } finally {
      setBorrowing(false);
    }
  };

  // Đóng thông tin sách và quét lại
  const handleExitBookInfo = () => {
    setSelectedBookId(null);
    setScanned(false);
  };

  // Kiểm tra quyền camera
  if (!permission) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00C853" />

        <Text style={styles.messageText}>
          Đang kiểm tra quyền camera...
        </Text>
      </SafeAreaView>
    );
  }

  // Yêu cầu cấp quyền camera
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>
          Cần quyền truy cập camera
        </Text>

        <Text style={styles.permissionText}>
          Ứng dụng cần sử dụng camera để quét mã vạch sách.
        </Text>

        <TouchableOpacity
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.buttonText}>
            Cấp quyền camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitButton}
          onPress={() => router.back()}
        >
          <Text style={styles.exitButtonText}>
            Thoát
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Tiêu đề */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Quét mã sách
        </Text>

        <View style={styles.headerPlaceholder} />
      </View>

      {/* Hướng dẫn */}
      <Text style={styles.instructionText}>
        Đưa mã vạch của sách vào khung quét bên dưới
      </Text>

      {/* Khung camera thu nhỏ */}
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={
            scanned ? undefined : handleBarcodeScanned
          }
          barcodeScannerSettings={{
            barcodeTypes: [
              "ean13",
              "ean8",
              "code128",
              "code39",
              "upc_a",
              "upc_e",
              "qr",
            ],
          }}
          onMountError={(error) => {
            console.log("Camera error:", error);

            Alert.alert(
              "Lỗi camera",
              "Không thể khởi động camera."
            );
          }}
        />

        {/* Khung đánh dấu vùng quét */}
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </View>

      {/* Trạng thái */}
      <Text style={styles.statusText}>
        {scanned
          ? "Đã quét mã. Đang kiểm tra thông tin sách..."
          : "Đang chờ quét mã sách..."}
      </Text>

      {/* Nút quét lại */}
      {scanned && (
        <TouchableOpacity
          style={styles.rescanButton}
          onPress={() => {
            setScanned(false);
            setSelectedBookId(null);
          }}
        >
          <Text style={styles.buttonText}>
            Quét lại
          </Text>
        </TouchableOpacity>
      )}

      {/* Nút thoát */}
      <TouchableOpacity
        style={styles.bottomExitButton}
        onPress={() => router.back()}
      >
        <Text style={styles.bottomExitButtonText}>
          Thoát
        </Text>
      </TouchableOpacity>

      {/* Modal thông tin sách */}
      <Modal
        visible={!!selectedBook}
        transparent
        animationType="slide"
        onRequestClose={handleExitBookInfo}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Thông tin sách
            </Text>

            {loading ? (
              <ActivityIndicator
                size="large"
                color="#00C853"
              />
            ) : selectedBook ? (
              <>
                {/* Hiển thị ảnh book01 */}
                {bookCoverImages[selectedBook.id] ? (
                  <Image
                    source={bookCoverImages[selectedBook.id]}
                    style={styles.bookImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>
                      Chưa có ảnh bìa
                    </Text>
                  </View>
                )}

                {/* Tên sách */}
                <Text style={styles.bookTitle}>
                  {selectedBook.title}
                </Text>

                {/* Thông tin sách */}
                <Text style={styles.bookInfo}>
                  Tác giả: {selectedBook.author}
                </Text>

                <Text style={styles.bookInfo}>
                  Thể loại: {selectedBook.category}
                </Text>

                <Text style={styles.bookInfo}>
                  ISBN: {selectedBook.isbn || "Chưa cập nhật"}
                </Text>

                <Text style={styles.bookInfo}>
                  Mã vạch:{" "}
                  {selectedBook.barcode || "Chưa cập nhật"}
                </Text>

                <Text style={styles.bookInfo}>
                  Vị trí kệ:{" "}
                  {selectedBook.shelf || "Chưa cập nhật"}
                </Text>

                <Text style={styles.bookQuantity}>
                  Số lượng còn lại: {selectedBook.available}
                </Text>

                {selectedBook.description ? (
                  <Text style={styles.descriptionText}>
                    {selectedBook.description}
                  </Text>
                ) : null}

                {/* Nút mượn sách */}
                <TouchableOpacity
                  style={styles.borrowButton}
                  onPress={handleBorrowBook}
                  disabled={borrowing}
                >
                  {borrowing ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      Mượn sách
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Nút thoát */}
                <TouchableOpacity
                  style={styles.modalExitButton}
                  onPress={handleExitBookInfo}
                  disabled={borrowing}
                >
                  <Text style={styles.modalExitButtonText}>
                    Thoát
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },

  messageText: {
    marginTop: 12,
    fontSize: 16,
    color: "#555555",
  },

  header: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  backButtonText: {
    fontSize: 36,
    color: "#222222",
    lineHeight: 40,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222222",
  },

  headerPlaceholder: {
    width: 40,
  },

  instructionText: {
    marginTop: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#555555",
  },

  // Kích thước khung camera
  scannerContainer: {
    width: "85%",
    height: 220,
    marginTop: 30,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#00C853",
    backgroundColor: "#000000",
    position: "relative",
  },

  camera: {
    width: "100%",
    height: "100%",
  },

  scanFrame: {
    position: "absolute",
    top: 45,
    left: 25,
    right: 25,
    bottom: 45,
  },

  corner: {
    position: "absolute",
    width: 35,
    height: 35,
    borderColor: "#FFFFFF",
  },

  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },

  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },

  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },

  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },

  statusText: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
  },

  rescanButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    backgroundColor: "#00C853",
  },

  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#222222",
  },

  permissionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555555",
    marginBottom: 24,
  },

  permissionButton: {
    backgroundColor: "#00C853",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },

  exitButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    backgroundColor: "#EEEEEE",
  },

  exitButtonText: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
  },

  bottomExitButton: {
    position: "absolute",
    bottom: 30,
    width: "85%",
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#EEEEEE",
  },

  bottomExitButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  modalContainer: {
    width: "100%",
    maxHeight: "90%",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFFFFF",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 18,
    color: "#222222",
  },

  bookImage: {
    width: 120,
    height: 160,
    alignSelf: "center",
    borderRadius: 8,
    marginBottom: 16,
  },

  noImageContainer: {
    width: 120,
    height: 160,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EEEEEE",
    borderRadius: 8,
    marginBottom: 16,
  },

  noImageText: {
    color: "#777777",
    textAlign: "center",
  },

  bookTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222222",
    marginBottom: 12,
  },

  bookInfo: {
    fontSize: 15,
    color: "#555555",
    marginBottom: 6,
  },

  bookQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#00A844",
    marginTop: 8,
    marginBottom: 12,
  },

  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#666666",
    marginBottom: 16,
  },

  borrowButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#00C853",
    marginTop: 12,
  },

  modalExitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: "#EEEEEE",
    marginTop: 12,
  },

  modalExitButtonText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
});
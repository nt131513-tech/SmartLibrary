import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { push, ref, remove, update } from 'firebase/database';
import { db } from '../../config/firebase';
import { AdminBook } from '../../types/admin';

type Props = {
  books: AdminBook[];
};

export default function AdminBookManager({ books }: Props) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tất cả');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState<AdminBook | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shelf, setShelf] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [totalQuantity, setTotalQuantity] = useState('1');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');

  // Extract unique categories for filter
  const categories = ['Tất cả', ...Array.from(new Set(books.map((b) => b.category).filter(Boolean)))];

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.isbn.toLowerCase().includes(search.toLowerCase()) ||
      String(b.barcode || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === 'Tất cả' || b.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const generateBarcode = () => {
    // Tạo mã số 12 chữ số dựa trên thời gian hiện tại.
    const generated = String(Date.now()).slice(-12).padStart(12, '0');
    setBarcode(generated);
  };

  const handleGenerateBarcodeForBook = async (book: AdminBook) => {
    const generated = String(Date.now()).slice(-12).padStart(12, '0');
    try {
      await update(ref(db, `books/${book.id}`), { barcode: generated });
      Alert.alert('Thành công', `Đã tạo mã cho sách "${book.title}"\nMã: ${generated}`);
    } catch (error) {
      console.error('Lỗi tạo mã:', error);
      Alert.alert('Lỗi', 'Không thể tạo mã cho sách.');
    }
  };

  const handleOpenAdd = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setCategory('Công nghệ thông tin');
    setIsbn('');
    setBarcode('');
    setShelf('A1');
    setQuantity('5');
    setTotalQuantity('5');
    setCoverImage('');
    setDescription('');
    setModalVisible(true);
  };

  const handleOpenEdit = (book: AdminBook) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setIsbn(book.isbn || '');
    setBarcode(book.barcode || '');
    setShelf(book.shelf || '');
    setQuantity(String(book.quantity ?? 0));
    setTotalQuantity(String(book.totalQuantity ?? book.quantity ?? 0));
    setCoverImage(book.coverImage || '');
    setDescription(book.description || '');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !author.trim() || !category.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ Tên sách, Tác giả và Thể loại.');
      return;
    }

    const qtyNum = parseInt(quantity, 10) || 0;
    const totalQtyNum = parseInt(totalQuantity, 10) || qtyNum;

    const bookData = {
      title: title.trim(),
      author: author.trim(),
      category: category.trim(),
      isbn: isbn.trim(),
      barcode: barcode.trim(),
      shelf: shelf.trim(),
      quantity: qtyNum,
      totalQuantity: totalQtyNum,
      available: qtyNum > 0,
      coverImage: coverImage.trim(),
      description: description.trim(),
    };

    try {
      if (editingBook) {
        // Update
        await update(ref(db, `books/${editingBook.id}`), bookData);
        Alert.alert('Thành công', 'Cập nhật thông tin sách thành công!');
      } else {
        // Create new
        const newRef = push(ref(db, 'books'));
        await update(newRef, {
          ...bookData,
          id: newRef.key,
        });
        Alert.alert('Thành công', 'Thêm sách mới thành công!');
      }
      setModalVisible(false);
    } catch (error) {
      console.error('Lỗi khi lưu sách:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin sách.');
    }
  };

  const handleDelete = (book: AdminBook) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc muốn xóa sách "${book.title}" khỏi hệ thống?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await remove(ref(db, `books/${book.id}`));
              Alert.alert('Thành công', 'Đã xóa sách.');
            } catch (err) {
              console.error('Lỗi xóa sách:', err);
              Alert.alert('Lỗi', 'Không thể xóa sách này.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header & Add Button */}
      <View style={styles.topRow}>
        <Text style={styles.headerTitle}>Quản Lý Sách ({books.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd}>
          <Ionicons name="add-circle" size={20} color="#FFF" />
          <Text style={styles.addBtnText}>Thêm Sách</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm theo tên, tác giả, ISBN..."
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.catChip,
              categoryFilter === cat && styles.catChipActive,
            ]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text
              style={[
                styles.catChipText,
                categoryFilter === cat && styles.catChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Book List */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.bookCard}>
            <Image
              source={
                item.coverImage
                  ? { uri: item.coverImage }
                  : require('../../../assets/images/hcmute_logo.png')
              }
              style={styles.bookCover}
              resizeMode="cover"
            />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.bookAuthor}>Tác giả: {item.author}</Text>
              <Text style={styles.bookCategory}>Thể loại: {item.category}</Text>
              <Text style={styles.bookQty}>
                Còn: <Text style={styles.qtyHighlight}>{item.quantity}</Text> / {item.totalQuantity || item.quantity} bản
              </Text>
            </View>

            <View style={styles.actionCol}>
              <TouchableOpacity
                style={styles.codeBtn}
                onPress={() => handleGenerateBarcodeForBook(item)}
              >
                <Ionicons name="barcode-outline" size={18} color="#059669" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenEdit(item)}
              >
                <Ionicons name="create-outline" size={18} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash-outline" size={18} color="#DC2626" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>Không tìm thấy sách phù hợp.</Text>
          </View>
        }
      />

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBook ? 'Sửa Thông Tin Sách' : 'Thêm Sách Mới'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Tên sách *</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tên sách..."
              />

              <Text style={styles.label}>Tác giả *</Text>
              <TextInput
                style={styles.input}
                value={author}
                onChangeText={setAuthor}
                placeholder="Nhập tên tác giả..."
              />

              <Text style={styles.label}>Thể loại *</Text>
              <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="Ví dụ: Công nghệ thông tin, Kinh tế..."
              />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Số lượng còn</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Tổng số lượng</Text>
                  <TextInput
                    style={styles.input}
                    value={totalQuantity}
                    onChangeText={setTotalQuantity}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Mã ISBN</Text>
                  <TextInput
                    style={styles.input}
                    value={isbn}
                    onChangeText={setIsbn}
                    placeholder="ISBN..."
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Vị trí kệ</Text>
                  <TextInput
                    style={styles.input}
                    value={shelf}
                    onChangeText={setShelf}
                    placeholder="Ví dụ: Kệ A1"
                  />
                </View>
              </View>

              <Text style={styles.label}>Mã vạch sách</Text>
              <View style={styles.barcodeRow}>
                <TextInput
                  style={[styles.input, styles.barcodeInput]}
                  value={barcode}
                  onChangeText={setBarcode}
                  placeholder="Nhập hoặc tạo mã vạch..."
                  keyboardType="numeric"
                />
                <TouchableOpacity style={styles.generateBtn} onPress={generateBarcode}>
                  <Ionicons name="barcode-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.generateBtnText}>Tạo mã</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Link Hình ảnh (URL)</Text>
              <TextInput
                style={styles.input}
                value={coverImage}
                onChangeText={setCoverImage}
                placeholder="https://example.com/image.jpg"
              />

              <Text style={styles.label}>Mô tả sách</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={description}
                onChangeText={setDescription}
                multiline
                placeholder="Tóm tắt nội dung..."
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Lưu Sách</Text>
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
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFF', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 10,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1E293B' },
  categoryScroll: { maxHeight: 38, marginBottom: 14 },
  catChip: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
  },
  catChipActive: { backgroundColor: '#2563EB' },
  catChipText: { fontSize: 13, color: '#475569' },
  catChipTextActive: { color: '#FFF', fontWeight: 'bold' },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookCover: { width: 60, height: 80, borderRadius: 6, backgroundColor: '#F1F5F9' },
  bookInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  bookTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B' },
  bookAuthor: { fontSize: 13, color: '#64748B', marginTop: 2 },
  bookCategory: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  bookQty: { fontSize: 12, color: '#475569', marginTop: 4 },
  qtyHighlight: { fontWeight: 'bold', color: '#059669' },
  actionCol: { justifyContent: 'space-around', alignItems: 'center', paddingLeft: 8 },
  codeBtn: { padding: 6 },
  editBtn: { padding: 6 },
  deleteBtn: { padding: 6 },
  emptyWrap: { alignItems: 'center', padding: 30 },
  emptyText: { color: '#94A3B8', fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
    marginBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  formScroll: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1E293B',
  },
  row: { flexDirection: 'row' },
  barcodeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barcodeInput: { flex: 1 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 10, paddingVertical: 10, borderRadius: 8 },
  generateBtnText: { color: '#FFFFFF', fontWeight: 'bold', marginLeft: 4, fontSize: 12 },
  modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 10 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#F1F5F9' },
  cancelBtnText: { color: '#475569', fontWeight: 'bold' },
  saveBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#2563EB' },
  saveBtnText: { color: '#FFF', fontWeight: 'bold' },
});

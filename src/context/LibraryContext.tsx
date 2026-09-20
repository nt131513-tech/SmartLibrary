import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  get,
  onValue,
  push,
  ref,
  update,
} from 'firebase/database';

import { auth, db } from '../config/firebase';

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  shelf: string;
  quantity: number;
  totalQuantity: number;
  available: boolean;
  description?: string;
  barcode?: string;
  coverImage?: string;
};

export type BorrowRecord = {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: number;
  dueDate: number;
  returnedAt?: number | null;
  status: 'borrowed' | 'returned';
};

type LibraryContextType = {
  books: Book[];
  borrowRecords: BorrowRecord[];
  loading: boolean;
  borrowBook: (bookId: string) => Promise<boolean>;
  returnBook: (bookId: string) => Promise<boolean>;
  isBorrowed: (bookId: string) => boolean;
};

const LibraryContext = createContext<
  LibraryContextType | undefined
>(undefined);

export function LibraryProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<
    BorrowRecord[]
  >([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // TẢI DANH SÁCH SÁCH TỪ FIREBASE
  // =====================================================

  useEffect(() => {
    const booksRef = ref(db, 'books');

    const unsubscribe = onValue(
      booksRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setBooks([]);
          setLoading(false);
          return;
        }

        const bookList: Book[] = Object.entries(data).map(
          ([id, value]) => {
            const book = value as Partial<Book>;

            const quantity = Number(book.quantity ?? 0);

            const totalQuantity = Number(
              book.totalQuantity ?? quantity
            );

            return {
              id,
              title: String(book.title ?? ''),
              author: String(book.author ?? ''),
              category: String(book.category ?? ''),
              isbn: String(book.isbn ?? ''),
              shelf: String(book.shelf ?? ''),
              quantity,
              totalQuantity,
              available: quantity > 0,
              description: String(
                book.description ?? ''
              ),
              barcode: String(book.barcode ?? ''),
              coverImage: String(book.coverImage ?? ''),
            };
          }
        );

        setBooks(bookList);
        setLoading(false);
      },
      (error) => {
        console.error(
          'Lỗi tải danh sách sách:',
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // TẢI LỊCH SỬ MƯỢN SÁCH CỦA TÀI KHOẢN HIỆN TẠI
  // =====================================================

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setBorrowRecords([]);
      return;
    }

    const recordsRef = ref(db, 'borrowRecords');

    const unsubscribe = onValue(
      recordsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setBorrowRecords([]);
          return;
        }

        const records: BorrowRecord[] = Object.entries(
          data
        )
          .map(([id, value]) => {
            const record = value as Omit<
              BorrowRecord,
              'id'
            >;

            return {
              id,
              ...record,
            };
          })
          .filter(
            (record) =>
              record.userId === currentUser.uid
          )
          .sort(
            (a, b) => b.borrowedAt - a.borrowedAt
          );

        setBorrowRecords(records);
      },
      (error) => {
        console.error(
          'Lỗi tải lịch sử mượn sách:',
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================================================
  // KIỂM TRA SÁCH CÓ ĐANG ĐƯỢC NGƯỜI DÙNG MƯỢN KHÔNG
  // =====================================================

  const isBorrowed = (bookId: string): boolean => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      return false;
    }

    return borrowRecords.some(
      (record) =>
        record.userId === currentUser.uid &&
        record.bookId === bookId &&
        record.status === 'borrowed'
    );
  };

  // =====================================================
  // MƯỢN SÁCH
  // =====================================================

  const borrowBook = async (
    bookId: string
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Chưa có tài khoản đăng nhập');
      return false;
    }

    const book = books.find(
      (item) => item.id === bookId
    );

    if (!book) {
      console.log('Không tìm thấy sách');
      return false;
    }

    if (book.quantity <= 0) {
      console.log('Sách đã hết');
      return false;
    }

    // Không cho mượn cùng một cuốn sách nhiều lần
    if (isBorrowed(bookId)) {
      console.log('Bạn đang mượn sách này');
      return false;
    }

    try {
      const newQuantity = book.quantity - 1;

      const borrowedAt = Date.now();

      // Thời hạn mượn: 14 ngày
      const dueDate =
        borrowedAt + 14 * 24 * 60 * 60 * 1000;

      // Cập nhật số lượng sách
      await update(ref(db, `books/${bookId}`), {
        quantity: newQuantity,
        available: newQuantity > 0,
      });

      // Tạo bản ghi lịch sử mượn
      const newRecordRef = push(
        ref(db, 'borrowRecords')
      );

      await update(newRecordRef, {
        userId: currentUser.uid,
        bookId,
        borrowedAt,
        dueDate,
        returnedAt: null,
        status: 'borrowed',
      });

      return true;
    } catch (error) {
      console.error(
        'Lỗi khi mượn sách:',
        error
      );

      return false;
    }
  };

  // =====================================================
  // TRẢ SÁCH
  // =====================================================

  const returnBook = async (
    bookId: string
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Chưa có tài khoản đăng nhập');
      return false;
    }

    const book = books.find(
      (item) => item.id === bookId
    );

    if (!book) {
      console.log('Không tìm thấy sách');
      return false;
    }

    try {
      const newQuantity = Math.min(
        book.quantity + 1,
        book.totalQuantity
      );

      // Cập nhật số lượng sách
      await update(ref(db, `books/${bookId}`), {
        quantity: newQuantity,
        available: newQuantity > 0,
      });

      // Lấy toàn bộ lịch sử mượn
      const recordsSnapshot = await get(
        ref(db, 'borrowRecords')
      );

      if (recordsSnapshot.exists()) {
        const records = recordsSnapshot.val();

        for (const recordId of Object.keys(records)) {
          const record = records[recordId];

          if (
            record.userId === currentUser.uid &&
            record.bookId === bookId &&
            record.status === 'borrowed'
          ) {
            await update(
              ref(db, `borrowRecords/${recordId}`),
              {
                status: 'returned',
                returnedAt: Date.now(),
              }
            );

            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error(
        'Lỗi khi trả sách:',
        error
      );

      return false;
    }
  };

  // =====================================================
  // CUNG CẤP DỮ LIỆU CHO CÁC MÀN HÌNH
  // =====================================================

  return (
    <LibraryContext.Provider
      value={{
        books,
        borrowRecords,
        loading,
        borrowBook,
        returnBook,
        isBorrowed,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

// =====================================================
// HOOK SỬ DỤNG CONTEXT
// =====================================================

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error(
      'useLibrary phải được sử dụng bên trong LibraryProvider'
    );
  }

  return context;
}
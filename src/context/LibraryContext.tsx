import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

import { onAuthStateChanged } from 'firebase/auth';
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
  quantity?: number;
  borrowedAt: number;
  dueDate: number;
  returnedAt?: number | null;
  status: 'borrowed' | 'returned';
};

type LibraryContextType = {
  books: Book[];
  borrowRecords: BorrowRecord[];
  loading: boolean;
  borrowBook: (bookId: string, quantity: number) => Promise<boolean>;
  returnBook: (bookId: string, quantity: number) => Promise<boolean>;
  getBorrowedQuantity: (bookId: string) => number;
};

const LibraryContext = createContext<LibraryContextType | undefined>(
  undefined
);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState(true);

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

        const bookList: Book[] = Object.entries(data).map(([id, value]) => {
          const book = value as Partial<Book>;
          const quantity = Number(book.quantity ?? 0);
          const totalQuantity = Number(book.totalQuantity ?? quantity);

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
            description: String(book.description ?? ''),
            barcode: String(book.barcode ?? ''),
            coverImage: String(book.coverImage ?? ''),
          };
        });

        setBooks(bookList);
        setLoading(false);
      },
      (error) => {
        console.error('Lỗi tải danh sách sách:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribeRecords: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (unsubscribeRecords) {
        unsubscribeRecords();
        unsubscribeRecords = undefined;
      }

      if (!currentUser) {
        setBorrowRecords([]);
        return;
      }

      const recordsRef = ref(db, 'borrowRecords');

      unsubscribeRecords = onValue(
        recordsRef,
        (snapshot) => {
          const data = snapshot.val();

          if (!data) {
            setBorrowRecords([]);
            return;
          }

          const records: BorrowRecord[] = Object.entries(data)
            .map(([id, value]) => {
              const record = value as Omit<BorrowRecord, 'id'>;
              return {
                id,
                ...record,
                quantity: Number(record.quantity ?? 1),
              };
            })
            .filter((record) => record.userId === currentUser.uid)
            .sort((a, b) => b.borrowedAt - a.borrowedAt);

          setBorrowRecords(records);
        },
        (error) => {
          console.error('Lỗi tải lịch sử mượn sách:', error);
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeRecords) unsubscribeRecords();
    };
  }, []);

  const getBorrowedQuantity = (bookId: string): number => {
    return borrowRecords
      .filter(
        (record) =>
          record.bookId === bookId && record.status === 'borrowed'
      )
      .reduce((total, record) => total + Number(record.quantity ?? 1), 0);
  };

  const borrowBook = async (
    bookId: string,
    quantity: number
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Chưa có tài khoản đăng nhập');
      return false;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      console.log('Số lượng mượn không hợp lệ');
      return false;
    }

    const book = books.find((item) => item.id === bookId);

    if (!book) {
      console.log('Không tìm thấy sách');
      return false;
    }

    if (book.quantity < quantity) {
      console.log('Số lượng sách trong kho không đủ');
      return false;
    }

    const borrowedQuantity = getBorrowedQuantity(bookId);

    if (borrowedQuantity + quantity > book.totalQuantity) {
      console.log('Số lượng mượn vượt quá giới hạn');
      return false;
    }

    try {
      const borrowedAt = Date.now();
      const dueDateObject = new Date(borrowedAt);
      dueDateObject.setMonth(dueDateObject.getMonth() + 3);

      const newQuantity = book.quantity - quantity;

      const newRecordRef = push(ref(db, 'borrowRecords'));

      await update(ref(db), {
        [`books/${bookId}/quantity`]: newQuantity,
        [`books/${bookId}/available`]: newQuantity > 0,
        [`borrowRecords/${newRecordRef.key}`]: {
          userId: currentUser.uid,
          bookId,
          quantity,
          borrowedAt,
          dueDate: dueDateObject.getTime(),
          returnedAt: null,
          status: 'borrowed',
        },
      });

      console.log('Mượn sách thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi mượn sách:', error);
      return false;
    }
  };

  const returnBook = async (
    bookId: string,
    quantity: number
  ): Promise<boolean> => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      console.log('Chưa có tài khoản đăng nhập');
      return false;
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      console.log('Số lượng trả không hợp lệ');
      return false;
    }

    const book = books.find((item) => item.id === bookId);
    if (!book) {
      console.log('Không tìm thấy sách');
      return false;
    }

    const borrowedQuantity = getBorrowedQuantity(bookId);

    if (quantity > borrowedQuantity) {
      console.log('Số lượng trả vượt quá số lượng đang mượn');
      return false;
    }

    try {
      const recordsSnapshot = await get(ref(db, 'borrowRecords'));

      if (!recordsSnapshot.exists()) {
        return false;
      }

      const records = recordsSnapshot.val();
      let remainingToReturn = quantity;
      const changes: Record<string, unknown> = {};

      const activeRecords = Object.entries(records)
        .map(([recordId, value]) => ({
          recordId,
          record: value as Omit<BorrowRecord, 'id'>,
        }))
        .filter(
          ({ record }) =>
            record.userId === currentUser.uid &&
            record.bookId === bookId &&
            record.status === 'borrowed'
        )
        .sort((a, b) => a.record.borrowedAt - b.record.borrowedAt);

      for (const { recordId, record } of activeRecords) {
        if (remainingToReturn <= 0) break;

        const recordQuantity = Number(record.quantity ?? 1);
        const returnedFromRecord = Math.min(
          recordQuantity,
          remainingToReturn
        );
        const leftInRecord = recordQuantity - returnedFromRecord;

        if (leftInRecord === 0) {
          changes[`borrowRecords/${recordId}/status`] = 'returned';
          changes[`borrowRecords/${recordId}/returnedAt`] = Date.now();
          changes[`borrowRecords/${recordId}/quantity`] = recordQuantity;
        } else {
          changes[`borrowRecords/${recordId}/quantity`] = leftInRecord;
        }

        remainingToReturn -= returnedFromRecord;
      }

      if (remainingToReturn > 0) {
        return false;
      }

      const newQuantity = Math.min(
        book.quantity + quantity,
        book.totalQuantity
      );

      changes[`books/${bookId}/quantity`] = newQuantity;
      changes[`books/${bookId}/available`] = newQuantity > 0;

      await update(ref(db), changes);

      console.log('Trả sách thành công');
      return true;
    } catch (error) {
      console.error('Lỗi khi trả sách:', error);
      return false;
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        borrowRecords,
        loading,
        borrowBook,
        returnBook,
        getBorrowedQuantity,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error(
      'useLibrary phải được sử dụng bên trong LibraryProvider'
    );
  }

  return context;
}

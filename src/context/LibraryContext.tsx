import {
  createContext,
  ReactNode,
  useContext,
  useState,
} from 'react';

export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn: string;
  available: boolean;
  quantity: number;
  description: string;
};

const initialBooks: Book[] = [
  {
    id: '1',
    title: 'Lập trình C++ cơ bản',
    author: 'Nguyễn Văn A',
    category: 'Lập trình',
    isbn: '9786041234567',
    available: true,
    quantity: 5,
    description:
      'Cuốn sách cung cấp các kiến thức cơ bản về ngôn ngữ lập trình C++, bao gồm biến, kiểu dữ liệu, câu lệnh điều kiện, vòng lặp, hàm, mảng và lập trình hướng đối tượng.',
  },

  {
    id: '2',
    title: 'Lập trình Python',
    author: 'Trần Văn B',
    category: 'Lập trình',
    isbn: '9786041234568',
    available: true,
    quantity: 3,
    description:
      'Tài liệu giới thiệu ngôn ngữ Python từ cơ bản đến nâng cao, phù hợp cho sinh viên bắt đầu học lập trình và phát triển ứng dụng.',
  },

  {
    id: '3',
    title: 'Cơ sở dữ liệu',
    author: 'Lê Văn C',
    category: 'Công nghệ',
    isbn: '9786041234569',
    available: false,
    quantity: 0,
    description:
      'Giới thiệu các khái niệm về cơ sở dữ liệu, mô hình dữ liệu, SQL, thiết kế cơ sở dữ liệu và hệ quản trị cơ sở dữ liệu.',
  },

  {
    id: '4',
    title: 'Trí tuệ nhân tạo',
    author: 'Phạm Văn D',
    category: 'AI',
    isbn: '9786041234570',
    available: true,
    quantity: 2,
    description:
      'Giới thiệu những kiến thức nền tảng về trí tuệ nhân tạo, học máy và các phương pháp xây dựng hệ thống thông minh.',
  },

  {
    id: '5',
    title: 'Kiến trúc máy tính',
    author: 'Hoàng Văn E',
    category: 'Phần cứng',
    isbn: '9786041234571',
    available: true,
    quantity: 4,
    description:
      'Trình bày các kiến thức cơ bản về tổ chức và kiến trúc máy tính, bộ xử lý, bộ nhớ, hệ thống vào ra và các thành phần phần cứng.',
  },
];

type LibraryContextType = {
  books: Book[];
  borrowedBookIds: string[];

  borrowBook: (bookId: string) => boolean;
  returnBook: (bookId: string) => void;

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
  const [books, setBooks] = useState<Book[]>(initialBooks);

  const [borrowedBookIds, setBorrowedBookIds] =
    useState<string[]>([]);

  /* ================= MƯỢN SÁCH ================= */

  const borrowBook = (bookId: string) => {
    const book = books.find(
      (item) => item.id === bookId
    );

    if (!book || book.quantity <= 0) {
      return false;
    }

    setBooks((currentBooks) =>
      currentBooks.map((item) =>
        item.id === bookId
          ? {
              ...item,
              quantity: item.quantity - 1,
              available: item.quantity - 1 > 0,
            }
          : item
      )
    );

    setBorrowedBookIds((currentIds) => [
      ...currentIds,
      bookId,
    ]);

    return true;
  };

  /* ================= TRẢ SÁCH ================= */

  const returnBook = (bookId: string) => {
    setBooks((currentBooks) =>
      currentBooks.map((item) =>
        item.id === bookId
          ? {
              ...item,
              quantity: item.quantity + 1,
              available: true,
            }
          : item
      )
    );

    setBorrowedBookIds((currentIds) =>
      currentIds.filter((id) => id !== bookId)
    );
  };

  /* ================= KIỂM TRA ĐÃ MƯỢN ================= */

  const isBorrowed = (bookId: string) => {
    return borrowedBookIds.includes(bookId);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        borrowedBookIds,
        borrowBook,
        returnBook,
        isBorrowed,
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
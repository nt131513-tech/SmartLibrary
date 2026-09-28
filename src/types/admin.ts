export type UserAccount = {
  uid: string;
  fullName: string;
  email: string;
  role: 'user' | 'librarian';
  isLocked?: boolean;
  createdAt?: string;
  phone?: string;
};

export type AdminBook = {
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

export type AdminBorrowRecord = {
  id: string;
  userId: string;
  bookId: string;
  borrowedAt: number;
  dueDate: number;
  returnedAt?: number | null;
  status: 'borrowed' | 'returned' | 'pending_borrow';
  userEmail?: string;
  userFullName?: string;
  bookTitle?: string;
};

export type AppNotification = {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'due_soon' | 'overdue' | 'new_book' | 'general';
  createdAt: number;
  read?: boolean;
};

/**
 * Thẻ độc giả
 */
export type ReaderCard = {
  id: string;
  cardNumber: string;
  userId: string;
  userEmail: string;
  fullName: string;
  phone: string;
  readerType: 'student' | 'lecturer' | 'other';
  issueDate: number;
  expiryDate: number;
  status: 'active' | 'locked';
  notes: string;
  createdAt: number;
};
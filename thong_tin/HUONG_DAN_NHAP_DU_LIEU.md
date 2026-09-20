# SmartLibrary - Hướng dẫn

1. Mở SmartLibrary_Data.xlsx và thêm dữ liệu vào 3 sheet.
2. Không lưu mật khẩu trong Excel.
3. Cài thư viện: `py -m pip install openpyxl`
4. Chạy: `py excel_to_firebase.py SmartLibrary_Data.xlsx`
5. Import `firebase_import/books.json` vào node `books`.
6. Import `firebase_import/users.json` vào node `users`.
7. Import `firebase_import/borrowRecords.json` vào node `borrowRecords`.
8. Tài khoản đăng nhập phải được tạo trong Firebase Authentication trước. Sau đó sao chép UID vào cột `uid` của sheet Users rồi chạy lại script.

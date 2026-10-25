# Chrome Web Store listing: FillHub (Tiếng Việt)

**Name:** FillHub

**Summary (132 characters max):**
Điền biểu mẫu web bằng dữ liệu giả thực tế, nhất quán trong 15 ngôn ngữ. Chế độ an toàn, hoàn tác; không thu thập dữ liệu.

## Description

FillHub điền biểu mẫu web bằng dữ liệu giả thực tế và nhất quán, để nhà phát triển và người kiểm thử có thể thử nghiệm các luồng đăng ký, thanh toán và nhập liệu mà không cần gõ giá trị thử nghiệm bằng tay hay dùng thông tin của người thật.

Điểm nổi bật

- 15 ngôn ngữ và 15 hồ sơ quốc gia. Tên, địa chỉ, số điện thoại, tên công ty và số định danh tuân theo định dạng của từng quốc gia.
- Người nhất quán. Mỗi lần điền tạo một người, nên họ, tên, e-mail, ô "nhập lại e-mail", tên người dùng và số điện thoại khớp với nhau.
- Nhận diện trường thông minh. Nhãn, tên, gợi ý tự động hoàn thành và loại đầu vào được kết hợp để xét, nên trường có nhãn «Cep telefonu» hoặc «Soyadınız» nhận đúng giá trị.
- Chế độ PII Safe (bật mặc định). Các định danh cá nhân dùng giá trị thử nghiệm rõ ràng: địa chỉ e-mail example.com, số điện thoại giả và số định danh thử nghiệm không bao giờ dành cho mục đích sử dụng thật.
- Hồ sơ danh tính. Dùng một người ngẫu nhiên mới ở mỗi lần điền, hoặc giữ một người cố định. Hồ sơ có thể ghim họ, tên, e-mail, điện thoại và mật khẩu, nên có thể lưu một tài khoản thử nghiệm cố định.
- Quy tắc tùy chỉnh. Ánh xạ một bộ chọn CSS sang một loại dữ liệu khi nhận diện có sẵn bỏ sót một trường. Quy tắc được chỉnh sửa trên trang cài đặt.
- Các hộp kiểm đồng ý (điều khoản, quyền riêng tư, KVKK) được đánh dấu; hộp kiểm tiếp thị vẫn để trống.
- Trường văn bản nhận câu mẫu bằng ngôn ngữ của quốc gia, được cắt theo độ dài tối đa của trường.
- Trường tệp nhận một tệp nhỏ được tạo sẵn, khớp với loại tệp được chấp nhận.
- Tự động gửi (tùy chọn, mặc định tắt) nhấn đúng nút gửi thật của biểu mẫu đã điền. Các nút có tính phá hủy như Hủy hoặc Xóa không bao giờ bị nhấn, và có thể loại trừ các trang web.
- Captcha không bao giờ bị nhấn hay giải. Captcha hiển thị được viền khung, bạn tự hoàn thành, và biểu mẫu không tự gửi.
- Chế độ hỗn loạn để kiểm thử kiểu fuzz với các giá trị bất thường.
- Hoàn tác khôi phục biểu mẫu về trạng thái trước lần điền cuối cùng.
- Sao lưu cài đặt ra tệp JSON cục bộ, và báo cáo chẩn đoán chỉ chứa số đếm.
- Hoạt động trong iframe cùng nguồn, đọc nhãn bằng ngôn ngữ của trang, và giữ giá trị đồng bộ với các framework JavaScript. Iframe khác nguồn nằm ngoài quyền activeTab và không bị thay đổi.

Cách sử dụng

1. Mở trang có biểu mẫu.
2. Nhấn Ctrl+Shift+F (Command+Shift+F trên macOS), hoặc nhấp biểu tượng FillHub trên thanh công cụ. Biểu mẫu được điền ngay.
3. Nhấn Ctrl+Shift+U để hoàn tác.
4. Nhấn Ctrl+Shift+Y cho chế độ hỗn loạn (giá trị bất thường cho kiểm thử fuzz).

Có thể đổi phím tắt tại chrome://extensions/shortcuts. Nhấp chuột phải vào một trường và chọn «Điền trường này» để chỉ điền trường đó.

Quyền riêng tư

FillHub không thu thập dữ liệu. Cài đặt nằm trong trình duyệt của bạn. Tiện ích không gửi gì cho tác giả hay bên thứ ba. Xem chính sách quyền riêng tư: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Mã nguồn mở

FillHub miễn phí và là mã nguồn mở theo giấy phép MIT. Mã nguồn, vấn đề và đóng góp: https://github.com/kilicberkay/FillHub

Hỗ trợ

FillHub miễn phí. Nếu công cụ hữu ích cho công việc của bạn, bạn có thể hỗ trợ phát triển qua GitHub Sponsors: https://github.com/sponsors/kilicberkay

Sử dụng có trách nhiệm

FillHub dành cho kiểm thử và phát triển. Số định danh được tạo ra có thể vượt qua các quy tắc kiểm tra tổng công khai, vì vậy đừng dùng dữ liệu được tạo cho các ứng dụng thật, giao dịch mua hàng hay xác nhận danh tính.

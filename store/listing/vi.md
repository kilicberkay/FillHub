# Chrome Web Store listing: FillHub (Tiếng Việt)

**Name:** FillHub

**Summary (132 characters max):**
Điền biểu mẫu web bằng dữ liệu giả thực tế, nhất quán trong 15 ngôn ngữ. Chế độ an toàn, hoàn tác; không thu thập dữ liệu.

## Description

FillHub điền biểu mẫu web bằng dữ liệu giả thực tế và nhất quán. Nhà phát triển và người kiểm thử có thể kiểm tra các luồng đăng ký, thanh toán và nhập liệu mà không cần gõ giá trị thử nghiệm bằng tay và không cần dùng thông tin của người thật.

Điểm nổi bật

- 15 ngôn ngữ và 15 hồ sơ quốc gia. Tên, địa chỉ, số điện thoại, tên công ty và số định danh tuân theo định dạng của từng quốc gia.
- Dữ liệu cá nhân nhất quán. Mỗi lần điền chỉ tạo một người. Vì vậy, tên, họ, e-mail, trường "Nhập lại e-mail", tên người dùng và số điện thoại khớp với nhau.
- Nhận diện trường thông minh. FillHub kết hợp nhãn, tên trường, gợi ý tự động hoàn thành và loại đầu vào để xác định từng trường. Nhãn bằng các ngôn ngữ khác cũng được nhận diện. Ví dụ, một trường tiếng Thổ Nhĩ Kỳ có nhãn "Cep telefonu" (điện thoại di động) sẽ nhận số điện thoại, và trường có nhãn "Soyadınız" (họ của bạn) sẽ nhận họ.
- Chế độ PII Safe (bật theo mặc định). Các thông tin định danh cá nhân dùng giá trị thử nghiệm dễ nhận biết: địa chỉ e-mail example.com, số điện thoại giữ chỗ và số định danh thử nghiệm không dành cho mục đích sử dụng thật.
- Hồ sơ danh tính. Dùng một người ngẫu nhiên mới cho mỗi lần điền, hoặc giữ một người cố định. Hồ sơ có thể cố định tên, họ, e-mail, số điện thoại và mật khẩu, để cùng một tài khoản thử nghiệm được dùng ở mọi lần điền.
- Quy tắc tùy chỉnh. Ánh xạ một bộ chọn CSS sang một loại dữ liệu khi tính năng nhận diện có sẵn không nhận ra một trường. Quy tắc được chỉnh sửa trên trang cài đặt.
- Các hộp kiểm đồng ý (điều khoản sử dụng, chính sách quyền riêng tư và đồng ý KVKK theo luật bảo vệ dữ liệu của Thổ Nhĩ Kỳ) được đánh dấu. Hộp kiểm tiếp thị vẫn để trống.
- Trường văn bản nhận câu mẫu bằng ngôn ngữ của quốc gia, được rút gọn theo độ dài tối đa của trường.
- Trường tệp nhận một tệp nhỏ được tạo tự động, khớp với loại tệp được chấp nhận.
- Tự động gửi (tùy chọn, tắt theo mặc định) nhấn nút gửi thật của biểu mẫu đã điền. Các nút mang tính phá hủy như Hủy hoặc Xóa không bao giờ được nhấn. Có thể loại trừ từng trang web khỏi tính năng tự động gửi.
- Captcha không bao giờ được nhấn hoặc giải. Captcha hiển thị được đóng khung để bạn tự hoàn thành. Khi đó, biểu mẫu không được gửi tự động.
- Chế độ hỗn loạn điền các trường bằng giá trị bất thường để kiểm thử kiểu fuzz.
- Tính năng hoàn tác khôi phục biểu mẫu về trạng thái trước lần điền gần nhất.
- Có thể sao lưu cài đặt ra tệp JSON cục bộ. Báo cáo chẩn đoán dùng khi báo lỗi chứa số đếm và các cài đặt cơ bản, nhưng không chứa tên, giá trị trường hay địa chỉ trang web.
- Hoạt động trong iframe cùng nguồn gốc và giữ giá trị đồng bộ với các framework JavaScript. Iframe khác nguồn gốc nằm ngoài phạm vi quyền activeTab và không được điền.

Cách sử dụng

1. Mở một trang có biểu mẫu.
2. Nhấn Ctrl+Shift+F (Command+Shift+F trên macOS), hoặc nhấp vào biểu tượng FillHub trên thanh công cụ. Biểu mẫu được điền ngay lập tức.
3. Nhấn Ctrl+Shift+U (Command+Shift+U trên macOS) để hoàn tác lần điền.
4. Nhấn Ctrl+Shift+Y (Command+Shift+Y trên macOS) để điền biểu mẫu ở chế độ hỗn loạn, với giá trị bất thường cho kiểm thử fuzz.

Có thể thay đổi phím tắt tại chrome://extensions/shortcuts. Để chỉ điền một trường, hãy nhấp chuột phải vào trường đó và chọn "Điền trường này".

Quyền riêng tư

FillHub không thu thập dữ liệu và không gửi yêu cầu mạng. Cài đặt chỉ được lưu trong trình duyệt của bạn. Tiện ích không gửi bất kỳ dữ liệu nào cho tác giả hay bên thứ ba. Chính sách quyền riêng tư: https://github.com/kilicberkay/FillHub/blob/main/PRIVACY.md

Mã nguồn mở

FillHub miễn phí và là mã nguồn mở theo giấy phép MIT. Mã nguồn, báo cáo sự cố và đóng góp: https://github.com/kilicberkay/FillHub

Hỗ trợ

FillHub miễn phí. Nếu FillHub hữu ích cho công việc của bạn, bạn có thể hỗ trợ việc phát triển qua GitHub Sponsors: https://github.com/sponsors/kilicberkay

Sử dụng có trách nhiệm

FillHub dành cho mục đích kiểm thử và phát triển. Số định danh được tạo có thể vượt qua các quy tắc kiểm tra tổng (checksum) công khai. Không dùng dữ liệu được tạo cho hồ sơ đăng ký thật, giao dịch mua hàng hoặc xác minh danh tính.

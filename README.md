# Luyện Toán TIMO — Tiểu học (lớp 1–6)

Ứng dụng web luyện thi **Toán TIMO** (Thailand International Mathematical Olympiad) cho học sinh tiểu học.
Chạy hoàn toàn trên trình duyệt, không cần cài đặt hay máy chủ: chỉ cần mở `index.html`.

## Tìm hiểu về TIMO

- **TIMO** là kỳ thi Olympic Toán quốc tế do Thái Lan khởi xướng, dành cho học sinh tiểu học và THCS. Đề thi ở Việt Nam in **song ngữ Anh – Việt**.
- **Các vòng thi** (tham khảo năm học 2024–2025):
  - Vòng loại (Heat Round): 25 câu × 4 điểm, khoảng 60 phút, dạng trắc nghiệm.
  - Vòng Quốc gia: 25 câu × 4 điểm.
  - Vòng Quốc tế (Final Round, tại Thái Lan): 30 câu × 5 điểm.
- **5 chủ đề kiến thức** (mỗi đề 25 câu):
  | Chủ đề | Các dạng toán trong app |
  |---|---|
  | 🧩 Tư duy logic (Logical Thinking) | Quy luật dãy số, dãy đan xen, dãy hình, ngày – tháng, bài toán tuổi, sắp xếp thứ tự, ngày trong tuần, trồng cây – cưa gỗ – leo cầu thang |
  | ➕ Số học (Arithmetic) | Tính nhanh, tìm số chưa biết, tổng – hiệu, tổng – tỉ, gà – chó, trung bình cộng, phần trăm |
  | 🔢 Lý thuyết số (Number Theory) | Ký hiệu phép toán mới, số lớn nhất/nhỏ nhất chia hết cho…, đếm số chia hết, phép chia có dư/BCNN, đánh số trang sách, tổng chữ số, chữ số tận cùng, số ước |
  | 📐 Hình học (Geometry) | Chu vi – diện tích, đếm hình vuông/hình chữ nhật/tam giác, hình chữ nhật chứa ★ (có hình vẽ), đỉnh – cạnh – mặt của hình chóp/lăng trụ, lập phương sơn màu, góc trong tam giác |
  | 🎲 Tổ hợp (Combinatorics) | Xếp hàng (hoán vị), bài toán Cho và Nhận, đếm số có chữ số khác nhau trong khoảng, quy tắc nhân, bắt tay – thi đấu vòng tròn, lập số từ chữ số, nguyên lý Dirichlet, đếm đường đi trên lưới |

> Thể thức thi có thể thay đổi theo năm — hãy xem thông báo chính thức của Ban tổ chức. Mức huy chương trong app chỉ mang tính tham khảo.

## Cấu trúc ứng dụng

1. **Chọn lớp lúc mở app lần đầu** (popup, lớp 1–6) kèm chọn cách hiển thị đề; đổi lớp bất cứ lúc nào bằng nút *Lớp ▾* — tiến độ từng lớp được giữ riêng.
2. **🗺️ Lộ trình** — 25–34 chuyên đề tùy lớp, chia theo 5 chủ đề TIMO. Mỗi chuyên đề: *Phương pháp* → *Ví dụ mẫu có lời giải* → *Luyện 5 câu*. Đúng ≥ 3/5 câu để qua và mở chuyên đề kế tiếp (1–3 sao). Nút *Học tiếp* gợi ý chuyên đề nên học, xoay vòng giữa các chủ đề.
3. **🔁 Ôn tập** — *Ôn câu sai* (mọi câu làm sai được lưu; làm đúng thì xóa khỏi danh sách), *Luyện tổng hợp* từ các chuyên đề đã học, *Ôn theo chủ đề*.
4. **📝 Thi** — *10 bộ đề cố định* mỗi lớp (làm lại vẫn đúng đề đó, lưu điểm cao nhất) và *Đề ngẫu nhiên* không giới hạn. Đề 25 câu (5 câu/chủ đề), 60 phút, chấm /100, phân tích theo chủ đề, xem lại lời giải.
5. **📖 Từ vựng** — từ vựng Toán tiếng Anh theo chủ đề + đố từ.
6. **👤 Tôi** — hồ sơ, tổng quan tiến độ, tỉ lệ đúng theo chủ đề, lịch sử thi, giới thiệu TIMO.

## Tính năng khác

- **4 cách hiển thị đề**: *Tiếng Việt*, *Song ngữ* (như đề TIMO tại Việt Nam), *Anh + chú thích* (đề tiếng Anh, tự giải nghĩa từ khó) và *English*. Lời giải luôn bằng tiếng Việt.
- **Câu hỏi sinh tự động** theo 34 dạng toán, số liệu ngẫu nhiên, đáp án do máy tính toán nên luôn chính xác.
- Dùng tốt trên điện thoại, hỗ trợ chế độ tối; dữ liệu lưu trên trình duyệt.

## Cách dùng

```bash
# Mở trực tiếp
xdg-open index.html        # hoặc nhấp đúp vào file index.html

# Hoặc chạy qua máy chủ tĩnh
python3 -m http.server 8000   # rồi mở http://localhost:8000
```

Đóng gói thành một file HTML duy nhất (dễ gửi qua Zalo/email hoặc đăng lên web để mở trên điện thoại):

```bash
node scripts/build-single.js   # tạo dist/timo.html
```

Kiểm thử bộ sinh câu hỏi (cần Node.js):

```bash
node tests/generators.test.js
```

## Cấu trúc

```
index.html             Khung giao diện
css/styles.css         Giao diện
js/generators.js       Bộ sinh câu hỏi song ngữ theo 5 chủ đề TIMO (dùng được cả trong Node)
js/vocab.js            Từ vựng Toán tiếng Anh theo chủ đề + chú thích từ khó
js/curriculum.js       Lộ trình: danh sách chuyên đề, phương pháp, lớp phù hợp
scripts/build-single.js  Đóng gói thành một file HTML (dist/timo.html)
js/app.js              Giao diện: chọn lớp, lộ trình, ôn tập, thi, từ vựng, hồ sơ
tests/                 Kiểm thử tự động cho bộ sinh câu hỏi
```

## Thêm dạng toán mới

Trong `js/generators.js`, thêm một hàm vào mảng của chủ đề tương ứng (`logic`, `arith`, `numth`, `geo`, `comb`).
Hàm nhận `g` (lớp 1–6) và trả về câu hỏi qua `numQ(...)` hoặc `strQ(...)`, với đề bài dạng `[tiếng Việt, tiếng Anh]`. Chạy lại kiểm thử để chắc chắn đáp án luôn nằm trong các phương án.

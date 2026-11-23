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

## Tính năng

- **Song ngữ Anh – Việt** như đề thi TIMO tại Việt Nam: chọn *Tiếng Việt*, *Song ngữ* (mặc định — tiếng Anh in trước, tiếng Việt in nghiêng bên dưới), *Anh + chú thích* (đề tiếng Anh, bên dưới tự động giải nghĩa từ khó) hoặc *English*. Đổi giữa chừng không mất bài đang làm. Lời giải luôn bằng tiếng Việt.
- **Từ vựng Toán tiếng Anh**: gần 80 từ theo 5 chủ đề và nhóm từ hay gặp trong câu hỏi (how many, at least, remainder, perimeter…), có ví dụ và trò đố 10 câu.
- **Chọn lớp 1–6**: độ khó tự điều chỉnh (lớp 1–2 · 3–4 · 5–6).
- **Luyện theo chủ đề**: 10 câu/lượt, chấm ngay, có **lời giải chi tiết** từng bước.
- **Luyện tổng hợp**: 10 câu trộn đều 5 chủ đề.
- **Thi thử**: 25 câu (5 câu/chủ đề), đồng hồ 60 phút, chuyển qua lại giữa các câu, chấm điểm /100, phân tích theo chủ đề và xem lại lời giải.
- **Kết quả**: tỉ lệ đúng theo chủ đề và lịch sử thi thử (lưu trên trình duyệt).
- **Câu hỏi sinh tự động không giới hạn**: mỗi dạng toán sinh số liệu ngẫu nhiên, đáp án được máy tính toán (nhiều dạng dùng duyệt vét cạn) nên luôn chính xác.
- Giao diện thân thiện với trẻ em, dùng tốt trên điện thoại, hỗ trợ chế độ tối.

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
js/vocab.js            Từ vựng Toán tiếng Anh theo chủ đề
scripts/build-single.js  Đóng gói thành một file HTML (dist/timo.html)
js/app.js              Luồng màn hình: trang chủ, luyện tập, thi thử, kết quả, giới thiệu
tests/                 Kiểm thử tự động cho bộ sinh câu hỏi
```

## Thêm dạng toán mới

Trong `js/generators.js`, thêm một hàm vào mảng của chủ đề tương ứng (`logic`, `arith`, `numth`, `geo`, `comb`).
Hàm nhận `g` (lớp 1–6) và trả về câu hỏi qua `numQ(...)` hoặc `strQ(...)`, với đề bài dạng `[tiếng Việt, tiếng Anh]`. Chạy lại kiểm thử để chắc chắn đáp án luôn nằm trong các phương án.

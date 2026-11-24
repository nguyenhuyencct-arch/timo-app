/*
 * Lộ trình học: danh sách chuyên đề theo 5 chủ đề TIMO.
 * Mỗi chuyên đề gắn với một dạng toán trong generators.js (gen), có tên theo cấp lớp,
 * phương pháp làm bài và khoảng lớp phù hợp [min, max].
 */
(function (root) {
  'use strict';
  const band = (g) => (g <= 2 ? 1 : g <= 4 ? 2 : 3);
  /** t(g) chọn tên theo cấp: [lớp 1–2, lớp 3–4, lớp 5–6]; chuỗi đơn = như nhau mọi cấp. */
  const byBand = (arr) => (g) => (typeof arr === 'string' ? arr : arr[band(g) - 1]);

  const L = (topic, gen, title, tip, min = 1, max = 6) => ({ id: gen, gen, topic, title: byBand(title), tip, min, max });

  const LESSONS = [
    // ---------- Tư duy logic ----------
    L('logic', 'sequence', 'Quy luật dãy số',
      'Tính hiệu (hoặc thương) giữa hai số liên tiếp. Nếu các hiệu bằng nhau → cộng thêm hiệu đó; nếu các hiệu tăng đều → hiệu tiếp theo cũng tăng như vậy; nếu mỗi số gấp số trước → nhân tiếp.'),
    L('logic', 'figurePattern', 'Dãy hình',
      'Đếm số hình (★) ở từng nhóm để được một dãy số, rồi tìm quy luật của dãy số đó. Với nhóm có thứ tự lớn, dùng công thức thay vì vẽ.'),
    L('logic', 'interleaved', 'Dãy số đan xen',
      'Khi dãy tăng giảm thất thường, thử tách thành hai dãy: các số ở vị trí lẻ và các số ở vị trí chẵn. Mỗi dãy con thường có quy luật riêng.', 2),
    L('logic', 'ordering', 'Sắp xếp thứ tự',
      'Vẽ một hàng dọc, đặt từng bạn vào theo từng dữ kiện "cao hơn / thấp hơn". Đổi câu "A thấp hơn B" thành "B cao hơn A" để dễ ghép.'),
    L('logic', 'weekday', 'Ngày trong tuần',
      'Cứ 7 ngày thì lặp lại thứ cũ. Lấy số ngày chia cho 7, chỉ cần đếm thêm số dư.'),
    L('logic', 'monthsDays', ['Số ngày trong tháng', 'Ngày – tháng', 'Ngày – tháng'],
      'Tháng 1, 3, 5, 7, 8, 10, 12 có 31 ngày; tháng 4, 6, 9, 11 có 30 ngày; tháng 2 có 28 ngày (năm nhuận 29). Tính số ngày giữa hai mốc rồi chia cho 7.'),
    L('logic', 'intervals', ['Cưa gỗ – đếm đoạn', 'Trồng cây', 'Trồng cây – leo cầu thang'],
      'Số lần cưa = số đoạn − 1. Trồng cây cả hai đầu: số cây = số khoảng + 1. Leo cầu thang: từ tầng 1 lên tầng n phải đi n − 1 lượt.'),
    L('logic', 'ages', 'Bài toán tuổi',
      'Hiệu số tuổi của hai người không bao giờ thay đổi. Khi tuổi người này gấp k lần người kia, hiệu số tuổi bằng (k − 1) lần tuổi người nhỏ.'),

    // ---------- Số học ----------
    L('arith', 'quickCalc', ['Tính nhanh', 'Tính nhanh', 'Tổng dãy số cách đều'],
      'Ghép các số có tổng tròn chục, tròn trăm. Dùng a × b + a × c = a × (b + c). Tổng dãy cách đều = (số đầu + số cuối) × số số hạng : 2.'),
    L('arith', 'findX', 'Tìm số chưa biết',
      'Làm ngược từ ngoài vào trong: phép cộng → trừ, phép trừ → cộng, phép nhân → chia, phép chia → nhân.'),
    L('arith', 'average', ['Phép nhân trong thực tế', 'Trung bình cộng', 'Trung bình cộng – phần trăm'],
      'Tổng = trung bình cộng × số các số. Số thêm vào = tổng mới − tổng cũ. Giảm p% nghĩa là bớt đi giá × p : 100.'),
    L('arith', 'sumDiff', ['Nhiều hơn – ít hơn', 'Tổng – hiệu', 'Tổng – hiệu, tổng – tỉ'],
      'Số lớn = (Tổng + Hiệu) : 2; số bé = (Tổng − Hiệu) : 2. Tổng – tỉ: vẽ sơ đồ, tổng số phần = k + 1, một phần = Tổng : (k + 1).'),
    L('arith', 'chickenDog', ['Đếm chân con vật', 'Gà – chó', 'Gà – chó (giả thiết tạm)'],
      'Giả sử tất cả đều là gà, tính số chân bị thiếu. Mỗi con chó hơn con gà 2 chân → số chó = số chân thiếu : 2.'),

    // ---------- Lý thuyết số ----------
    L('numth', 'lastDigitOrDivisors', ['Số lớn nhất, nhỏ nhất', 'Số lớn nhất, nhỏ nhất', 'Chữ số tận cùng – số ước'],
      'Số lớn nhất: đặt chữ số lớn nhất có thể vào hàng cao nhất trước. Chữ số tận cùng của lũy thừa lặp lại theo chu kỳ — tìm chu kỳ rồi chia lấy dư.'),
    L('numth', 'divisibleCount', ['Số chẵn, số lẻ', 'Đếm số chia hết', 'Chia hết cho a hoặc b'],
      'Từ 1 đến N có N : k (lấy phần nguyên) số chia hết cho k. Chia hết cho a hoặc b: cộng hai nhóm rồi trừ phần đếm trùng (chia hết cho BCNN).'),
    L('numth', 'remainder', ['Phép chia có dư', 'Chia có dư – BCNN', 'Bài toán số dư'],
      'Số dư luôn nhỏ hơn số chia. Nếu số đó trừ r chia hết cho a và b thì nó bằng BCNN(a, b) + r. Dư "thiếu 1" ở mọi phép chia → số đó + 1 chia hết.'),
    L('numth', 'extremeDivisible', 'Số lớn nhất/nhỏ nhất chia hết',
      'Lấy số lớn nhất (999) chia cho k, trừ đi số dư. Số nhỏ nhất: lấy 100 chia cho k, cộng thêm (k − số dư). Chia hết cho cả a và b → chia hết cho BCNN.', 2),
    L('numth', 'newOperation', 'Phép toán mới',
      'Đọc kỹ định nghĩa, thay a và b bằng số tương ứng rồi tính. Có ngoặc thì tính trong ngoặc trước.', 2),
    L('numth', 'digitSum', 'Tổng các chữ số',
      'Cố định chữ số hàng cao nhất, liệt kê các chữ số còn lại có tổng phù hợp. Đếm theo từng trường hợp để không sót.', 2),
    L('numth', 'pages', 'Đánh số trang sách',
      'Trang 1–9: mỗi trang 1 chữ số (9 chữ số). Trang 10–99: mỗi trang 2 chữ số (180 chữ số). Từ trang 100: mỗi trang 3 chữ số.', 2),

    // ---------- Hình học ----------
    L('geo', 'perimeterArea', ['Chu vi hình chữ nhật', 'Chu vi – diện tích', 'Chu vi – diện tích'],
      'Chu vi hình chữ nhật = (dài + rộng) × 2; diện tích = dài × rộng. Hình vuông: chu vi = cạnh × 4, diện tích = cạnh × cạnh.'),
    L('geo', 'countShapes', 'Đếm hình vuông, hình chữ nhật',
      'Đếm theo kích thước: hình 1 ô, hình 2 ô, ... rồi cộng lại. Lưới n × n có 1 × 1 + 2 × 2 + ... + n × n hình vuông.'),
    L('geo', 'countTriangles', 'Đếm hình tam giác',
      'Hình quạt có n đoạn thẳng chung đỉnh: mỗi cặp đoạn tạo 1 tam giác → (n − 1) + (n − 2) + ... + 1 tam giác.'),
    L('geo', 'rectWithStar', 'Hình chữ nhật chứa ★',
      'Chọn cạnh trái trong các đường dọc bên trái ô ★, cạnh phải trong các đường bên phải; tương tự với cạnh trên, cạnh dưới. Nhân số cách lại với nhau.', 2),
    L('geo', 'solidsCount', ['Hình lập phương', 'Hình chóp, hình lăng trụ', 'Hình chóp, hình lăng trụ'],
      'Hình chóp đáy n cạnh: n + 1 đỉnh, 2n cạnh, n + 1 mặt. Hình lăng trụ đáy n cạnh: 2n đỉnh, 3n cạnh, n + 2 mặt. Hình lập phương: 8 đỉnh, 12 cạnh, 6 mặt.'),
    L('geo', 'solidsAngles', ['Ghép hình vuông', 'Lập phương sơn màu', 'Lập phương sơn màu – góc'],
      'Khối n × n × n sơn ngoài: 8 khối sơn 3 mặt (đỉnh), 12 × (n − 2) khối sơn 2 mặt (cạnh), 6 × (n − 2)² khối sơn 1 mặt. Tổng ba góc tam giác = 180°.'),

    // ---------- Tổ hợp ----------
    L('comb', 'outfits', 'Quy tắc nhân',
      'Một việc gồm nhiều bước liên tiếp: số cách = tích số cách của từng bước (ví dụ: số áo × số quần).'),
    L('comb', 'arrangements', 'Xếp hàng',
      'Xếp n người: vị trí đầu n cách, tiếp theo n − 1 cách, ... Có người cố định thì bỏ người đó ra. Hai người đứng cạnh nhau: coi là một khối rồi nhân 2.'),
    L('comb', 'formNumbers', 'Lập số từ chữ số',
      'Điền từng vị trí từ trái sang phải. Chữ số đầu tiên không được là 0. Số chẵn: xét chữ số hàng đơn vị trước.'),
    L('comb', 'handshakes', 'Bắt tay – thi đấu vòng tròn',
      'n người bắt tay nhau từng đôi một: n × (n − 1) : 2 cái bắt tay. Thi đấu vòng tròn một lượt cũng tính như vậy.'),
    L('comb', 'giveTake', 'Cho và nhận',
      'Cho đi thì bớt, nhận thêm thì tăng. Gọi số lúc sau là S rồi tính ngược lại số lúc đầu. Tổng số kẹo của các bạn không đổi khi cho nhau.'),
    L('comb', 'pigeonhole', 'Nguyên lý Dirichlet',
      'Xét trường hợp xấu nhất (lấy được nhiều nhất mà vẫn chưa đạt yêu cầu), rồi cộng thêm 1.', 2),
    L('comb', 'countRange', 'Đếm số trong khoảng',
      'Chia trường hợp theo chữ số hàng cao nhất. Với mỗi trường hợp, đếm số cách chọn các chữ số còn lại (khác nhau) rồi cộng lại.', 2),
    L('comb', 'gridPaths', 'Đường đi trên lưới',
      'Ghi số cách đi tới từng điểm: điểm ở mép dưới và mép trái có 1 cách; mỗi điểm khác = số ở điểm bên trái + số ở điểm bên dưới.', 3),
  ];

  /** Các chuyên đề phù hợp với lớp g, theo thứ tự lộ trình. */
  const lessonsFor = (g) => LESSONS.filter((l) => g >= l.min && g <= l.max);

  /** Các dạng toán được dùng trong đề thi của lớp g, theo chủ đề. */
  function allowedFor(g) {
    const out = {};
    for (const l of lessonsFor(g)) (out[l.topic] = out[l.topic] || []).push(l.gen);
    return out;
  }

  const api = { LESSONS, lessonsFor, allowedFor };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TimoCurriculum = api;
})(typeof window !== 'undefined' ? window : globalThis);

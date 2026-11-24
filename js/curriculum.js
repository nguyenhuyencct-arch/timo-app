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

    L('logic', 'repeatPattern', 'Dãy hình lặp lại',
      'Tìm nhóm hình lặp lại (chu kỳ k hình). Hình thứ N: lấy N chia k, số dư r cho biết vị trí trong nhóm (dư 0 là hình cuối nhóm). Đếm số lần xuất hiện: số nhóm đầy đủ × số lần trong một nhóm + phần lẻ.'),
    L('logic', 'weekdayShift', 'Ngày thứ: trước – sau, hôm qua – ngày mai',
      'Xác định "hôm nay" trước (hôm qua là X thì hôm nay là ngày sau X). Lấy số ngày chia 7, đếm tiến (ngày sau) hoặc đếm lùi (ngày trước) theo số dư.'),
    L('logic', 'nthTerm', 'Dãy cách đều: số hạng thứ N',
      'Số hạng thứ N = số đầu + (N − 1) × khoảng cách (dãy tăng), hoặc số đầu − (N − 1) × khoảng cách (dãy giảm).', 2),
    L('logic', 'letterPattern', 'Quy luật chữ cái',
      'Đổi chữ cái sang số thứ tự A = 1, B = 2, …, Z = 26 để tìm quy luật; quá Z thì quay lại A. Dãy lộn xộn thường là hai dãy đan xen. Mật mã thường dời mỗi chữ cùng một số vị trí.', 2),
    L('logic', 'numberTriangle', 'Quy luật nhóm số (tam giác số)',
      'Thử các phép tính với hai số ở đáy: cộng, nhân, rồi cộng/trừ thêm một số; (a + b) × k; a × (b + 1)… Quy luật phải đúng với mọi nhóm đã cho.', 2),
    L('logic', 'groupShapes', 'Quy luật nhóm hình',
      'Quan sát nhóm 3, nhóm 4 để tìm kích thước nhóm thứ n (ví dụ n hàng × (n + 1) cột). Đếm riêng hình ở viền và hình bên trong bằng công thức theo n.', 2),
    L('logic', 'workRest', 'Làm việc xen nghỉ',
      'Làm n việc thì chỉ có n − 1 lần nghỉ ở giữa: tổng thời gian = n × thời gian làm + (n − 1) × thời gian nghỉ. Đổi giờ ra phút trước khi tính.', 2),
    L('logic', 'calendarSpan', 'Ngày thứ qua nhiều tháng, nhiều năm',
      'Số ngày giữa hai mốc = phần còn lại của tháng đầu + các tháng ở giữa + số ngày của tháng cuối. Năm nhuận tháng 2 có 29 ngày. Chia số ngày cho 7 rồi đếm theo số dư.', 3),

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

    L('arith', 'addTricks', 'Thủ thuật phép cộng',
      'Ghép các số có tổng tròn chục, tròn trăm. Dãy "núi" tăng rồi giảm: tính tổng phần tăng, nhân 2 rồi trừ đi số ở đỉnh.', 2),
    L('arith', 'fillMixed', 'Điền số trong phép tính hỗn hợp',
      'Tính trước các phần không chứa ô trống, rồi làm ngược từ cuối về đầu: cộng ↔ trừ, nhân ↔ chia.', 2),
    L('arith', 'money', 'Bài toán đổi tiền',
      'Tính tổng số tiền rồi chia cho giá mỗi món (bỏ phần dư). Đếm số cách trả tiền: xét lần lượt số đồng có mệnh giá lớn nhất trước.', 2),
    L('arith', 'divTricks', 'Thủ thuật phép chia',
      'Cùng số bị chia: tính từng thương rồi cộng. Cùng số chia: gộp các số bị chia rồi chia một lần; x : (2 × M) = (x : 2) : M.', 3),
    L('arith', 'mulTricks', 'Tính chất phân phối của phép nhân',
      'a × b + a × c − a × d = a × (b + c − d). Tách thừa số ẩn: 16 × 8 = 32 × 4. Nhân với 1111 = nhân với 1000 + 100 + 10 + 1.', 3),

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

    L('numth', 'cryptarithm', 'Phép tính chữ',
      'Viết số theo hàng: AB = 10 × A + B, AA = 11 × A. Dùng chữ số tận cùng và giới hạn 0–9 để thu hẹp, rồi thử từng giá trị.', 2),
    L('numth', 'divisibleSearch', 'Tìm số chia hết theo nhiều điều kiện',
      'Chia hết cho nhiều số → chia hết cho BCNN. Xét lần lượt các bội của BCNN từ số lớn nhất (hoặc nhỏ nhất) và loại các số không thỏa điều kiện chẵn/lẻ, chữ số khác nhau…', 3),
    L('numth', 'operationInfer', 'Phép toán mới: tìm quy luật',
      'Thử các công thức quen thuộc (a × b + a + b, a × a + b, (a + b) × 2…) với từng ví dụ. Công thức đúng phải khớp với tất cả các ví dụ.', 3),

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

    L('geo', 'cubeViews', 'Quan sát khối lập phương',
      'Ghi số khối ở từng cột. Tổng số khối = cộng các cột. Nhìn từ trên: đếm số cột có khối. Nhìn từ trước hoặc bên cạnh: mỗi hàng thấy số ô bằng chồng cao nhất của hàng đó.'),
    L('geo', 'segmentsCount', 'Đếm đoạn thẳng',
      'Trên một đường thẳng có n điểm thì có n × (n − 1) : 2 đoạn thẳng. Đếm riêng từng đường thẳng rồi cộng lại.', 2),
    L('geo', 'starShapes', 'Hình vuông, hình chữ nhật chứa ngôi sao',
      'Hình phải chứa vùng nhỏ nhất bao tất cả các ngôi sao. Hình chữ nhật: (cách chọn cạnh trái) × (cạnh phải) × (cạnh trên) × (cạnh dưới). Hình vuông: đếm theo từng kích thước.', 2),
    L('geo', 'irregularGrid', 'Đếm hình trong lưới khuyết',
      'Đếm theo kích thước (1 × 1, 2 × 2, …); chỉ tính các hình nằm trọn trong phần có ô, bỏ các hình đi qua chỗ khuyết.', 2),
    L('geo', 'compositePerimeter', 'Chu vi hình ghép',
      '6 bước: đọc đề → quan sát hình → đánh dấu các cạnh bằng nhau → tìm cạnh chưa biết → chỉ cộng các cạnh trên đường bao ngoài → kiểm tra lại. ⚠️ Lỗi hay gặp: cộng cả các đường kẻ bên trong hình.', 2),
    L('geo', 'cutShapes', 'Cắt hình thành các hình bằng nhau',
      'Cắt hình vuông thành n × n hình nhỏ thì cạnh nhỏ = cạnh lớn : n. Cắt hình chữ nhật: thử mọi cách chia chiều dài thành p phần, chiều rộng thành q phần (p × q = số hình).', 3),
    L('geo', 'rectOptimize', 'Biện luận chu vi – diện tích',
      'Cùng chu vi: hai cạnh càng gần nhau thì diện tích càng lớn. Cùng diện tích: hai cạnh càng gần nhau thì chu vi càng nhỏ; chiều rộng bằng 1 thì chu vi lớn nhất.', 3),
    L('geo', 'solidsSum', 'Đỉnh – cạnh – mặt: suy luận',
      'Tìm số cạnh của đáy trước. Chóp đáy n cạnh: n + 1 đỉnh, 2n cạnh, n + 1 mặt. Lăng trụ đáy n cạnh: 2n đỉnh, 3n cạnh, n + 2 mặt.', 3),

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
    L('comb', 'worstColors', 'Trường hợp xấu nhất: đủ màu',
      'Tưởng tượng mình "xui" nhất: lấy hết các màu chưa cần trước, màu cần thì còn thiếu đúng 1. Đáp án = số viên trong trường hợp xấu nhất + 1.', 2),
    L('comb', 'formNumbersRep', 'Lập số: có lặp, chẵn lẻ, lớn hơn N',
      'Điền từng vị trí; chữ số đầu khác 0. Có lặp: mỗi vị trí chọn lại được mọi chữ số. Số chẵn/lẻ/chia hết cho 5: xét chữ số cuối trước. Lớn hơn N: xét chữ số đầu.', 3),
    L('comb', 'takeTwo', 'Cho và nhận: ba bạn',
      'Gọi số lúc sau của mỗi bạn là S rồi tính ngược số lúc đầu: người cho đi thì lúc đầu nhiều hơn, người nhận thêm thì lúc đầu ít hơn.', 3),
    L('comb', 'gridPathsBlocked', 'Đường đi có điều kiện',
      'Phải qua M: (số đường A → M) × (số đường M → B). Không qua điểm cấm: tổng số đường trừ số đường đi qua điểm đó.', 3),
    L('comb', 'worstSum', 'Trường hợp xấu nhất: tổng hai số',
      'Ghép các số có tổng bằng S thành cặp. Xấu nhất: lấy hết các số không ghép được và mỗi cặp 1 số; thêm 1 số nữa là chắc chắn.', 3),
    L('comb', 'worstDiff', 'Trường hợp xấu nhất: hiệu hai số',
      'Chia các số thành các dãy cách nhau d. Mỗi dãy L số chọn xen kẽ được nhiều nhất ⌈L : 2⌉ số. Cộng lại rồi thêm 1.', 4),
    L('comb', 'worstProduct', 'Trường hợp xấu nhất: tích chia hết',
      'Phân loại các số theo việc chia hết cho 2, 3, 5… Xấu nhất: chọn nhiều số nhất mà tích hai số bất kỳ không chia hết; thêm 1 số nữa là chắc chắn.', 4),
  ];

  /** Các chuyên đề phù hợp với lớp g, theo thứ tự lộ trình. */
  const lessonsFor = (g) => LESSONS.filter((l) => g >= l.min && g <= l.max);

  /** Các dạng toán được dùng trong đề thi của lớp g, theo chủ đề. */
  function allowedFor(g) {
    const out = {};
    for (const l of lessonsFor(g)) (out[l.topic] = out[l.topic] || []).push(l.gen);
    return out;
  }

  /**
   * Khung đề mô phỏng Vòng Quốc gia (theo cấu trúc các đề thi thử khối 3):
   * 25 vị trí, mỗi vị trí là các dạng toán có thể ra ở câu đó.
   * Khối 1–5 Logic · 6–10 Số học · 11–15 Lý thuyết số · 16–20 Hình học · 21–25 Tổ hợp.
   */
  const VQG_BLUEPRINT = [
    ['letterPattern'], ['calendarSpan', 'weekdayShift'], ['groupShapes', 'repeatPattern'], ['workRest', 'numberTriangle'], ['numberTriangle', 'figurePattern'],
    ['addTricks'], ['divTricks'], ['fillMixed'], ['mulTricks'], ['divTricks'],
    ['newOperation'], ['divisibleSearch'], ['cryptarithm'], ['nthTerm'], ['sumDiff'],
    ['cubeViews'], ['solidsSum', 'solidsCount'], ['rectOptimize', 'compositePerimeter', 'cutShapes'], ['irregularGrid', 'countShapes'], ['starShapes'],
    ['formNumbersRep'], ['giveTake', 'takeTwo'], ['gridPathsBlocked', 'gridPaths'], ['money'], ['worstSum', 'worstProduct', 'worstColors'],
  ];

  const api = { LESSONS, lessonsFor, allowedFor, VQG_BLUEPRINT };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TimoCurriculum = api;
})(typeof window !== 'undefined' ? window : globalThis);

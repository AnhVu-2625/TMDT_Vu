# TODO

## Bước 1: Tìm lỗi build/logic trong các phần chính
- [x] Scan backend/src + frontend/src để phát hiện các đoạn lỗi rõ ràng (merge conflict markers, câu query sai cú pháp, v.v.)

## Bước 2: Sửa lỗi backend - dispute resolution
- [x] Sửa câu SQL trong `backend/src/routes/dispute.js` (lỗi cú pháp do dòng SET bị lệch indent/giá trị thay nhầm)
- [ ] Chạy lại lint/test (nếu có script) để xác nhận không còn lỗi compile/logic

## Bước 3: Sửa lỗi frontend - admin disputes page
- [ ] File `frontend/src/pages/admin/Disputes.jsx` đang còn marker merge conflict (`<<<<<<< HEAD`, `>>>>>>> ...`) => cần resolve để build chạy

## Bước 4: Xác nhận toàn dự án chạy
- [ ] Chạy `npm test`/`npm run lint`/build cho backend và frontend (nếu có script)
- [ ] Nếu có lỗi runtime: kiểm tra endpoint liên quan (disputes) và fix dần


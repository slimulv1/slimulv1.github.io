/**
 * ViewTransitionStyles — CSS cho View Transitions API khi đổi theme
 * (ngày ⇄ đêm trại). Mở ra theo hình tròn lan từ nút toggle (vị trí click
 * được ghi vào --vt-x/--vt-y bởi theme-toggle-button trước startViewTransition).
 *
 * - ::view-transition-old(root): giữ nguyên (không fade) → bối cảnh cũ nằm
 *   dưới cho đến khi bối cảnh mới phủ lên.
 * - ::view-transition-new(root): bắt đầu là 1 chấm tròn tại nút bấm, lớn dần
 *   phủ kín trang (vt-grow) — như "mặt trời mọc" khi sáng, "trăng lên" khi tối.
 * - prefers-reduced-motion: view transition bị tắt hoàn toàn (JS cũng đã
 *   fallback về toggle trực tiếp) → trang chỉ đổi theme tức thì.
 *
 * Để dưới dạng <style> thuần thay vì CSS-in-JS vì selector parameter kiểu
 * `::view-transition-new(root)` và keyframes dễ bị emotion xử lý sai.
 */
const ViewTransitionStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `@media (prefers-reduced-motion: no-preference){
::view-transition-old(root){animation:none}
::view-transition-new(root){clip-path:circle(0 at var(--vt-x,50vw) var(--vt-y,40vh));animation:vt-grow .55s cubic-bezier(.4,0,.2,1) forwards}
@keyframes vt-grow{to{clip-path:circle(141% at var(--vt-x,50vw) var(--vt-y,40vh))}}
}`
    }}
  />
)

export default ViewTransitionStyles
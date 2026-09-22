// Hover "Rin xem chung" — dispatch CustomEvent để CornerRin (góc trang) hiện speech bubble.
// Dùng chung cho Projects, vùng Discord và các link "On the web".
// - rinPeek(text): hiện bubble 「text」 trong 2.5s (CornerRin tự đóng khung 「」).
// - rinClear(): ẩn bubble ngay (rời chuột / vuốt touch).
export const rinPeek = text =>
  window.dispatchEvent(
    new CustomEvent('rin:peek', { detail: String(text || '') })
  )

export const rinClear = () => window.dispatchEvent(new CustomEvent('rin:clear'))

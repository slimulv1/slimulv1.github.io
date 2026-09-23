import Link from 'next/link'
import { Text } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
  font-weight: bold;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  line-height: 20px;
  /* Vùng chạm ≥44px (WCAG 2.5.8): padding 12px + line 20px = 44px.
     margin-top/bottom -6px HOÀN LẠI đúng phần padding → navbar giữ nguyên
     chiều cao cũ (không đẩy layout, không ảnh hưởng bất biến en≡ja). */
  padding: 12px 10px;
  margin: -6px 0;
  transition: background-color 0.2s, border-radius 0.2s;

  > img {
    transition: transform 200ms ease;
  }

  &:hover > img {
    transform: rotate(20deg);
  }

  /* Mobile: logo gọn lại để navbar độc 1 hàng */
  @media (max-width: 479px) {
    font-size: 15px;
    padding: 12px 8px;
  }
`

const Logo = () => {
  return (
    <Link href="/" scroll={false}>
      <LogoBox>
        {/* Logo paw thay cho icon bàn chân cũ — ảnh PNG nền trong suốt,
            hoạt động tốt trên cả theme sáng lẫn tối */}
        {/* width/height GỐC (128×128) chính là thuộc tính HTML width/height
            → trình duyệt reserve đúng khung trước khi ảnh tải xong (chống CLS).
            Không dùng Box/width= vì Chakra nuốt thành CSS, không sinh attribute.
            CSS width/height 24px vẫn quyết định kích thước hiển thị. */}
        <img
          src="/images/logo.png"
          alt=""
          width="128"
          height="128"
          aria-hidden="true"
          style={{ width: 24, height: 24, borderRadius: 7, objectFit: 'cover' }}
        />
        <Text
          color="camp.text"
          fontFamily="'Nunito', 'Kosugi Maru', sans-serif"
          fontWeight={800}
          ml={3}
        >
          Slimu Neet
        </Text>
      </LogoBox>
    </Link>
  )
}

export default Logo
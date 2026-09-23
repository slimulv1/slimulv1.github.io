import Link from 'next/link'
import { Box, Text } from '@chakra-ui/react'
import styled from '@emotion/styled'

const LogoBox = styled.span`
  font-weight: bold;
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  height: 30px;
  line-height: 20px;
  padding: 8px 10px;

  > img {
    transition: 200ms ease;
  }

  &:hover > img {
    transform: rotate(20deg);
  }

  /* Mobile: logo gọn lại để navbar độc 1 hàng */
  @media (max-width: 479px) {
    font-size: 15px;
    padding: 6px 8px;
  }
`

const Logo = () => {
  return (
    <Link href="/" scroll={false}>
      <LogoBox>
        {/* Logo paw thay cho icon bàn chân cũ — ảnh PNG nền trong suốt,
            hoạt động tốt trên cả theme sáng lẫn tối */}
        <Box
          as="img"
          src="/images/logo.png"
          alt=""
          w="24px"
          h="24px"
          borderRadius="7px"
          objectFit="cover"
          aria-hidden="true"
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
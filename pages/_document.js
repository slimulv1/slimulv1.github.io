import { ColorModeScript } from '@chakra-ui/react'
import NextDocument, { Html, Head, Main, NextScript } from 'next/document'
import theme from '../lib/theme'

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin="true"
          />
          {/* Zen Maru Gothic: font Nhật kiểu maru (bo tròn), rất mềm — dùng cho heading
              + toàn bộ body text (cả Latin lẫn kana/kanji), đồng bộ tiếng Anh và Nhật.
              Load 300;400;500;700 để body (regular/medium/semibold) không bị synthesised. */}
          <link
            href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@300;400;500;700&display=swap"
            rel="stylesheet"
          />
          {/* Màu thanh trình duyệt mobile theo đúng theme (light cream / dark navy) */}
          <meta
            name="theme-color"
            media="(prefers-color-scheme: light)"
            content="#f0e7db"
          />
          <meta
            name="theme-color"
            media="(prefers-color-scheme: dark)"
            content="#1a1b26"
          />
        </Head>
        <body>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

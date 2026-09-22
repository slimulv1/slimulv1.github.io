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
          {/* M PLUS Rounded 1c: font Nhật tròn — heading + fallback cho chữ Nhật trong body/mono.
              Load đủ 300;400;500;700 để body (regular/medium/semibold) không bị synthesised. */}
          <link
            href="https://fonts.googleapis.com/css2?family=M+PLUS+Rounded+1c:wght@300;400;500;700&display=swap"
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

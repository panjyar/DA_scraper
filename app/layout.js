import './globals.css'

export const metadata = {
  title: 'Shoalhaven DA Records Viewer',
  description: 'Development Application Records for Shoalhaven City Council',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
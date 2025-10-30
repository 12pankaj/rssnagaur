import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Layout from "@/components/Layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Add your metadata with base64 icon
// export const metadata: Metadata = {
//   title: "Rashtriya Swayamsevak Sangh - Nagaur Vibhag",
//   description:
//     "A digital user management system for Rashtriya Swayamsevak Sangh (RSS) Nagaur Vibhag.",
//   icons: {
//     icon: [
//       {
//         url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA3lBMVEVHcEz/+vj87OD98u378/L59O759PL69PP69PH79vX68/H69/b59fP69PP69PP69/X68/L68/H549Lx58X45dH62c759vH79vf6+Pbu2Zj3iWv6elv5bEX2ppH48en6+/v69/X8OgD+QAD4RQX3fVr36dv6+vr3oWL+RQD/RwD50cPyx5D9TBf5XjP4wrL59vDx9Mr6cj78NAD2lFr1TgT43tf3vJn6UyP2kXf4rZru26b6+vny0az3m4D0ck3zponz3qn2aj/6Tivwb0ns4J/1hGv2XDbxckjw7MLm1Xd9UtYqAAAASnRSTlMAAwgNFh0uND9HUFYmZ3F5fWAST2qWoJaPdcvV6tq+v6v////45c/g///l1P76zofP/////q34/fi2+uRctKQ5pLneZpJ8klQ4aeFsYlsAAAG9SURBVHgBdZIDYsVAFEUzsW37266N/W+oL6jbG+fMGWMYhnCCpGiG5XhB4HmOpUWSwBHC2iCCFBlOkGRFVRVZ0niWpnTAHSQNgzcty7IhjqvKAge0hzjl+X4QhmEUJ3Gc2q6iAe1VgjbDLM/zrCiruq6T1FE1FtrtICsP8uFoVAyzcjweV0Blnukr1nllMgUIyafT6aycp4tGbSGpLZarbNRlOMzX6whUaLWFkrPcrN9hnhfr7U4RmE+4BwhklGeH8lgewpP5CeOzpkegrY776ryah9vg4gsc5Y2aldX5+Xmd7E6Xnkj0HUqrA6hgTsvjuK7jdixENxTVge42EPqazcbJ51BgEiQVugtgOCyGw2y2c1uxgzQv2Zv14XCYAgbqK8LH9OEiyy02wWk+j2COR9O8uOQosp94BMtpTuSF69g737+8DPPi6prs1xrBRmBvOA1WGyIJF7dZdnd7r3cUJ3TqodkmEI5lxOvH29unq9tn1Ko4jh5oiqYZhqZFaK75gV8/6liHMe8FJ9vA7sHfN1d/YRcGhuM4AED9zvvELx74XeATzuZ4NykP+xL03dQ9vC/+h4m/6v+bAH+bbybcNyAKK/kZAAAAAElFTkSuQmCC",
//         type: "image/png",
//       },
//     ],
//   },
//   openGraph: {
//     title: "Rashtriya Swayamsevak Sangh - Nagaur Vibhag",
//     description:
//       "A digital platform for managing Swayamsevaks and activities in RSS Nagaur Vibhag.",
//     images: [
//       {
//         url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAA3lBMVEVHcEz/+vj87OD98u378/L59O759PL69PP69PH79vX68/H69/b59fP69PP69PP69/X68/L68/H549Lx58X45dH62c759vH79vf6+Pbu2Zj3iWv6elv5bEX2ppH48en6+/v69/X8OgD+QAD4RQX3fVr36dv6+vr3oWL+RQD/RwD50cPyx5D9TBf5XjP4wrL59vDx9Mr6cj78NAD2lFr1TgT43tf3vJn6UyP2kXf4rZru26b6+vny0az3m4D0ck3zponz3qn2aj/6Tivwb0ns4J/1hGv2XDbxckjw7MLm1Xd9UtYqAAAASnRSTlMAAwgNFh0uND9HUFYmZ3F5fWAST2qWoJaPdcvV6tq+v6v////45c/g///l1P76zofP/////q34/fi2+uRctKQ5pLneZpJ8klQ4aeFsYlsAAAG9SURBVHgBdZIDYsVAFEUzsW37266N/W+oL6jbG+fMGWMYhnCCpGiG5XhB4HmOpUWSwBHC2iCCFBlOkGRFVRVZ0niWpnTAHSQNgzcty7IhjqvKAge0hzjl+X4QhmEUJ3Gc2q6iAe1VgjbDLM/zrCiruq6T1FE1FtrtICsP8uFoVAyzcjweV0Blnukr1nllMgUIyafT6aycp4tGbSGpLZarbNRlOMzX6whUaLWFkrPcrN9hnhfr7U4RmE+4BwhklGeH8lgewpP5CeOzpkegrY776ryah9vg4gsc5Y2aldX5+Xmd7E6Xnkj0HUqrA6hgTsvjuK7jdixENxTVge42EPqazcbJ51BgEiQVugtgOCyGw2y2c1uxgzQv2Zv14XCYAgbqK8LH9OEiyy02wWk+j2COR9O8uOQosp94BMtpTuSF69g737+8DPPi6prs1xrBRmBvOA1WGyIJF7dZdnd7r3cUJ3TqodkmEI5lxOvH29unq9tn1Ko4jh5oiqYZhqZFaK75gV8/6liHMe8FJ9vA7sHfN1d/YRcGhuM4AED9zvvELx74XeATzuZ4NykP+xL03dQ9vC/+h4m/6v+bAH+bbybcNyAKK/kZAAAAAElFTkSuQmCC",
//         width: 400,
//         height: 400,
//         alt: "RSS Nagaur Logo",
//       },
//     ],
//   },
// };
export const metadata: Metadata = {
  title: "Rashtriya Swayamsevak Sangh - Nagaur Vibhag",
  description:
    "A digital user management system for Rashtriya Swayamsevak Sangh (RSS) Nagaur Vibhag.",
  icons: {
    icon: [
      {
        url: "/rsslogo.jpeg",
        type: "image/jpeg",
      },
    ],
  },
  openGraph: {
    title: "Rashtriya Swayamsevak Sangh - Nagaur Vibhag",
    description:
      "A digital platform for managing Swayamsevaks and activities in RSS Nagaur Vibhag.",
    images: [
      {
        url: "/rsslogo.jpeg",
        width: 400,
        height: 400,
        alt: "RSS Nagaur Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Layout>{children}</Layout>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}

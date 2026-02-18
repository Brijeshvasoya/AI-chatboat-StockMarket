import "@/styles/globals.css";
import { ChatProvider } from "@/context/ChatContext";

export default function App({ Component, pageProps }) {
  return (
    <ChatProvider>
      <Component {...pageProps} />
    </ChatProvider>
  );
}
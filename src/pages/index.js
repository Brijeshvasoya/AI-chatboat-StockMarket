import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import StarBackground from "@/components/chat/StarBackground";
import { useChat } from "@/context/ChatContext";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { authReady, user, setUser, loadUserHistory } = useChat();
  const router = useRouter();
  
  console.log("🚀 ~ Home ~ user:", user)
  useEffect(() => {
    if (!authReady) return;
    if (user) {
      router.push("/chat");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user]);

  const generateRandomId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (isLogin) {
      const users = JSON.parse(localStorage.getItem("users-list") || "[]");
      const user = users.find(
        (u) => u.email === email && u.password === password,
      );
      if (user) {
        const userData = {
          email: user.email,
          name: user.name,
          id: user.id,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        loadUserHistory(userData);
        router.push("/chat");
      } else {
        setError("Invalid email or password");
      }
    } else {
      const users = JSON.parse(localStorage.getItem("users-list") || "[]");
      if (users.find((u) => u.email === email)) {
        setError("Email already exists");
      } else {
        const newUser = { name, email, password, id: generateRandomId() };
        users.push(newUser);
        localStorage.setItem("users-list", JSON.stringify(users));
        setIsLogin(true);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      <StarBackground />
      <div className="relative flex flex-col z-10 min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <h1
            className="text-3xl font-bold text-transparent bg-clip-text mb-4"
            style={{
              backgroundImage: "linear-gradient(to right, #0ea5e9, #10b981)",
              backgroundSize: "200% 100%",
              backgroundPosition: "200% 0",
              animation: "gradientFill 3s ease-in-out infinite",
            }}
          >
            AI Assistant
          </h1>
          <h2 className="text-xl font-semibold text-transparent bg-clip-text mb-2" style={{
            backgroundImage: "linear-gradient(to right, #f472, #10b981)",
            backgroundSize: "200% 100%",
            backgroundPosition: "200% 0",
            animation: "gradientFill 3s ease-in-out infinite",
          }}>
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-400 pb-4">
            {isLogin
              ? "Sign in to continue to AI Assistant"
              : "Sign up to get started with AI Assistant"}
          </p>
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition placeholder-gray-400"
                  placeholder="Enter your password"
                  minLength="6"
                />
              </div>

              {error && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
              >
                {isLoading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                {isLogin
                  ? "Don't have an account?"
                  : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setName("");
                    setEmail("");
                    setPassword("");
                  }}
                  className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Demo: Create any account or use existing credentials to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

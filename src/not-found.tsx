import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-r from-blue-100 to-purple-100 px-4 py-16">
      <div className="max-w-md w-full space-y-8 text-center bg-white shadow-2xl rounded-xl p-10 border border-gray-200">
        <div className="flex justify-center mb-6">
          <FaExclamationTriangle className="text-6xl text-yellow-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Oops! The page you are looking for seems to have wandered off into the digital wilderness.
        </p>
      </div>
    </div>
  );
}

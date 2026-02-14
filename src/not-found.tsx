import Link from 'next/link';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

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
        <div className="pt-6">
          <Link 
            href="/" 
            className="
              inline-flex 
              items-center 
              px-6 
              py-3 
              border 
              border-transparent 
              text-base 
              font-medium 
              rounded-md 
              shadow-sm 
              text-white 
              bg-blue-600 
              hover:bg-blue-700 
              focus:outline-none 
              focus:ring-2 
              focus:ring-offset-2 
              focus:ring-blue-500
              transition
              transform
              hover:scale-105
            "
          >
            <FaHome className="mr-2" /> Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { testSupabaseConnection, createTestUser, testLogin, checkUserExists } from "@/utils/test-supabase";

export default function DebugPage() {
  useEffect(() => {
    const runTests = async () => {
      console.log("🚀 Bắt đầu kiểm tra Supabase...");
      
      await testSupabaseConnection();
      
      // Check if user exists first
      const userStatus = await checkUserExists('ankun.n.m@gmail.com');
      console.log('👤 Trạng thái user:', userStatus);
      
      // If user doesn't exist, create it
      if (!userStatus.exists) {
        console.log('📝 User không tồn tại, đang tạo mới...');
        await createTestUser();
      }
      
      await testLogin();
    };
    
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">Supabase Debug Page</h1>
      <p className="text-gray-400">Kiểm tra console để xem thông tin debug</p>
      
      <div className="mt-8 space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables:</h2>
          <pre className="text-sm">
            {JSON.stringify({
              NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
              NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
            }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Test Credentials:</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> ankun.n.m@gmail.com</p>
            <p><strong>Password:</strong> @iamAnKun123!</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Test Process:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>� Kiểm tra user tồn tại</li>
            <li>👤 Tạo user mới (nếu cần)</li>
            <li>🔐 Test login</li>
            <li>📊 Kiểm tra tất cả responses trong console</li>
          </ol>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-300">
            <li>Mở developer tools (F12)</li>
            <li>Vào tab Console</li>
            <li>Tìm Supabase debug messages</li>
            <li>Kiểm tra errors hoặc warnings</li>
            <li>Thử login với test credentials</li>
            <li>Nếu login thất bại, kiểm tra console để xem chi tiết</li>
          </ol>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Test Login:</h2>
          <a 
            href="/auth/login" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Go to Login Page
          </a>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Common Issues:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li><strong>Invalid login credentials:</strong> User không tồn tại hoặc sai password</li>
            <li><strong>Email not confirmed:</strong> Kiểm tra email inbox</li>
            <li><strong>400 Bad Request:</strong> Kiểm tra Supabase project settings</li>
            <li><strong>Network error:</strong> Kiểm tra internet connection</li>
            <li><strong>Admin permissions:</strong> Cần admin rights để xóa users</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Test script để kiểm tra UserProfileButton
console.log('🧪 Testing UserProfileButton visibility...');

// Kiểm tra xem có lỗi import không
try {
  const UserProfileButton = require('../src/components/auth/UserProfileButton.tsx');
  console.log('✅ UserProfileButton import successful');
} catch (error) {
  console.error('❌ UserProfileButton import error:', error);
}

// Kiểm tra xem có trong TopNavbar không
try {
  const fs = require('fs');
  const topNavbarContent = fs.readFileSync('../src/components/ui/layout/TopNavbar.tsx', 'utf8');
  
  if (topNavbarContent.includes('UserProfileButton')) {
    console.log('✅ UserProfileButton found in TopNavbar');
  } else {
    console.log('❌ UserProfileButton NOT found in TopNavbar');
  }
  
  if (topNavbarContent.includes('import { UserProfileButton }')) {
    console.log('✅ UserProfileButton import statement found');
  } else {
    console.log('❌ UserProfileButton import statement NOT found');
  }
} catch (error) {
  console.error('❌ Error reading TopNavbar:', error);
}

console.log('🔍 Test completed. Check browser console for runtime logs.');

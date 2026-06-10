import React from 'react';

export default function Test() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>测试页面</h1>
      <p>如果你能看到这个页面，说明 umi 配置正确</p>
      <p>当前时间: {new Date().toLocaleString()}</p>
    </div>
  );
}

const TestPage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', color: 'black' }}>
      <h1>Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px' }}>
        <h2>System Check:</h2>
        <ul>
          <li>✅ React rendering works</li>
          <li>✅ Basic styling works</li>
          <li>✅ Component loading works</li>
        </ul>
      </div>
    </div>
  );
};

export default TestPage;
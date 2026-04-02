import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// AI test
app.get('/api/ai/test', (req, res) => {
  res.json({ message: 'AI routes are working!' });
});

// Properties endpoint
app.get('/api/properties', (req, res) => {
  res.json({ success: true, data: [] });
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@berenda.com' && password === 'Admin123!') {
    res.json({
      success: true,
      data: {
        token: 'test-token-123',
        user: { id: '1', email, fullName: 'Super Admin', roles: [{ name: 'ADMIN' }] }
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;

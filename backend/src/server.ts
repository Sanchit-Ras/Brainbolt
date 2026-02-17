import express from 'express';
import cors from 'cors';
import routes from './routes';

import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// Rate Limiting: 50 requests per minute per IP
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(cors());
app.use(express.json());

// Apply rate limiting specifically to the answer endpoint
app.use('/v1/quiz/answer', limiter);

app.use('/v1', routes);

app.get('/', (req, res) => {
    res.send('Brainbolt Backend Running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

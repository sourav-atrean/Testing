import express from 'express';
import pg from 'pg';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const { Pool } = pg;

// Middleware
app.use(express.json());

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DATABASE_USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    port: process.env.DATABASE_PORT || 5432,
});

// Claude client initialization
const anthropic = new Anthropic({
    apiKey: process.env.CLAUDE_API_KEY,
});

// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        client.release();
        res.json({ success: true, timestamp: result.rows[0].now });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Query data and process with Claude
app.post('/api/query', async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ success: false, error: 'Query is required' });
    }

    try {
        // Execute PostgreSQL query
        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        // Process with Claude
        const message = await anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [
                {
                    role: "user",
                    content: `Analyze this data from PostgreSQL: ${JSON.stringify(result.rows)}`
                }
            ]
        });

        res.json({
            success: true,
            data: result.rows,
            analysis: message.content
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
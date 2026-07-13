import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  user: process.env.DB_USER || process.env.POSTGRES_USER || 'yeryesil_admin',
  password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  host: process.env.DB_HOST || 'postgres-db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || process.env.POSTGRES_DB || 'vocabase_db',
})

pool.on('error', (err) => {
  console.error('PostgreSQL havuz (pool) hatası:', err.message)
})

export async function initDb() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        exam_goal VARCHAR(255),
        xp INTEGER DEFAULT 0,
        streak_days INTEGER DEFAULT 0,
        last_active_date VARCHAR(50),
        daily_goal INTEGER DEFAULT 15,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sections (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT '#6366f1',
        icon VARCHAR(50) DEFAULT '📚',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS words (
        id SERIAL PRIMARY KEY,
        section_id INTEGER NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        english VARCHAR(255) NOT NULL,
        turkish VARCHAR(255) NOT NULL,
        example TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        mastery_level INTEGER DEFAULT 0,
        last_quizzed TIMESTAMPTZ,
        word_type VARCHAR(50) DEFAULT 'Genel',
        synonyms TEXT DEFAULT '',
        antonyms TEXT DEFAULT '',
        difficulty INTEGER DEFAULT 2,
        is_favorite INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        next_review_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sections_user ON sections(user_id);
      CREATE INDEX IF NOT EXISTS idx_words_section ON words(section_id);
      CREATE INDEX IF NOT EXISTS idx_words_user ON words(user_id);
    `)

    // Safe column migration checks for existing tables
    const migrations = [
      ['users', 'xp', 'INTEGER DEFAULT 0'],
      ['users', 'streak_days', 'INTEGER DEFAULT 0'],
      ['users', 'last_active_date', 'VARCHAR(50)'],
      ['users', 'daily_goal', 'INTEGER DEFAULT 15'],
      ['words', 'word_type', "VARCHAR(50) DEFAULT 'Genel'"],
      ['words', 'synonyms', "TEXT DEFAULT ''"],
      ['words', 'antonyms', "TEXT DEFAULT ''"],
      ['words', 'difficulty', 'INTEGER DEFAULT 2'],
      ['words', 'is_favorite', 'INTEGER DEFAULT 0'],
      ['words', 'correct_count', 'INTEGER DEFAULT 0'],
      ['words', 'wrong_count', 'INTEGER DEFAULT 0'],
      ['words', 'next_review_at', 'TIMESTAMPTZ'],
    ]

    for (const [table, col, def] of migrations) {
      try {
        await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${def};`)
      } catch (e) {
        // Kolon zaten varsa veya hata olursa yok say
      }
    }
    console.log('✅ PostgreSQL veritabanı ve tabloları başarıyla hazırlandı!')
  } finally {
    client.release()
  }
}

export const query = (text, params) => pool.query(text, params)
export const getClient = () => pool.connect()

export default {
  query,
  getClient,
  initDb,
}

-- BWES database infrastructure foundation.
--
-- Domain tables are intentionally deferred.
-- These PostgreSQL extensions support later semantic and full-text
-- retrieval capabilities.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

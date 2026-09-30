SELECT 'CREATE DATABASE bwes_directus OWNER bwes'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'bwes_directus'
)\gexec

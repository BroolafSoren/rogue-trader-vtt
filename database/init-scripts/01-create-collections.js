db = db.getSiblingDB('roguetrader');

db.createCollection('characters');

// Create indexes for common queries
db.characters.createIndex({ "Name": 1 });
db.characters.createIndex({ "Career": 1 });
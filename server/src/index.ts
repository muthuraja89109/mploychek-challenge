import mongoose from 'mongoose';
import { app } from './app';
import { config } from './config';
import { seedIfEmpty } from './seed';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('Connected to MongoDB');
  await seedIfEmpty(); // demo data on first run
  app.listen(config.port, () => console.log(`API ready at http://localhost:${config.port}/api`));
}

main().catch((err) => {
  console.error('Could not start the server:', err.message);
  process.exit(1);
});

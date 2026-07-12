# AssetFlow API

An enterprise-grade asset management, allocation, booking, and maintenance system.

## Setup Instructions

1. Install Dependencies:
   ```sh
   npm install
   ```

2. Environment Config:
   Copy `.env.example` to `.env` and set your `DATABASE_URL` and `JWT_SECRET`.

3. Database Migrations:
   ```sh
   npx prisma generate
   npx prisma migrate dev
   ```

4. Seed Database (Optional):
   ```sh
   npm run prisma seed
   ```

5. Build & Start:
   ```sh
   npm run build
   npm start
   ```

## Docker Deployment

To spin up the Postgres database and Node server simultaneously:
```sh
docker-compose up --build -d
```

## Modules
- **Authentication**: JWT rotations, refresh tokens, role validations.
- **Organization**: Departments, Users, Asset Categories, and physical Assets.
- **Allocation**: Transferring assets between employees natively.
- **Booking**: Calendar integration to book assets (e.g. Projectors, Vehicles) cleanly.
- **Maintenance**: Lifecycle tracking for broken hardware requiring technical repair.
- **Reporting**: Cross-module analytics and raw activity feeds.

## Documentation
- Import `AssetFlow.postman_collection.json` into Postman.
- View `swagger.yml` in Swagger UI.

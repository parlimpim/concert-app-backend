# NestJS Concert Reservation App

- The concert reservation application allow user to reserve the concert.
- This application also features a web interface. For an enhanced experience, visit [concert-app-frontend](https://github.com/parlimpim/concert-app-frontend) and use it alongside the app.
#### Remarks: Ensure that port 8080 and 5432 are avaliabled


## Getting started

### Installation

Clone the repository

```
git clone https://github.com/parlimpim/concert-app-backend.git
```

Install all the dependencies

```
cd concert-app-backend
npm install
```

After the dependencies are installed, configure the project by creating a new .env file containing the environment variables.

```
cp .env.example .env
```

### Running the app
```bash
# run the PostgreSQL container
$ docker compose up -d

# start application
npm run start

# start application in watch mode
npm run start:dev
```

See API swagger docs by browsing to [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

### Test

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov
```

### Future Enhancements
- User Module
  - Delete
  - Update user
  - List all users
- Unit tests to cover more use cases
- Seeding data
- Exception filter

### Bonus task answer
For detailed answers to the questions are refer to the following documents:

- [Optimization Strategies](./docs/question1.md)
- [Handling Concurrent Reservations](./docs/question2.md)

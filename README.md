lambda-proxy integration to hide error details

[ ] user has many photos
  [ ] Photo
    id
    user_id
    url (could be s3 or some other site)
    timestamp

Install
-----

Run migration
    npm run knex migrate:latest

Usage
-----


Development
    npm start

Production
    NODE_ENV=production npm start

Deploy
-----

    up deploy production

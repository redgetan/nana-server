module.exports = {
  development: {
    INSTAGRAM_CLIENT_ID: process.env.NANA_INSTAGRAM_CLIENT_ID,
    INSTAGRAM_CLIENT_SECRET: process.env.NANA_INSTAGRAM_CLIENT_SECRET,
    INSTAGRAM_REDIRECT_URI: "http://dev.nanapx.com:3000/login/callback",
    INSTAGRAM_SUCCESSFUL_REDIRECT_URI: "http://dev.nanapx.com:8080/post_oauth",
    INSTAGRAM_INITIAL_CONNECT_REDIRECT_URI: "http://dev.nanapx.com:8080/post_oauth?initial_connect=true",
    ORIGIN: 'http://dev.nanapx.com:8080',

    FACEBOOK_ACCOUNT_KIT_SECRET: process.env.NANA_ACCOUNT_KIT_SECRET,
    FACEBOOK_ACCOUNT_KIT_APP_ID: '813391282196047',

    MAILGUN_API_KEY: process.env.NANA_MAILGUN_API_KEY,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    
    STRIPE_SECRET_KEY: process.env.NANA_STRIPE_SECRET_KEY,

    AWS_S3_BUCKET: "nanapx-photos-development",
    AWS_CDN_URL: "https://nanapx-photos-development.s3.us-west-2.amazonaws.com",

    SENTRY_URL: ""
  },
  staging: {
    INSTAGRAM_CLIENT_ID: process.env.NANA_INSTAGRAM_CLIENT_ID,
    INSTAGRAM_CLIENT_SECRET: process.env.NANA_INSTAGRAM_CLIENT_SECRET,
    INSTAGRAM_REDIRECT_URI: "http://dev.nanapx.com:3000/login/callback",
    INSTAGRAM_SUCCESSFUL_REDIRECT_URI: "http://dev.nanapx.com:8080/post_oauth",
    INSTAGRAM_INITIAL_CONNECT_REDIRECT_URI: "http://dev.nanapx.com:8080/post_oauth?initial_connect=true",
    ORIGIN: 'http://dev.nanapx.com:8080',

    FACEBOOK_ACCOUNT_KIT_SECRET: process.env.NANA_ACCOUNT_KIT_SECRET,
    FACEBOOK_ACCOUNT_KIT_APP_ID: '813391282196047',

    MAILGUN_API_KEY: process.env.NANA_MAILGUN_API_KEY,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    
    STRIPE_SECRET_KEY: process.env.NANA_STRIPE_SECRET_KEY,

    AWS_S3_BUCKET: "nanapx-photos-production",
    AWS_CDN_URL: "https://drpo1ytqp8fll.cloudfront.net",

    SENTRY_URL: ""
  },
  production: {
    INSTAGRAM_CLIENT_ID: process.env.NANA_INSTAGRAM_CLIENT_ID,
    INSTAGRAM_CLIENT_SECRET: process.env.NANA_INSTAGRAM_CLIENT_SECRET,
    INSTAGRAM_REDIRECT_URI: "https://5jbouftijk.execute-api.us-west-2.amazonaws.com/production/login/callback",
    INSTAGRAM_SUCCESSFUL_REDIRECT_URI: "https://www.nanapx.com/post_oauth",
    INSTAGRAM_INITIAL_CONNECT_REDIRECT_URI: "https://www.nanapx.com/post_oauth?initial_connect=true",
    ORIGIN: 'https://www.nanapx.com',

    FACEBOOK_ACCOUNT_KIT_SECRET: process.env.NANA_ACCOUNT_KIT_SECRET,
    FACEBOOK_ACCOUNT_KIT_APP_ID: '813391282196047',

    MAILGUN_API_KEY: process.env.NANA_MAILGUN_API_KEY,

    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,

    STRIPE_SECRET_KEY: process.env.NANA_STRIPE_SECRET_KEY,

    AWS_S3_BUCKET: "nanapx-photos-production",
    AWS_CDN_URL: "https://drpo1ytqp8fll.cloudfront.net",

    SENTRY_URL: process.env.NANA_SENTRY_URL
  }
}

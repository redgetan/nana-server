const Raven = require('raven');
const LOG = require('./logger');
const Config = require("./../config/config")[env];

module.exports = {
    init() {
        Raven.config(Config.SENTRY_URL).install();
        this.initialized = true;
    },
    captureException(e) {
        LOG.error(e);

        if (process.env.NODE_ENV === "production") {
            if (!this.initialized) this.init();

            Raven.captureException(e);
        }
    }
};

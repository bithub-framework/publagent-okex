const { basename } = require('path');

module.exports = {
    apps: [{
        name: basename(__dirname),
        script: './dist/main.js',
        cwd: __dirname,
        wait_ready: true,
        listen_timeout: 10000,
        kill_timeout: 15000, // 随便设个比两个环境变量之和大的数
        env: {
            NODE_ENV: 'production',
            STOP_TIMEOUT: 10000,
            EXIT_TIMEOUT: 3000,
        },
    }],
};
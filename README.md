# sampleNodeApp

To run the app: 

1. Download redis package: https://github.com/dmajkic/redis/downloads -> eg. on Win64, click the first link to download.
2. Run redis: double click redis-server from the downloaded zip file.
3. Set up application ikey: in app.js file, change "YOUR_IKEY" to your ikey.
4. Under root folder of sampleNodeApp, run npm run start.
5. Go to browser, open up http://localhost:3000/repos/xiao-lix. update "xiao-lix" to any github user name you want to check the repo count. This is making a request to github api: `https://api.github.com/users/${username}` to get the repos. And also it uses redis cache. Try refreshing the browser and check the Finish time on Network tab. Finish time is reducing from 300+ ms to 1-2 ms (using redis cache).
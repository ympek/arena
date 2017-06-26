# arena
In-browser MOBA-like game

# building client
for now: no minification, I simply concatenate all files. Just run:
```sh
npm run concat
```
In client/ folder. (You need npm, obviously). It creates file all.js which index.html needs. File watcher & uglify coming soon.
# building server
Gradle handles this. `gradle build` to build, `gradle fatJar` to create jar.
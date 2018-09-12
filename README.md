# arena
In-browser MOBA-like game
Unplayable - early stage of development.

# building

From root directory of project, run:

```sh
./build.sh
```

Which should do all the work. Details below:

Server building is handled by Gradle. `gradle build` to build, `gradle fatJar` to create jar.

To be able to build client you need node & npm installed. Once you get them, run `npm install` in client directory and you should be all set. There are commands defined as npm scripts in package.json. Use `npm run build_debug` or `npm run build_release` (the second one outputs minified javascript, so it's actually less useful while developing).

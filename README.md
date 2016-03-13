# WUSB-Website
This is the source for the WUSB main website at wusb.fm. 

##Team:
Manager: Peter Jasko 

Frontend: Ken Fehling

Frontend: Philippe Kimura-Thollander

Backend: Peter Geiss

#Running the Server in development

1. Fork the respository, then <code>git clone</code> your fork onto your computer. <code>cd</code> into it.
2. <code>npm install</code> (if you add an npm module, be sure to add it to <i>package.json</i> so npm responds to it)
3. If MongoDB isn't running, start it with <code>sudo mongod</code>
4. <code>npm start</code> and you're ready to go.

Want to run the tests? Perform these steps and <code>npm install -g mocha</code>, then run `mocha` while `mongod` is running.

#Running the Server in production

1. Fork the respository, then <code>git clone</code> your fork onto your computer. <code>cd</code> into it.
2. <code>npm install</code> (if you add an npm module, be sure to add it to <i>package.json</i> so npm responds to it)
3. <code>touch .env</code> and add <code>COOKIE_SECRET=<i>some long string here</i></code> (no spaces, keystone might be able to automatically generate it for you) to the file.
4. <code>touch database.js</code> and add <code>exports.uri = 'your MongoDB URI here';</code>
5. <code>export NODE_ENV='production'; npm start</code> and you're ready to go.

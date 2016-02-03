# WUSB-Website
This is the source for the WUSB main website at wusb.fm. 

##Team:
Manager: Peter Jasko 

Frontend: Ken Fehling

Frontend: Philippe Kimura-Thollander

Backend: Peter Geiss

#Running the Server

1. Fork the respository, then <code>git clone</code> your fork onto your computer. <code>cd</code> into it.
2. <code>npm install</code> (if you add an npm module, be sure to add it to <i>package.json</i> so npm responds to it)
3. <code>touch .env</code> and add <code>COOKIE_SECRET=<i>some long string here</i></code> (no spaces, keystone might be able to automatically generate it for you) to the file.
4. <code>node server.js</code> with your MongoDB instance running (<i>soon we'll have a centralized server and you won't have to run your own MongoDB</i>)

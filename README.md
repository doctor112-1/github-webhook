# github-webhook

super simple github webhook listener with secrets

## Running

to run first make a .env with these contents

```
SECRET="secrethere"
PORT="portnumberhere"
```

then run `pnpm i` to install dependencies and `pnpm run start` to start the server

## Changing what runs

to change what runs after the event has been validated go to line 68 in the server.js file and add what you want to run there

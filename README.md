# TideDog
A blockchain service monitoring tool

## Deploy
```shell
git clone https://github.com/XPAEXCHANGE/TideDog
cd TideDog
npm i
bin/start.js -c ./private.config.toml
```

## Register
post /register/account

post /register/event
{
    address,
    logs: [
        { topics, address }
    ],
    signature
}
# Akamai Purge Action
This is a GitHub Action for purging content using the Akamai CCU API.

## Input Params
**Unless marked otherwise you will want to use GitHub Repo secrets to secure the input parameters!**
**All input parameters are required!**

* `hostname` - This is the hostname of the API client.
* `access-token` - This is the access token of the API client
* `client-secret` - This is the client secret of the credentials associated with the API client.
* `client-token` - This is the client token of the credentials associated with the API client.
* `type` - The type of item being cleared. For now the only values supported are:
  * `cpcodes` - Purges one or more cp codes. The `ref` value should be a comma separated string of cp-codes.
* `ref` - The parameter of the purge. See directions for this parameter in the `type` above.

>**_NOTE:_** These instructions assume you understand what the above mean. One additional note, the API client must have permissions to the CCU service, and also have permissions to clear whatever it is you want to clear.

## Development Release instructions:
1. Create a branch
2. Make your changes
3. Before you commit, make sure you run `npm build` to create the dist
3. Create a PR for

## Integration Testing Hints
Sometimes you just need to step through code or see the responses from Akamai. Github Action inputs are just environment variables, but, if the variable name has a dash then life gets complicated. You can use the following to execute a bash shell with all the environment vars setup. This is all one line.

```
env 'INPUT_HOSTNAME=***' env 'INPUT_CLIENT-SECRET=***' env 'INPUT_ACCESS-TOKEN=***' env 'INPUT_CLIENT-TOKEN=***' env 'INPUT_TYPE=cpcodes' 'INPUT_REF=***' bash
```

Then inside the bash shell you can run `src/main.js`.

>**_Note:_** in the above all secrets have been masked.

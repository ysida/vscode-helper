# Blockchain Helper 

** Introduction

This extensions providers autocomple in truffle suite javascript test files. 
It reads solidity contracts, and uses them to provide autocomplete instances.


** Features

The following features are provided: 

- autocomplete contract functions
- autocomplete contract variables 
- provide description of function signature as the user types arguments 


** How to use

1. Abide by truffle suite folder structure.
    - ensure that all solidity contracts are under ./contracts/ folder
    - ensure that tests are under ./test/ folder

2. Use a lowercase name for contract's intance name, matching contract's file basename


for example, if solidity file is Token.sol, the autocompletion is provided for the word **token.** in lowercase.

```js
const Token = artifacts.require("Token.sol");
let token = await token.new();

// token.<autocomplete> // <-- it should match Token.sol contract file basename, with all lowercase

// other examples
// SampleToken.sol -> use sampletoken.
// ERC20.sol       -> erc20.

```




# ZK SNARK Designer
In this project we have create a circuit and implement it on hardhat using circum programming laungauge






## Circuit code
pragma circom 2.0.0;

template Multiplier2 () {  
   //signal input
   signal input a;
   signal input b;
   
  
    signal x;
    signal y;
    

      signal output q;
  
    
     component and = AND();
     component not = NOT();
     component or = OR();

    and.a <== a;
    and.b <== b;
    x <== and.out;

    not.in <== b;
    y <== not.out;

    or.a <== x;
    or.b <== y;
    q <== or.out;

   
   


   
}

## Step to execute program
## Install

npm i
## Compile 
npx hardhat circom This will generate the out file with circuit intermediaries and geneate the MultiplierVerifier.sol contract
## Deploy
npx hardhat run scripts/deploy.ts

## Testing on mumbai network
Change in configure.json file and make sure there is mumbai balance in wallet to verify after setup run the command

npx hardhat run --network localhost scripts/deploy.js

here network name wil be mumbai
## Author
Gauri Kaushal
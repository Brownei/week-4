import { loadStdlib } from "@reach-sh/stdlib";
import * as backend from './build/index.main.mjs';
import { ask, yesno } from '@reach-sh/stdlib/ask.mjs';

const stdlib = loadStdlib(process.env);
const fmt = (x) => stdlib.formatCurrency(x, 4);


const accAlice = await stdlib.newTestAccount(stdlib.parseCurrency(6000));
const accBob = await stdlib.newTestAccount(stdlib.parseCurrency(100));
console.log('Hello Alice and Bob');
console.log('Launching');

const ctcAlice = accAlice.contract(backend);
const ctcBob = accBob.contract(backend, ctcAlice.getInfo())

const getBalance = async (who) => fmt(await stdlib.balanceOf(who));

console.log(`Alice balance is: ${await getBalance(accAlice)}`)
console.log(`Bob balance is: ${await getBalance(accBob)}`)

const Players = () =>({
  seeSwitch: (aliceSwitch) => {
    if(aliceSwitch){
      console.log(`Alice is still alive `)
    }
    else {
      console.log(`Alice is a bot and the countdown is over `)
      console.log('CONGRATULATIONS BOB YOU GOT THE INHERITANCE')
    }
  },
  informTimeout: () => {
    console.log(`${who} observed a timeout`);
  },
});


console.log('Starting backend....');
await Promise.all([
  backend.Alice(ctcAlice, {
    ...stdlib.hasRandom,
    ...Players('Alice'),
    deposit: async () =>{
      const depositAmount = await ask(
        `Alice How much tokens do you want to put in the vault?`, stdlib.parseCurrency
      )
      return depositAmount;
    },
    random: async () =>{
      const rand = Math.floor(Math.random() * 10)
      console.log(rand)
      return rand;
    },
    aliceChoice: async (r) =>{
      const ran = parseInt(r);
      const choice = await ask(`Alice are you still there if yes input the  random number above`, (x => x));
      if(choice == ran){
        console.log('Alice answered correctly');
      }
      else console.log('Alice is put a wrong answer ');
    return choice;
    },
    deadline: async () =>{
      const time = await ask(`Alice set your dead line : `, (x => x));
    return time;
    }

  }),
  backend.Bob(ctcBob, {
    ...stdlib.hasRandom,
    ...Players('Bob'),
    acceptInheritance: async (t) =>{
      const vaultTerms = parseInt(t);
      const terms = await ask(`Bob do you accept the terms of ${fmt(vaultTerms)} and stand a chance of winning ${fmt(vaultTerms)} tokens? : `, yesno);
      if(terms){
        return terms;
      }
      else process.exit();
    }
  })
]);

console.log(`Alice balance is: ${await getBalance(accAlice)}`);
console.log(`Bob balance is: ${await getBalance(accBob)}`);

console.log('GoodBye');
process.exit();
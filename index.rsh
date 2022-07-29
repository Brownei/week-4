"reach 0.1";

const Shared = {
  ...hasRandom,
  seeSwitch: Fun([Bool], Null),
  informTimeout: Fun([], Null)
};

export const main = Reach.App(() => {
  const Alice = Participant('Alice', {
    ...Shared,
    deposit: Fun([], UInt),
    aliceChoice: Fun([UInt], UInt),
    deadline: Fun([], UInt),
    random: Fun([], UInt)
    
  });
  const Bob = Participant('Bob', {
    ...Shared,
    acceptInheritance: Fun([UInt], Bool),
  });
  init();

  const informTimeout = () => {
    each([Alice, Bob], () => {
      interact.informTimeout();
    });
  };

  Alice.only(() => {
    const deposit = declassify(interact.deposit());
    const deadline = declassify(interact.deadline());
 
  })
  Alice.publish(deposit, deadline);
  commit();
  Alice.pay(deposit);
  commit();

  Bob.only(() => {
    const acceptedTerms = declassify(interact.acceptInheritance(deposit));
  })
  Bob.publish(acceptedTerms); 
  const end = lastConsensusTime() + deadline;

  var [state,randi] = [0, 0];
  invariant(balance() == deposit);
  while ( lastConsensusTime() <= end ) {
    commit();
    Alice.only(() => {
      const rand = declassify(interact.random());
    })
    Alice.publish(rand);
    commit();
    Alice.only(() => {
     const aliceState = declassify(interact.aliceChoice(rand));
    });

    Alice.publish(aliceState)
      .timeout(relativeTime(end), () => closeTo(Bob, informTimeout));
    commit();
    Bob.publish();
    [state, randi] = [aliceState, rand];
    continue;
  }
  if (lastConsensusTime() >= end && state==randi){
    transfer(deposit).to(Alice)
    each([Alice, Bob], () => {
      interact.seeSwitch(true);
    });
  }
  else{
    transfer(deposit).to(Bob)
    each([Alice, Bob], () => {
      interact.seeSwitch(false);
    });
  }
  transfer(balance()).to(Alice)
  commit();
});
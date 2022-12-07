'use strict';

const account1 = {
  owner: 'Alica Chen',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2021-11-18T21:31:17.178Z',
    '2021-12-23T07:42:02.383Z',
    '2022-01-28T09:15:04.904Z',
    '2022-04-01T10:17:24.185Z',
    '2022-05-08T14:11:59.604Z',
    '2022-05-27T17:01:17.194Z',
    '2022-10-23T23:36:17.929Z',
    '2022-10-27T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Max Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const account3 = {
  owner: 'Rex Huang',
  movements: [500, 440, -250, -520, -320, -100, 7000, -30],
  interestRate: 2.0,
  pin: 3333,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-07-26T12:01:20.894Z',
  ],
  currency: 'RMB',
  locale: 'zh-CN',
};

const accounts = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatMovementDate = function(date, locale){

  const calcDayPassed = function(date1, date2){
    return Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  }
  const dayPassed = calcDayPassed(new Date(), date);
  console.log(dayPassed);

  let whatDay;

  if (dayPassed === 0) {
    whatDay = 'Today';
  }
  else if (dayPassed === 1) {
    whatDay = 'Yesterday';
  }
  else {
    whatDay = `${dayPassed} days ago`;
  }
  /*
  const day = `${date.getDate()}`.padStart(2, 0); //length 2 and fill 0 if not long enough
  const month = `${date.getMonth() + 1}`.padStart(2, 0); //getMonth from 0-11 so need to +1
  const year = date.getFullYear();
  return `${day}/${month}/${year} / ${whatDay}`;
  */
  return new Intl.DateTimeFormat(locale).format(date) + ' ' + whatDay;
}

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);
    
    const formattedMov = formatCur(mov, acc.locale, acc.currency);
    
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;
//afterbegin
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogOutTimer = function(){
  const tick = function(){
    const min = `${Math.trunc(time / 60)}`.padStart(2,0);
    const sec = `${time % 60}`.padStart(2,0);

    //Int each call, print remaining time to UI
    labelTimer.textContent = `${min}:${sec}`

    // when 0 sec, stop timer and log out 
    if(time === 0){
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started'
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  }
  // Set time to 5 min

  let time = 300;

  //call timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
  
}




///////////////////////////////////////
// Event handlers
let currentAccount, timer;

/*
//fake always login
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 100;
*/



btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Create current date and time
    const now = new Date();
    /*
    //manual setting
    const day = `${now.getDate()}`.padStart(2, 0); //length 2 and fill 0 if not long enough
    const month = `${now.getMonth()}`.padStart(2, 0); //length 2 and fill 0 if not long enough
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0); //length 2 and fill 0 if not long enough
    const min = `${now.getMinutes()}`.padStart(2, 0); //length 2 and fill 0 if not long enough
    labelDate.textContent = `${day}/${month}/${year},${hour}:${min}`;
    */
    //or Internationalizing Date (Intl)
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //or '2-digit'
      year: 'numeric', 
      weekday: 'long', //or 'short', 'narrow'
    };
    const locale = navigator.language; //get user's browser language
    //set time based on user's language
    //labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);
    //ISO Language Code Table - such as 'en-US';
    //labelDate.textContent = new Intl.DateTimeFormat('en-AU', options).format(now);
    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);


    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer 
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function(){
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});


/*
const numTest = 23124213.23;

const options = {
  style: 'currency', //or 'unit' and 'currency'
  unit: 'celsius',
  currency: 'AUD',
  // useGrouping: false,
};

console.log('US: ', new Intl.NumberFormat('en-US', options).format(numTest));
console.log('CN: ', new Intl.NumberFormat('zh-CN', options).format(numTest));
console.log(navigator.language, new Intl.NumberFormat(navigator.language, options).format(numTest));
*/

/*
 //setTimeout - running after setting timer
const ingredients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(function(ing1, ing2){
  return console.log(`Here is your pizza with ${ing1} and ${ing2}`)
}, 2000, ...ingredients)

if (ingredients.includes('spinach')){
  clearTimeout(pizzaTimer);
}

// setInterval - keep runinng after setting timer
setInterval(function(){
  const now = new Date();
  console.log(now);
}, 1000);
*/

//=========================== Number Method ============================
/*
//Conversion
console.log(Number('23'));  //23
console.log(+'23');  //23

//Parsing
console.log(Number.parseInt('30px', 10));//30
console.log(Number.parseInt('e23', 10));//NaN

console.log(Number.parseInt('   2.5rem'   ));//2
console.log(Number.parseFloat('   2.5rem   '));//2.5

//Check if value is NaN
console.log(Number.isNaN(20)); //False
console.log(Number.isNaN('20')); //False
console.log(Number.isNaN(+'20X')); //True
console.log(Number.isNaN(23 / 0)); //Talse

//Check if value is number
console.log(Number.isFinite(20)); //True
console.log(Number.isFinite('20')); //False
console.log(Number.isFinite(+'20X')); //False
console.log(Number.isFinite(23 / 0)); //False

console.log(Number.isInteger(23));//true

//Square root
console.log(Math.sqrt(25));//5
console.log(25 ** (1 / 2));//5
//Cubic root
console.log(8 ** (1 / 3));//2

//Get max or min value 
console.log(Math.max(5, 6, 18, 22, 10, 15)); //22
console.log(Math.min(5, 6, 18, 22, 10, 15)); //5

//Get value between min and max .
const randomInt = function(min, max){
  return Math.trunc(Math.random() * (max - min) + 1) + min;
}
console.log(randomInt(-10,20));

//Rounding integers
//Math.trunc - remove any decimal point.
console.log(Math.trunc(23.3)); //23
//Math.round - round down or up depend on value.
console.log(Math.round(23.3)); //23
console.log(Math.round(23.7)); //24
//Math.ceil - always round up
console.log(Math.ceil(23.3)); //24
console.log(Math.ceil(23.7)); //24
//Math.floor - always round down
console.log(Math.floor(23.3)); //23
console.log(Math.floor(23.7)); //23
//Rounding decimals
//toFixed - always return string.
console.log((2.7).toFixed(0)); //3
console.log((2.7).toFixed(3)); //2.700
console.log((2.345).toFixed(2)); //2.35
console.log(+(2.345).toFixed(2)); //2.35 - using + to convert string to number
//Remainder Operator
console.log(5 % 2); // 5 = 2 * 2 + 1 - result - 1
console.log(8 % 3); // 2
//Check if the number is even or not
const checkEven = function(num){
  return num % 2 === 0;
}
console.log(checkEven(2));// True

//Max safe integer
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);

//If the number large than max safe integer, can use BigInt
console.log(513543624512314231512321512); //not use
console.log(513543624512314231512321512n); //use bigInt
console.log(BigInt(513543624512314231512321512)); //use bigInt 

const huge = 512321513221321312332154212135n;
const regularNum = 23;
console.log(huge * BigInt(regularNum));

// Create a Data!
const now = new Date();
console.log(now);
//Month from 0-11 - so 11 is Dec and etc
console.log(new Date('Aug 02 2020 18:05:41')) //Sun Aug 02 2020 18:05:41 GMT+1000
console.log(new Date('December 24, 2015')) //Thu Dec 24 2015 00:00:00 GMT+1100
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 19, 15, 23, 5)); // Thu Nov 19 2037 15:23:05 GMT+1100

console.log(new Date(0)); // Thu Jan 01 1970 10:00:00 GMT+1000 
console.log(new Date(3 * 24 * 60 * 60 * 1000));// 3 days * 24 hours * 60 mins * 60 second * conver to milliseconds

//Date Method
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);//Thu Nov 19 2037 15:23:00
console.log(future.getFullYear());//2037
console.log(future.getMonth()); //10
console.log(future.getDate()); //19
//getDay() - 0 Sunday, 1 Monday, 2- Tuesday etc
console.log(future.getDay()); //4 - Get day of the week.
console.log(future.getHours()); //15 
console.log(future.getMinutes()); //23
console.log(future.getSeconds()); //0
console.log(future.toISOString()); //2037-11-19T04:23:00.000Z
console.log(future.getTime()); //2142217380000 - date convert to milliseconds - since January 1, 1970
console.log(new Date(2142217380000)); // Thu Nov 19 2037 15:23:00 milliseconds convert to date
console.log(Date.now()); // Give current timestamp

//Set for Date
future.setFullYear(2024);
console.log(future);
*/
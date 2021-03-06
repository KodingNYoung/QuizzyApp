// get the start quiz button
const startBtn = document.getElementById("start-btn");
const quizForm= document.getElementById('quiz-form');
// quiz container div
const quizPage = document.getElementById("quiz-container");
// restart quiz button
const restartBtn = document.querySelector(".result-modal button");

// variables
let quizNumber = 0,
    questions, questionLength, participant, quizMode, timerInterval;

// constant
const categories = {
  'Sports': 21,
  'Video Games': 15,
  'Board Games': 16,
  'General Knoewledge': 9,
  'Computer': 18,
  'Mathematics': 19,
  'Politics': 24,
  'Arts': 25,
  'Science and Nature': 17,
  'Animals': 27,
  'Book': 10,
  'Anime': 31,
  'Music': 12,
  'Film': 11,
  'Cartoons': 32,
};
const RESPONSE_MESSAGES = {
  0: 'success',
  1: 'not enough questions from this category',
  2: 'Invalid parameter(s), check your input and try again',
  3: 'Session token not found',
  4: 'Session token expired'
} 
const timeInSeconds = {
  easy: 15,
  medium: 20,
  hard: 25
};

// function to load all event listeners
const loadListener = () => {   
  //on document load
  document.addEventListener('DOMContentLoaded', handleDOMLoaded) 
  // event listener for the quiz form
  quizForm.addEventListener("submit", handleQuizStart)

  // eventlistener on the quiz conatiner for all buttons
  quizPage.addEventListener("click", handleQuizAction);

  // eventlistener for the restart quiz
  restartBtn.addEventListener("click", goToLandingPage);
}

// handle the DOM loading event
const handleDOMLoaded = () => {
  // load category options
  const categorySelect = document.getElementById('category');
  for (option in categories) {
    // create the element
    const optionUI = document.createElement('option');
    optionUI.value = categories[option];
    optionUI.textContent = option;
    
    // append the element to the parent element
    categorySelect.appendChild(optionUI)
  }
}

//event handler for the start quiz btn
const handleQuizStart = e => {
  e.preventDefault();

  // get the inputted data
  const name = document.getElementById('name');
  const mode = document.getElementById('quiz-mode');
  const category = document.getElementById('category');
  const difficulty = document.getElementById('difficulty');
  const amountOfQuestion = document.getElementById('amount');

  // show spinner
  document.querySelector('.spinner').style.display = 'flex';

  // create a participant object
  participant = new Participant(name.value);

  // set the quiz mode 
  quizMode = mode.value;

  // fetch questions
  fetchQuestions(category.value, difficulty.value, amountOfQuestion.value)
  .then(data => {
    if (data.response_code === 0) {
      questions = data.results
      // remove the spinner
      document.querySelector('.spinner').style.display = 'none';

      // load the question
      loadQuizQuestions(questions);
      
      // move to quiz page
      moveToQuizPage();

      // load user to DOM
      loadUser(participant);
      
      // clear the input
      clearInputs([name, category, difficulty, amountOfQuestion])
    }else {

      throw new Error(RESPONSE_MESSAGES[data.response_code])
    }
  })
  // .catch( err => {
  //   // stop spinner
  //   document.querySelector('.spinner').style.display = 'none';
  //   // look for ways to display the message
  //   showToast(err)

  //   console.log(err)
  // })


  const clearInputs = inputArray => {
    inputArray.forEach(input => {
      input.value = '';
    })
  }
}

const showToast = (message) => {
  // get the toast element

  const toastUI =document.querySelector('.error-toast');
  toastUI.innerHTML = message;
  toastUI.style.display = 'block';

  // remove in 5 secs
  setTimeout(()=> {
    if (document.querySelector('.error-toast')) {
      document.querySelector('.error-toast').style.display = 'none';
    }
  }, 5000)
}
const fetchQuestions =async (category, difficulty, amountOfQuestion) => {
  const requestURL = `https://opentdb.com/api.php?amount=${amountOfQuestion}&category=${category}&difficulty=${difficulty}&type=multiple`;

  const response = await fetch(requestURL)

  const questions = await response.json();

  return questions;
}

const moveToQuizPage = () => {
  // move the quiz page back to translate of 0
  quizPage.style.transition = "transform 0.5s ease";
  quizPage.style.transform = "translateX(0)";
}

// get the quiz questions and load it into the DOM
const loadQuizQuestions = (questions) => {
  // get a random number
  let num = randomNum(questions.length)

  // question length
  questionLength = questions.length;

  // load question to the DOM
  loadToDOM(questions[num]);

  // remove that questions from the list
  questions.splice(num, 1);
}
// generate random number
const randomNum = (limit) => {
    let num;

    num = Math.floor(Math.random() * (limit));

    return num
}
const shuffle = (array) => {
    // initialize a variable to the length of the array , a rndom 
    let currentIndex = array.length,
        temporaryValue, randomIndex;

    while (currentIndex > 0){
        // get a random index between 0 and that current index
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // swap the values at the indexes
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue; 
    }

    return array;
}
// load the question to DOM
const loadToDOM = (questionOBJ) => {
  // get values
  const category = questionOBJ.category;
  const question = questionOBJ.question;
  let options = [...questionOBJ.incorrect_answers, {answer: questionOBJ.correct_answer}];
  
  // increment the quiz number by 1
  quizNumber++;

  // get UI elements
  const categoryUI = document.querySelector("#categoryUI") ;
  const questionUI = document.querySelector("#question-text");
  const optionsUI = document.querySelectorAll(".option");
  const quizNumberUI = document.querySelector(".question-count");
  const questionLengthUI = document.querySelector(".question-length");

  // load the instruction, question and options to the DOM
  categoryUI.textContent = category;
  questionUI.innerHTML = question;
  quizNumberUI.textContent = quizNumber;
  questionLengthUI.textContent = questionLength;
  // to load options
  // first shuffle the options
  options = shuffle(options);
  
  // load options in to the DOM
  optionsUI.forEach((optionUI, index) => {
    if (options[index].answer) {
      optionUI.querySelector('input').value = 1;
      optionUI.querySelector('label').innerHTML = options[index].answer;
    }else {
      optionUI.querySelector('input').value = 0;
      optionUI.querySelector('label').innerHTML = options[index];
    }
  })

  // start timer
  startTimer(questionOBJ.difficulty);
}

const loadUser = (participant) => {
    document.getElementById("score-num").textContent = participant.score;
}

const loadNextQuiz = () => {
  // reset the colors of the options
  resetColors();
  
  // enable all 
  document.querySelectorAll(".option").forEach((optionUI) => {
    optionUI.querySelector('input').disabled = false;
  });

  //update score
  loadUser(participant);
  
  //update quiz number, instruction, question, options
  // get a random number
  let num = randomNum(questions.length)


  // load question to the DOM
  loadToDOM(questions[num]);
  questions.splice(num, 1);
  
  
  //check if it's the last quesion and remove the next button
  if (questions.length === 0){
      // remove the next btn with display none
      document.getElementById("next-question-btn").style.display = "none";
      // show the submit btn
      document.getElementById('submit-quiz-btn').style.display = "inline-flex"
  }
}

// reset the options' colors
const resetColors = () => {
    const optionsUI = document.querySelectorAll(".option");
    
    optionsUI.forEach((optionUI) => {
        optionUI.classList.remove("correct");
        optionUI.classList.remove("wrong");
        optionUI.classList.remove("selected");
        optionUI.children[0].checked = false;

    })
}

// start timer
const startTimer = (difficulty) => {
  // get timer element
  const timerUI = document.getElementById('timer-value');

  let time = timeInSeconds[difficulty];
  // input the value
  timerUI.textContent = time;
  // console.log(timeInSeconds, difficulty)
  // run the timer evry seconds
  timerInterval = setInterval((() => {
    if (time < 1) {
      // show answer
      processAction('check');
      return;
    }
    // if not reduce time by one
    time -= 1;
    // and update it
    timerUI.textContent = time;
  }), 1000)
}

const processAction = action => {
  // get the all the options div, save the checked on and the correct one
  let checkedOption, correctOption;

  const optionsUI = document.querySelectorAll(".option");

  // loop through all the options and get the checked and correct one.
  optionsUI.forEach((optionUI) => {
      if (optionUI.children[0].value === "1") {
          correctOption = optionUI;
      } 
      if(optionUI.children[0].checked === true) {
          checkedOption = optionUI;
      }
  })
  
  if (action === 'check') {
    checkAnswer(checkedOption, correctOption);
  }else {
    calculateScoreAndUpdate(checkedOption, correctOption);
  }

  // disable the radio buttons
  optionsUI.forEach(option => {
    // console.log(option)
    option.querySelector('input').disabled = true;
  })

  // stop the timer
  clearInterval(timerInterval);
}

// calculate score and update it to the participant
const calculateScoreAndUpdate = (checkedOption, correctOption) => {
  // if the checked on is equal to the correct on increase score
  if (checkedOption === correctOption){
    participant.score += 1;
  }else {
    participant.score += 0;    
  }
}

const checkAnswer = (checkedOption, correctOption) => {
  
  if (!(checkedOption === correctOption) && checkedOption){
    checkedOption.classList.add("wrong");
  }
  correctOption.classList.add("correct");
}
// show result modal
const showResultModal = () => {
  document.querySelector(".result-page").style.display = "flex";

  setTimeout(() => {
    document.querySelector(".result-modal").style.transform = "scale(1)";
  },100)
}

// design modal
const designModal = () => {
  let modalState = {};

  // convert participant's score to percentage
  const scorePercentage = (parseFloat(participant.score) *100)/questionLength
  
  // insert all figures
  document.querySelector(".username").textContent = participant.name.toUpperCase();
  document.querySelector(".userscore").textContent = scorePercentage.toFixed(0) + "%";
  document.querySelector(".quiz-number").textContent = quizNumber + " question(s)";
  document.querySelector(".result-page .question-length").textContent = questionLength;
  document.querySelector(".quiz-score").textContent = participant.score;

  // add colors and required gifs
  if (scorePercentage <= 30) {
    modalState = setModalState("#FF6562", "./gifs/nawa.gif")
      
  }else if (scorePercentage > 30 && scorePercentage < 80){
    modalState = setModalState("#104b68", "./gifs/youtried.gif");
  }else{
    modalState = setModalState('#00C07F','./gifs/source.gif');
  }

  document.querySelector(".userscore").parentElement.style.color = modalState.scoreColor;
  document.querySelector(".quiz-score").style.color = modalState.scoreColor;
  document.querySelector(".result-modal img").src = modalState.gifURL;
}
const setModalState = (scoreColor, gifURL) => {
  return { scoreColor, gifURL };
}
// event handler for the quiz page
const handleQuizAction = (e) => {
    // when an option is clicked
    if (e.target.className === "option"){
        // tick that option
        e.target.children[0].checked = true;
    }else if (e.target.id === "quit-btn"){
        // if its a quit button return to start up page
        location.reload();
    }else if(e.target.id === "submit-quiz-btn"){
      processAction('submit');
      // load score to DOM
      loadUser(participant);
      
      // design modal
      designModal();

      // show result modal
      setTimeout(showResultModal, 500);
    }else if(e.target.id === "next-question-btn"){
        processAction('next')

        setTimeout(loadNextQuiz, 500);
    }else if (e.target.id === "check-answer-btn") {
      processAction('check')
    }
}

const goToLandingPage = () => {
    // close modal
    document.querySelector(".result-modal").style.transform = "scale(0)";
    setTimeout(() => {
        location.reload();        
    },100)
}

loadListener();
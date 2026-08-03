const API_URL = 'https://vibe-proxy-gqv4.onrender.com/v1/chat/completions';
const API_HEADERS = {
  'Content-Type': 'application/json',
  Authorization: 'Bearer sk-vibe-summer-2026',
};

const spaceKeywords = [
  'space',
  'planet',
  'moon',
  'mars',
  'astronaut',
  'rocket',
  'satellite',
  'galaxy',
  'star',
  'comet',
  'asteroid',
  'nebula',
  'telescope',
  'orbit',
  'earth',
  'sun',
  'solar',
  'universe',
  'black hole',
  'alien',
  'lunar',
  'jupiter',
  'venus',
  'mercury',
  'neptune',
  'uranus',
  'saturn',
];

const form = document.getElementById('mission-form');
const questionInput = document.getElementById('question');

const cards = {
  1: {
    status: document.getElementById('status-1'),
    body: document.getElementById('body-1'),
  },
  2: {
    status: document.getElementById('status-2'),
    body: document.getElementById('body-2'),
  },
  3: {
    status: document.getElementById('status-3'),
    body: document.getElementById('body-3'),
  },
};

function setCard(agentNumber, statusText, message, tone = 'idle') {
  const card = cards[agentNumber];
  card.status.textContent = statusText;
  card.status.className = `status-pill ${tone}`;
  card.body.textContent = message;
}

function resetCards() {
  setCard(1, 'Waiting', 'Ready to verify the question and collect space facts.', 'idle');
  setCard(2, 'Waiting', 'Waiting for Agent 1 research to build the mission steps.', 'idle');
  setCard(3, 'Waiting', 'Waiting for the full mission summary and fun fact.', 'idle');
}

function isSpaceQuestion(question) {
  const normalized = question.toLowerCase();
  return spaceKeywords.some((keyword) => normalized.includes(keyword));
}

async function callAgent(prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: API_HEADERS,
    body: JSON.stringify({
      model: 'class-chat-model',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || 'No response received.';
}

async function runMissionWorkflow(question) {
  const rejectionMessage = '🚀 Sorry! I only answer space-related questions.';

  if (!isSpaceQuestion(question)) {
    setCard(1, 'Blocked', rejectionMessage, 'error');
    setCard(2, 'Blocked', rejectionMessage, 'error');
    setCard(3, 'Blocked', rejectionMessage, 'error');
    return;
  }

  setCard(1, 'Loading...', 'Agent 1 is checking the question and gathering facts.', 'loading');
  setCard(2, 'Waiting', 'Waiting for Agent 1 research to build the mission steps.', 'idle');
  setCard(3, 'Waiting', 'Waiting for the full mission summary and fun fact.', 'idle');

  try {
    const researchPrompt = `You are Agent 1 - Space Researcher. Verify that the question is about space. Extract the key facts. Do not answer the question directly. Keep the reply simple and friendly. User question: ${question}`;
    const research = await callAgent(researchPrompt);
    setCard(1, 'Completed', research, 'success');

    setCard(2, 'Loading...', 'Agent 2 is turning the research into a mission plan.', 'loading');
    const planPrompt = `You are Agent 2 - Mission Planner. Read this research output and create a mission plan with 4 short steps. Keep it simple. Research: ${research}`;
    const plan = await callAgent(planPrompt);
    setCard(2, 'Completed', plan, 'success');

    setCard(3, 'Loading...', 'Agent 3 is writing the final mission report.', 'loading');
    const reportPrompt = `You are Agent 3 - Mission Commander. Read the research and mission plan, then create a final mission report with a summary and one fun fact. Keep it under 120 words. Research: ${research} Plan: ${plan}`;
    const report = await callAgent(reportPrompt);
    setCard(3, 'Completed', report, 'success');
  } catch (error) {
    setCard(1, 'Error', 'The mission could not be completed. Please try again.', 'error');
    setCard(2, 'Error', 'The mission planner did not finish.', 'error');
    setCard(3, 'Error', 'The mission commander could not report back.', 'error');
    console.error(error);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const question = questionInput.value.trim();

  if (!question) {
    resetCards();
    setCard(1, 'Needs input', 'Please enter a space-related question first.', 'error');
    setCard(2, 'Needs input', 'Please enter a space-related question first.', 'error');
    setCard(3, 'Needs input', 'Please enter a space-related question first.', 'error');
    return;
  }

  await runMissionWorkflow(question);
});

resetCards();
